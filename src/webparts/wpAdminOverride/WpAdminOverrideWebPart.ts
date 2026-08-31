import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { AadHttpClient } from '@microsoft/sp-http';
import AdminOverride from './AdminOverrideUi';
import { SPComponentLoader } from '@microsoft/sp-loader';
import SharedSidebar from '../../SharedSidebar';
import * as strings from 'WpAdminOverrideWebPartStrings';

export interface IWpAdminOverrideWebPartProps {
  description: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Map the API's qualificationTypeId.name → the internal type key used by the UI.
 * Same mapping as the My Qualifications webpart, kept identical so the type
 * dropdown / reference filtering behave the same way here.
 */
function mapTypeName(name: string | undefined): string {
  if (!name) return 'standard';
  const n = name.toLowerCase();
  if (n.indexOf('scheme')   !== -1) return 'scheme';
  if (n.indexOf('test')     !== -1) return 'testMethod';
  if (n.indexOf('standard') !== -1) return 'standard';
  return 'standard';
}

/**
 * Map a qualification level name from the API → the internal checkbox value
 * key used by the UI. Same mapping as My Qualifications.
 */
function normalizeLevelName(name: string | undefined): string {
  if (!name) return '';
  const s = name.toLowerCase().trim();
  if (s === 'employee')                                        return 'employee';
  if (s.indexOf('test') !== -1 || s.indexOf('1') === 0)          return '1_test_associate';
  if (s.indexOf('project') !== -1 || s.indexOf('2') === 0)       return '2_project_handler';
  if (s.indexOf('assessor') !== -1 || s.indexOf('4') === 0)      return '4_verifier_assessor';
  if (s.indexOf('verifier') !== -1 || s.indexOf('3') === 0)      return '3_verifier';
  return s.replace(/[\s\-]+/g, '_');
}

const API_BASE = 'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net';

// GET is confirmed: /api/admin/override. POST/PUT/DELETE payload shapes are
// still TODO — not yet confirmed with the backend team, so
// addAdminOverride/updateAdminOverride/deleteAdminOverride below are still
// best-guess stubs pointed at this same base path.
const ADMIN_OVERRIDE_API = `${API_BASE}/api/admin/override`;

// ─── WebPart ──────────────────────────────────────────────────────────────────

export default class WpAdminOverrideWebPart extends BaseClientSideWebPart<IWpAdminOverrideWebPartProps> {

  private siteUrl: string = '';
  private apiClient!: AadHttpClient;
  private _popstateHandler: (() => void) | null = null;
  private _initFailed = false;
  private readonly _fetchVersions = new Map<string, number>();

  public render(): void {
    const resourceUrl = `${this.siteUrl}/SiteAssets`;

    this.domElement.innerHTML =
      SharedSidebar.getHtml({
        resourceUrl,
        siteUrl: this.siteUrl,
        // NOTE: adjust this key to whatever SharedSidebar expects for the
        // Admin Override nav entry once that entry exists in the sidebar config.
        activeNavItem: 'admin-override',
        activeTabId: 'admin-override-table',
      }) +
      AdminOverride.allElementsHtml.replace(/__KEY_URL_RESOURCE__/g, resourceUrl);

    SharedSidebar.initBehavior(this.domElement, this.siteUrl);
    this.bindAdminOverrideEvents();

    // Toolbar/filters render immediately from static HTML but don't do
    // anything until admin-override.js has loaded AND the table data has
    // arrived — same reasoning as the My Qualifications webpart.
    this.setControlsBusy(true);

    this.loadHomeScripts();
  }

  protected async onInit(): Promise<void> {
    this.siteUrl = this.context.pageContext.web.absoluteUrl;
    this.loadCSS();
    this.preconnectToApi();

    this._popstateHandler = () => {
      // Same reasoning as My Qualifications: SharePoint's soft back/forward
      // nav re-renders this webpart without onInit() running again, so
      // re-acquire the API client rather than trust a possibly stale one.
      this.initApiClient().then(() => this.render());
    };
    window.addEventListener('popstate', this._popstateHandler);

    await this.initApiClient();
  }

  protected onDispose(): void {
    if (this._popstateHandler) {
      window.removeEventListener('popstate', this._popstateHandler);
      this._popstateHandler = null;
    }
    super.onDispose();
  }

  private async initApiClient(retries: number = 2): Promise<void> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        this.apiClient = await this.context.aadHttpClientFactory
          .getClient('api://66eda48a-d5f9-4db0-a911-0d936f8ce92b');
        this._initFailed = false;
        return;
      } catch (err) {
        console.error(`[NEMKO] AAD client init attempt ${attempt + 1}/${retries + 1} failed:`, err);
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    this._initFailed = true;
  }

  private preconnectToApi(): void {
    try {
      const origin = new URL(API_BASE).origin;
      if (document.head.querySelector(`link[rel="preconnect"][href="${origin}"]`)) return;
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    } catch {
      // Non-critical — ignore.
    }
  }

  // ── Shared GET-with-retry helper (same as My Qualifications) ────────────────
  private async getJsonWithRetry(url: string, retries: number = 3, baseDelayMs: number = 1200, perAttemptTimeoutMs: number = 8000): Promise<any> {
    let lastErr: any = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response: any = await Promise.race([
          this.apiClient.get(url, AadHttpClient.configurations.v1),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timed out after ${perAttemptTimeoutMs}ms`)), perAttemptTimeoutMs)
          ),
        ]);
        if (response.ok) {
          return await response.json();
        }
        lastErr = new Error(`API ${response.status}`);
        console.warn(`[NEMKO] GET non-ok (attempt ${attempt + 1}/${retries + 1}): ${url} → ${response.status}`);
      } catch (err) {
        lastErr = err;
        console.error(`[NEMKO] GET error (attempt ${attempt + 1}/${retries + 1}): ${url}`, err);
      }
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, baseDelayMs * (attempt + 1)));
      }
    }
    throw lastErr;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // ── Admin Override table (GET/POST/PUT/DELETE — TODO: backend pending) ────
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * TODO: placeholder until the Admin Override list endpoint exists.
   * Wired up exactly like fetchQualifications() in My Qualifications
   * (page + filters in, populates window.nemkoAdminOverrideRows/Pagination/
   * LoadError out) so admin-override.js can render the table today and
   * nothing needs to change on the JS side once the real endpoint lands —
   * only the URL/query-params and mapAdminOverrideRow() mapping below need
   * updating to match the real response shape.
   */
  private async fetchAdminOverrides(page: number = 1, filters?: { search?: string; sortBy?: string | null; sortOrder?: string | null }): Promise<void> {
    const qs = new URLSearchParams();
    qs.set('page', String(page));
    if (filters?.search)    qs.set('search', filters.search);
    if (filters?.sortBy)    qs.set('sortBy', filters.sortBy);
    if (filters?.sortOrder) qs.set('sortOrder', filters.sortOrder);
    const apiUrl = `${ADMIN_OVERRIDE_API}?${qs.toString()}`;

    if (!this.apiClient) {
      (window as any).nemkoAdminOverrideRows       = [];
      (window as any).nemkoAdminOverridePagination = null;
      (window as any).nemkoAdminOverrideLoadError  = true;
      return;
    }

    try {
      const json = await this.getJsonWithRetry(apiUrl);
      const data  = json?.data;
      const items: any[] = Array.isArray(data) ? data : (data?.items ?? []);
      (window as any).nemkoAdminOverridePagination = Array.isArray(data) ? (json?.pagination ?? null) : (data?.pagination ?? null);
      (window as any).nemkoAdminOverrideRows = items.map((item: any) => this.mapAdminOverrideRow(item));
      (window as any).nemkoAdminOverrideLoadError = false;
    } catch (err) {
      console.error('[NEMKO] fetchAdminOverrides failed after retries:', err);
      (window as any).nemkoAdminOverrideRows       = [];
      (window as any).nemkoAdminOverridePagination = null;
      (window as any).nemkoAdminOverrideLoadError  = true;
    }
  }

  /**
   * employee/office/level/qualification each come back as arrays (matching
   * the API's own response shape) even though this UI only ever assigns one
   * employee and one office per record — take the first element for those two.
   */
  private mapAdminOverrideRow(item: any): object {
    const employeeArr: any[] = Array.isArray(item.employee) ? item.employee : [];
    const officeArr: any[]   = Array.isArray(item.office)   ? item.office   : [];
    const levels: any[]      = Array.isArray(item.level)        ? item.level        : [];
    const qualifications: any[] = Array.isArray(item.qualification) ? item.qualification : [];
    const role = item.role || {};
    const roleKeys: string[] = [];
    if (role.isVerifier)   roleKeys.push('verifier');
    if (role.isAuthorizer) roleKeys.push('authorizer');
    const roleLabels = roleKeys.map((k) => (k === 'verifier' ? 'Verifier' : 'Authorizer'));

    return {
      id:               String(item.id ?? ''),
      employeeId:       employeeArr[0]?.id ?? '',
      employee:         employeeArr[0]?.name ?? '',
      office:           officeArr.map((o: any) => o.name).join(', '),
      officeIds:        officeArr.map((o: any) => o.id),
      qualificationTypeIdNum: item.type?.id ?? '',
      qualificationTypeName:  item.type?.name ?? '',
      qualificationType:      mapTypeName(item.type?.name),
      role:             roleLabels.join(', '),
      roleKeys:         roleKeys,
      levels:           levels.map((l: any) => l.name).join(', '),
      levelIds:         levels.map((l: any) => l.id),
      qualifications:   qualifications.map((q: any) => q.name).join(', '),
      referenceIds:     qualifications.map((q: any) => q.id),
      status:           item.isActive ? 'Active' : 'Inactive',
      statusKey:        item.isActive ? 'active' : 'inactive',
      actions:          'Edit',
    };
  }

  /** TODO: wire up to the real POST endpoint once available. */
  private async addAdminOverride(payload: any): Promise<{ ok: boolean; message?: string }> {
    if (!this.apiClient) return { ok: false, message: 'API client not initialised.' };
    try {
      const response = await this.apiClient.fetch(ADMIN_OVERRIDE_API, AadHttpClient.configurations.v1, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const json = await response.json().catch(() => ({}));
      if (response.ok) return { ok: true };
      return { ok: false, message: json?.message ?? json?.title ?? `Server error ${response.status}` };
    } catch (err) {
      console.error('[NEMKO] addAdminOverride error:', err);
      return { ok: false, message: 'Network error while adding employee.' };
    }
  }

  /** TODO: wire up to the real PUT endpoint once available. */
  private async updateAdminOverride(id: string, payload: any): Promise<{ ok: boolean; message?: string }> {
    if (!this.apiClient) return { ok: false, message: 'API client not initialised.' };
    try {
      const response = await this.apiClient.fetch(`${ADMIN_OVERRIDE_API}/${id}`, AadHttpClient.configurations.v1, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const json = await response.json().catch(() => ({}));
      if (response.ok) return { ok: true };
      return { ok: false, message: json?.message ?? json?.title ?? `Server error ${response.status}` };
    } catch (err) {
      console.error('[NEMKO] updateAdminOverride error:', err);
      return { ok: false, message: 'Network error while updating employee.' };
    }
  }

  /** TODO: wire up to the real DELETE endpoint once available. */
  private async deleteAdminOverride(id: string): Promise<{ ok: boolean; message?: string }> {
    if (!this.apiClient) return { ok: false, message: 'API client not initialised.' };
    try {
      const response = await this.apiClient.fetch(`${ADMIN_OVERRIDE_API}/${id}`, AadHttpClient.configurations.v1, {
        method:  'DELETE',
        headers: { 'Accept': 'text/plain' },
      });
      if (response.ok) return { ok: true };
      const text = await response.text().catch(() => '');
      return { ok: false, message: text || `Server error ${response.status}` };
    } catch (err) {
      console.error('[NEMKO] deleteAdminOverride error:', err);
      return { ok: false, message: 'Network error while deleting record.' };
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // ── Reference-data: shared paginated fetcher (same pattern as My Qualifications) ─
  // ═════════════════════════════════════════════════════════════════════════

  private async fetchRefData(apiUrl: string, windowKey: string, mapFn: (item: any) => any): Promise<void> {
    if (!this.apiClient) { (window as any)[windowKey] = []; return; }
    try {
      const response = await this.apiClient.get(apiUrl, AadHttpClient.configurations.v1);
      if (!response.ok) { (window as any)[windowKey] = []; return; }
      const json = await response.json();
      const raw: any[] = json?.data?.items ?? (Array.isArray(json?.data) ? json.data : (Array.isArray(json?.items) ? json.items : []));
      (window as any)[windowKey] = raw.map(mapFn);
    } catch (err) {
      console.error('[NEMKO] fetchRefData error:', err);
      (window as any)[windowKey] = [];
    }
  }

  private async fetchPaginated(
    buildUrl: (page: number) => string,
    windowItemsKey: string,
    windowPagKey: string,
    mapFn: (item: any) => any,
    page: number,
    meta: any,
    append: boolean,
    prependAllOnFirstPage: boolean = false
  ): Promise<void> {
    const version = (this._fetchVersions.get(windowItemsKey) ?? 0) + 1;
    this._fetchVersions.set(windowItemsKey, version);

    if (!append) {
      (window as any)[windowItemsKey] = null; // signals "Loading..." for the initial page
    }
    (window as any)[windowPagKey] = { ...meta, page, hasMore: true, loading: true };

    if (!this.apiClient) {
      (window as any)[windowItemsKey] = append ? ((window as any)[windowItemsKey] ?? []) : [];
      (window as any)[windowPagKey] = { ...meta, page, hasMore: false, loading: false };
      return;
    }

    const extractItems = (json: any): any[] =>
      json?.data?.items ?? (Array.isArray(json?.data) ? json.data : (Array.isArray(json?.items) ? json.items : []));

    try {
      const resp = await this.apiClient.get(buildUrl(page), AadHttpClient.configurations.v1);
      if (this._fetchVersions.get(windowItemsKey) !== version) return;

      if (!resp.ok) {
        (window as any)[windowItemsKey] = append ? ((window as any)[windowItemsKey] ?? []) : [];
        (window as any)[windowPagKey] = { ...meta, page, hasMore: false, loading: false };
        return;
      }

      const json = await resp.json();
      let newItems = extractItems(json).map(mapFn);
      // "All" is a synthetic UI-only option, not something the API returns —
      // prepend it once, only on an unfiltered/unsearched first page, so it
      // always sorts first without needing server-side support for it.
      if (prependAllOnFirstPage && page === 1 && !append && !(meta && meta.search)) {
        newItems = [{ id: '', title: 'All' }].concat(newItems);
      }
      const hasMore = json?.data?.pagination?.hasMore === true;

      const existing: any[] = append ? ((window as any)[windowItemsKey] ?? []) : [];
      (window as any)[windowItemsKey] = existing.concat(newItems);
      (window as any)[windowPagKey] = { ...meta, page, hasMore, loading: false };
    } catch (err) {
      console.error('[NEMKO] fetchPaginated error:', err);
      if (this._fetchVersions.get(windowItemsKey) === version) {
        (window as any)[windowItemsKey] = append ? ((window as any)[windowItemsKey] ?? []) : [];
        (window as any)[windowPagKey] = { ...meta, page, hasMore: false, loading: false };
      }
    }
  }

  // ── Qualification Type / Level (identical source APIs to My Qualifications) ─
  private fetchQualificationTypes(): Promise<void> {
    return this.fetchRefData(
      `${API_BASE}/api/reference-data/qualification-type`,
      'nemkoQualificationTypes',
      (item: any) => ({ id: item.id, name: item.name ?? '', key: mapTypeName(item.name) })
    );
  }

  private fetchQualificationLevels(): Promise<void> {
    return this.fetchRefData(
      `${API_BASE}/api/reference-data/qualification-level`,
      'nemkoQualificationLevels',
      (item: any) => ({ id: item.id, name: item.name ?? '', key: normalizeLevelName(item.name) })
    );
  }

  // Fetched once (cached) and exposed to admin-override.js as
  // nemkoEnsureAdminOverrideRefData() so the Add/Edit modal can await it
  // before populating the type dropdown / level checkboxes.
  private _refDataPromise: Promise<void> | null = null;

  private ensureRefData(): Promise<void> {
    if (!this._refDataPromise) {
      this._refDataPromise = Promise.all([
        this.fetchQualificationLevels(),
        this.fetchQualificationTypes(),
      ])
        .then(() => undefined)
        .catch((err) => {
          console.error('[NEMKO] Failed to load qualification levels/types:', err);
          this._refDataPromise = null;
          throw err;
        });
    }
    return this._refDataPromise;
  }

  // ── Qualification Reference (multi-select, filtered by type, "All" prepended) ─
  private readonly _refCache = new Map<string, any[]>();

  private async fetchQualificationReferences(typeKey: string, search: string = ''): Promise<void> {
    const cacheKey = `${typeKey}::${search}`;
    if (!search && this._refCache.has(typeKey)) {
      (window as any).nemkoReferenceItems = this._refCache.get(typeKey);
      (window as any).nemkoReferencePagination = { typeKey, search: '', page: 1, hasMore: false, loading: false };
      return;
    }
    const types: any[] = (window as any).nemkoQualificationTypes ?? [];
    let apiTypeParam = typeKey;
    for (let i = 0; i < types.length; i++) {
      if (types[i].key === typeKey) { apiTypeParam = (types[i].name || typeKey).replace(/\s+/g, ''); break; }
    }
    await this.fetchPaginated(
      (page) => {
        const qs = new URLSearchParams();
        qs.set('qualificationType', apiTypeParam + 'Id');
        qs.set('page', String(page));
        if (search) qs.set('search', search);
        return `${API_BASE}/api/reference-data/qualification-reference?${qs.toString()}`;
      },
      'nemkoReferenceItems',
      'nemkoReferencePagination',
      (item: any) => ({ id: item.id, title: item.name ?? '' }),
      1,
      { typeKey, search },
      false,
      true // prepend "All"
    );
    if (!search && (window as any).nemkoReferencePagination?.hasMore === false) {
      this._refCache.set(cacheKey, (window as any).nemkoReferenceItems ?? []);
    }
  }

  private async fetchQualificationReferencesNextPage(): Promise<void> {
    const pag = (window as any).nemkoReferencePagination;
    if (!pag || pag.loading || pag.hasMore === false) return;
    const types: any[] = (window as any).nemkoQualificationTypes ?? [];
    let apiTypeParam = pag.typeKey;
    for (let i = 0; i < types.length; i++) {
      if (types[i].key === pag.typeKey) { apiTypeParam = (types[i].name || pag.typeKey).replace(/\s+/g, ''); break; }
    }
    const nextPage = (pag.page ?? 1) + 1;
    const search = pag.search;
    await this.fetchPaginated(
      (page) => {
        const qs = new URLSearchParams();
        qs.set('qualificationType', apiTypeParam + 'Id');
        qs.set('page', String(page));
        if (search) qs.set('search', search);
        return `${API_BASE}/api/reference-data/qualification-reference?${qs.toString()}`;
      },
      'nemkoReferenceItems',
      'nemkoReferencePagination',
      (item: any) => ({ id: item.id, title: item.name ?? '' }),
      nextPage,
      { typeKey: pag.typeKey, search },
      true,
      true
    );
  }

  // ── Employee (single-select search, no "All") ───────────────────────────────
  private async fetchEmployees(search: string = ''): Promise<void> {
    await this.fetchPaginated(
      (page) => {
        const qs = new URLSearchParams();
        qs.set('page', String(page));
        if (search) qs.set('search', search);
        return `${API_BASE}/api/reference-data/Employee?${qs.toString()}`;
      },
      'nemkoEmployeeSearchItems',
      'nemkoEmployeeSearchPagination',
      (item: any) => ({ id: item.id, title: item.name ?? '' }),
      1,
      { search },
      false,
      false
    );
  }

  private async fetchEmployeesNextPage(): Promise<void> {
    const pag = (window as any).nemkoEmployeeSearchPagination;
    if (!pag || pag.loading || pag.hasMore === false) return;
    const nextPage = (pag.page ?? 1) + 1;
    const search = pag.search;
    await this.fetchPaginated(
      (page) => {
        const qs = new URLSearchParams();
        qs.set('page', String(page));
        if (search) qs.set('search', search);
        return `${API_BASE}/api/reference-data/Employee?${qs.toString()}`;
      },
      'nemkoEmployeeSearchItems',
      'nemkoEmployeeSearchPagination',
      (item: any) => ({ id: item.id, title: item.name ?? '' }),
      nextPage,
      { search },
      true,
      false
    );
  }

  // ── Office (single-select search, "All" prepended) ──────────────────────────
  private async fetchOffices(search: string = ''): Promise<void> {
    await this.fetchPaginated(
      (page) => {
        const qs = new URLSearchParams();
        qs.set('page', String(page));
        if (search) qs.set('search', search);
        return `${API_BASE}/api/reference-data/office?${qs.toString()}`;
      },
      'nemkoOfficeItems',
      'nemkoOfficePagination',
      (item: any) => ({ id: item.id, title: item.name ?? '' }),
      1,
      { search },
      false,
      true // prepend "All"
    );
  }

  private async fetchOfficesNextPage(): Promise<void> {
    const pag = (window as any).nemkoOfficePagination;
    if (!pag || pag.loading || pag.hasMore === false) return;
    const nextPage = (pag.page ?? 1) + 1;
    const search = pag.search;
    await this.fetchPaginated(
      (page) => {
        const qs = new URLSearchParams();
        qs.set('page', String(page));
        if (search) qs.set('search', search);
        return `${API_BASE}/api/reference-data/office?${qs.toString()}`;
      },
      'nemkoOfficeItems',
      'nemkoOfficePagination',
      (item: any) => ({ id: item.id, title: item.name ?? '' }),
      nextPage,
      { search },
      true,
      true
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // ── Globals exposed to admin-override.js ───────────────────────────────────
  // ═════════════════════════════════════════════════════════════════════════

  private bindAdminOverrideEvents(): void {
    (window as any).nemkoFetchAdminOverridesPage = (page: number, filters?: any): Promise<void> =>
      this.fetchAdminOverrides(page, filters);

    (window as any).nemkoAddAdminOverride = (payload: any) => this.addAdminOverride(payload);
    (window as any).nemkoUpdateAdminOverride = (id: string, payload: any) => this.updateAdminOverride(id, payload);
    (window as any).nemkoDeleteAdminOverride = (id: string) => this.deleteAdminOverride(id);

    (window as any).nemkoEnsureAdminOverrideRefData = (): Promise<void> => this.ensureRefData();

    (window as any).nemkoFetchQualificationReferences = (typeKey: string, search?: string): Promise<void> =>
      this.fetchQualificationReferences(typeKey, search);
    (window as any).nemkoFetchQualificationReferencesNextPage = (): Promise<void> =>
      this.fetchQualificationReferencesNextPage();

    (window as any).nemkoFetchEmployees = (search?: string): Promise<void> => this.fetchEmployees(search);
    (window as any).nemkoFetchEmployeesNextPage = (): Promise<void> => this.fetchEmployeesNextPage();

    (window as any).nemkoFetchOffices = (search?: string): Promise<void> => this.fetchOffices(search);
    (window as any).nemkoFetchOfficesNextPage = (): Promise<void> => this.fetchOfficesNextPage();
  }

  // ═════════════════════════════════════════════════════════════════════════
  // ── Controls busy state / script loading (same pattern as My Qualifications) ─
  // ═════════════════════════════════════════════════════════════════════════

  private setControlsBusy(busy: boolean): void {
    const applyToControls = (root: HTMLElement): void => {
      root.style.pointerEvents = busy ? 'none' : '';
      root.querySelectorAll('input, select, button').forEach((ctrl) => {
        const el = ctrl as HTMLElement;
        if (busy) {
          el.setAttribute('aria-disabled', 'true');
          el.setAttribute('tabindex', '-1');
        } else {
          el.removeAttribute('aria-disabled');
          el.removeAttribute('tabindex');
        }
      });
    };

    const toolbar = this.domElement.querySelector('#adminOverrideToolbar') as HTMLElement;
    if (toolbar) {
      toolbar.setAttribute('aria-busy', busy ? 'true' : 'false');
      applyToControls(toolbar);
    }

    this.domElement.querySelectorAll('.nemko-table-top-filter-wrapper').forEach((wrapper) => {
      applyToControls(wrapper as HTMLElement);
    });
  }

  private loadCSS(): void {
    SPComponentLoader.loadCss(`${this.siteUrl}/SiteAssets/resources/css/qualification-db.css`);
    SPComponentLoader.loadCss(`${this.siteUrl}/SiteAssets/resources/css/nemko-modal.css`);
  }

  private showTableError(): void {
    const tbodies = this.domElement.querySelectorAll('.nemko-table-container tbody');
    tbodies.forEach(tbody => {
      tbody.innerHTML =
        '<tr><td colspan="20" style="text-align:center;padding:2rem;color:#696A6E;">Failed to load data. Please refresh the page.</td></tr>';
    });
  }

  private loadHomeScripts(): void {
    const siteAssetsUrl = `${this.siteUrl}/SiteAssets`;

    // No jQuery UI needed here — this modal has no date fields, so unlike
    // My Qualifications there's nothing that depends on the datepicker.
    const scriptsPromise = SPComponentLoader.loadScript(`${siteAssetsUrl}/resources/js/admin-override.js`);

    let controlsReleased = false;
    const releaseControls = (): void => {
      if (controlsReleased) return;
      controlsReleased = true;
      this.setControlsBusy(false);
    };

    if (this._initFailed) {
      scriptsPromise
        .then(() => this.showTableError())
        .catch(err => console.error('[NEMKO] JS Load Error:', err))
        .then(() => releaseControls());
      return;
    }

    // Warm the type/level ref-data cache in the background, same reasoning
    // as My Qualifications — the modal awaits this same cached promise so
    // it opens instantly once the page has loaded.
    this.ensureRefData().catch(() => { /* modal-open path will retry */ });

    const dataPromise = this.fetchAdminOverrides();

    Promise.all([scriptsPromise, dataPromise])
      .then(() => {
        if (typeof (window as any).initAdminOverride === 'function') {
          (window as any).initAdminOverride();
        } else {
          console.error('[NEMKO] initAdminOverride not found after load');
        }

        const params = new URLSearchParams(window.location.search);
        if (params.get('modal') === 'addEmployee') {
          const btn = this.domElement.querySelector('[data-bs-target="#addEmployeeModal"]') as HTMLElement;
          if (btn) {
            requestAnimationFrame(() => {
              btn.click();
              const url = new URL(window.location.href);
              url.searchParams.delete('modal');
              window.history.replaceState({}, '', url.toString());
            });
          }
        }
      })
      .catch(err => {
        console.error('[NEMKO] JS Load Error:', err);
        this.showTableError();
      })
      .then(() => releaseControls());

    setTimeout(() => {
      if (!controlsReleased) {
        console.error('[NEMKO] Admin Override page took too long to load — releasing controls so the page is not stuck.');
        releaseControls();
      }
    }, 20000);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [{
        header: { description: strings.PropertyPaneDescription },
        groups: [{
          groupName: strings.BasicGroupName,
          groupFields: [
            PropertyPaneTextField('description', { label: strings.DescriptionFieldLabel })
          ]
        }]
      }]
    };
  }
}
