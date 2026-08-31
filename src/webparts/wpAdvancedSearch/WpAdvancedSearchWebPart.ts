import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import AdvancedSearch from './AdvancedSearchUi';
import { SPComponentLoader } from '@microsoft/sp-loader';
import SharedSidebar from '../../SharedSidebar';
import NemkoAdminCheck from '../../NemkoAdminCheck';
import * as strings from 'WpAdvancedSearchWebPartStrings';
import { AadHttpClient, IHttpClientOptions } from '@microsoft/sp-http';


export interface IWpAdvancedSearchWebPartProps {
  description: string;
}

const API_BASE = 'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net';

export default class WpAdvancedSearchWebPart extends BaseClientSideWebPart<IWpAdvancedSearchWebPartProps> {
  private siteUrl: string = '';
  private apiClient!: AadHttpClient;
  private currentImportType: 'standard' | 'scheme' | 'testmethod' | 'employee' = 'standard';

  // ── Cache of each import type's column names, populated on demand from
  //    GET /api/ImportMetadata/columns/{importType} (used to render the
  //    per-type information modal tables). ─────────────────────────────────
  private _importColumnsCache: Record<string, string[]> = {};

  private isAdminUser: boolean | null = null;
  private activeQualificationDetailsId: string = '';
  private _popstateHandler: (() => void) | null = null;
  private _initFailed = false;
  private readonly _fetchVersions = new Map<string, number>();
  private readonly _filterCache = new Map<string, any[]>();

  public render(): void {
    const resourceUrl = `${this.siteUrl}/SiteAssets`;

    this.domElement.innerHTML =
      SharedSidebar.getHtml({
        resourceUrl,
        siteUrl: this.siteUrl,
        activeNavItem: 'advanced-search',
        activeTabId: 'advanced-search-table',
      }) +
      AdvancedSearch.allElementsHtml.replace(/__KEY_URL_RESOURCE__/g, resourceUrl);

    SharedSidebar.initBehavior(this.domElement, this.siteUrl);
    this.bindImportModal();
    this.loadHomeScripts();
    this.applyAdminVisibility().catch(() => { /* keep buttons hidden */ });
  }

  private async applyAdminVisibility(): Promise<void> {
    if (this.isAdminUser === null) {
      this.isAdminUser = await NemkoAdminCheck.isAdmin(this.siteUrl);
    }
    (window as any).nemkoIsAdminUser = this.isAdminUser;

    // AFTER
    const selectors = [
      '[data-bs-target="#createStandaredModal"]',
      '[data-bs-target="#createSchemeModal"]',
      '[data-bs-target="#createTestmethodModal"]',
      '.db-employee-activate-all-btn',
      '#import-standard-btn',
      '#import-scheme-btn',
      '#import-test-method-btn',
      '#import-employee-btn',
      '#export-advanced-search-btn',
      '#export-standard-btn',
      '#export-scheme-btn',
      '#export-test-method-btn',
      '#export-employee-btn',
    ];
    selectors.forEach(sel => {
      const btn = this.domElement.querySelector<HTMLElement>(sel);
      if (btn) btn.style.display = this.isAdminUser ? '' : 'none';
    });

    if (!this.isAdminUser) {
      const editModalIds = ['editStandaredModal', 'editSchemeModal', 'editTestmethodModal'];
      editModalIds.forEach(modalId => {
        const modal = this.domElement.querySelector<HTMLElement>('#' + modalId);
        if (!modal) return;

        const saveBtn = modal.querySelector<HTMLElement>('.nemko-btn-save');
        if (saveBtn) saveBtn.style.display = 'none';

        modal.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
          'input:not([type="hidden"]), select, textarea'
        ).forEach(el => {
          if (el instanceof HTMLSelectElement) {
            el.disabled = true;
          } else if (el.classList.contains('nemko-ss-display')) {
            // Custom search-select display fields (e.g. product category) open
            // their suggestion dropdown on focus, which readOnly does not
            // suppress. Disable them instead so they can't be focused/clicked.
            (el as HTMLInputElement).disabled = true;
          } else {
            el.readOnly = true;
          }
        });

        modal.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach(el => {
          el.disabled = true;
        });
      });
    }
  }

  protected async onInit(): Promise<void> {
    this.siteUrl = this.context.pageContext.web.absoluteUrl;
    this.loadCSS();

    this._popstateHandler = () => { this.render(); };
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

  // ── Advanced Search: MyQualifications ────────────────────────────────────────
  private async fetchQualifications(searchParams?: {
    search?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
    status?: boolean;
    conformityStatement?: boolean;
    certificationDecision?: boolean;
    qualificationLevel?: number;
    reportApprover?: boolean;
    standard?: { id: number; value: string }[];
    scheme?: { id: number; value: string }[];
    testMethod?: { id: number; value: string }[];
    employee?: { id: number; value: string }[];
    office?: { id: number; value: string }[];
    columnTextSearches?: {
      columnName: string;
      searchText: string;
    }[];
  }): Promise<void> {
    const apiUrl = `${API_BASE}/api/qualification/search`;

    if (!this.apiClient) {
      (window as any).nemkoTableRows = [];
      return;
    }

    try {
      const body = {
        search: searchParams?.search ?? '',
        page: searchParams?.page ?? 1,
        pageSize: searchParams?.pageSize ?? 20,
        sortBy: searchParams?.sortBy ?? '',
        sortOrder: searchParams?.sortOrder ?? '',
        ...(searchParams?.status !== undefined && { status: searchParams.status }),
        ...(searchParams?.conformityStatement !== undefined && { conformityStatement: searchParams.conformityStatement }),
        ...(searchParams?.certificationDecision !== undefined && { certificationDecision: searchParams.certificationDecision }),
        ...(searchParams?.qualificationLevel !== undefined && { qualificationLevel: searchParams.qualificationLevel }),
        ...(searchParams?.reportApprover !== undefined && { reportApprover: searchParams.reportApprover }),
        standard: searchParams?.standard ?? [],
        scheme: searchParams?.scheme ?? [],
        testMethod: searchParams?.testMethod ?? [],
        employee: searchParams?.employee ?? [],
        office: searchParams?.office ?? [],
        columnTextSearches: searchParams?.columnTextSearches ?? []
      };

      const response = await this.apiClient.post(
        apiUrl,
        AadHttpClient.configurations.v1,
        {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        (window as any).nemkoTableRows = [];
        (window as any).nemkoTablePagination = null;
        return;
      }

      const json = await response.json();
      const items: any[] = json?.data?.items ?? [];

      (window as any).nemkoTableRows = items.map((item: any) => ({
        id: String(item.qualificationId ?? ''),
        employee: item.appliedBy?.name ?? '',
        reqEmail: item.appliedBy?.email ?? '',                          // for details modal
        office: item.appliedBy?.office ?? '',
        appliedBy: item.appliedBy ?? null,
        type: item.qualificationTypeId?.name ?? '',
        qualifications: item.qualificationReference?.name ?? '',
        level: item.qualificationLevel?.name ?? '',
        status: item.qualificationStatus?.name ?? '',
        statusActive: item.qualificationStatus?.isActive == true ? 'Yes' : item.qualificationStatus?.isActive == false ? 'No' : '',
        report: item.reportApprover === true ? 'Yes' : item.reportApprover === false ? 'No' : '',
        certification: item.certificationDecision === true ? 'Yes' : item.certificationDecision === false ? 'No' : '',
        conformity: item.confirmityStatement === true ? 'Yes' : item.confirmityStatement === false ? 'No' : '',
        limitations: item.limitations ?? '',
        remarks: item.remarks ?? '',
        verifiedBy: Array.isArray(item.verifier)
          ? item.verifier.map((v: any) => v.name).join(', ')
          : '',
        verifiedByEmail: Array.isArray(item.verifier) ? item.verifier.map((v: any) => v.email).join(', ') : '',              // for details modal
        authorizedBy: Array.isArray(item.authorizer)
          ? item.authorizer.map((a: any) => a.name).join(', ')
          : '',
        authorizedByEmail: Array.isArray(item.authorizer) ? item.authorizer.map((a: any) => a.email).join(', ') : '',          // for details modal
        verifierLimitations: item.verifierLimitations ?? '',           // for details modal
        authorizerLimitations: item.authorizerLimitations ?? '',       // for details modal
        targetAchieveDate: item.targetAchieveDate?.split('T')[0] ?? '', // for details modal
        withdrawnDate: item.withdrawnDate ?? '',
        qualifiedDate: item.qualifiedDate ?? '',
        withdrawn: item.withdrawn ?? false,
      }));

      (window as any).nemkoTablePagination = json?.data?.pagination ?? null;

    } catch (err) {
      console.error('fetchQualifications error:', err);
      (window as any).nemkoTableRows = [];
      (window as any).nemkoTablePagination = null;
    }
  }


  private async fetchQualificationDetails(id: string): Promise<void> {
    const apiUrl = `${API_BASE}/api/qualification/${id}`;
    this.activeQualificationDetailsId = id;

    if (!this.apiClient) {
      (window as any).nemkoQualificationDetail = null;
      return;
    }

    try {
      const response = await this.apiClient.get(apiUrl, AadHttpClient.configurations.v1);
      if (!response.ok) {
        (window as any).nemkoQualificationDetail = null;
        return;
      }
      const json = await response.json();
      const item = json?.data ?? null;
      if (!item) {
        (window as any).nemkoQualificationDetail = null;
        return;
      }

      const appliedBy = item.appliedBy ?? {};
      const statusName: string = item.qualificationStatus?.name ?? '';
      const isActive = item.qualificationStatus?.isActive;
      const verifierNames = Array.isArray(item.verifier) ? item.verifier.map((v: any) => v.name).join(', ') : '';
      const authorizerNames = Array.isArray(item.authorizer) ? item.authorizer.map((a: any) => a.name).join(', ') : '';
      const verifierEmail = Array.isArray(item.verifier) ? (item.verifier[0]?.email ?? '') : '';
      const authorizerEmail = Array.isArray(item.authorizer) ? (item.authorizer[0]?.email ?? '') : '';

      (window as any).nemkoQualificationDetail = {
        qualificationId: item.qualificationId ?? '',
        requestedBy: appliedBy.name ?? '',
        requestedByEmail: appliedBy.email ?? '',
        localUnit: item.localUnit ?? '',
        qualificationStatus: { value: statusName },
        activeStatus: { value: isActive === true ? 'Yes' : isActive === false ? 'No' : '' },
        verifiedBy: { name: verifierNames, email: verifierEmail },
        authorizedBy: { name: authorizerNames, email: authorizerEmail },
        authorizedDate: item.qualifiedDate ?? '',
        qualificationReference: { value: item.qualificationReference?.name ?? '' },
        level: { value: item.qualificationLevel?.name ?? '' },
        conformityStatement: (item.confirmityStatement ?? item.conformityStatement) === true ? 'Yes' : 'No',
        certificationDecision: item.certificationDecision === true ? 'Yes' : 'No',
        reportApprover: item.reportApprover === true ? 'Yes' : 'No',
        remarks: item.remarks ?? '',
        limitations: item.authorizerLimitations ?? '', // Limitations field is sourced from authorizerLimitations
        verifierLimitations: item.verifierLimitations ?? '',
        authorizerLimitations: item.authorizerLimitations ?? '',
        type: item.qualificationTypeId?.name ?? '',
        withdrawn: item.withdrawn ?? false,
      };
    } catch (err) {
      console.error('[NEMKO] fetchQualificationDetails error:', err);
      (window as any).nemkoQualificationDetail = null;
    }
  }

  // ── Withdraw (Qualification Details modal) ──────────────────────────────────
  // Same API contract as the My Verification & Authorization webpart:
  // PUT /api/qualification/Operation with status: 'withdraw'.
  private async apiWithdrawQualification(qualificationId: number): Promise<void> {
    if (!this.apiClient) return;
    const url = `${API_BASE}/api/qualification/Operation`;
    const response = await this.apiClient.fetch(url, AadHttpClient.configurations.v1, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        qualificationId: [qualificationId],
        status: 'withdraw'
      })
    });
    if (!response.ok) {
      throw new Error(`API ${response.status}`);
    }
  }

  private withdrawFromQualificationDetailsModal(): void {
    const id = this.activeQualificationDetailsId;
    if (!id) { this.closeModal('detailsQualificationModal'); return; }

    const detail = (window as any).nemkoQualificationDetail;
    const qualificationName: string = detail?.qualificationReference?.value ?? '';

    if (!confirm(`Do you want to withdraw the qualification - ${qualificationName}?`)) return;

    this.apiWithdrawQualification(Number(id))
      .then(() => {
        this.closeModal('detailsQualificationModal');
        alert('Qualification has been withdrawn successfully.');
        (window as any)._nemkoAdvSearch?.refreshQualifications?.();
      })
      .catch(err => {
        console.error('[NEMKO] Withdraw failed:', err);
        alert('Failed to withdraw qualification. Please try again.');
      });
  }



  // ── Reference-data Filter Fetchers (used by advanced-search filter dropdowns) ──
  // Separate from DB-table fetchers — always full reference catalogue, not paginated.

  // ── Reference-data Filter Fetchers (used by the shared select modal picker) ──
  // Infinite-scroll: fetches ONE page at a time. window[windowKey] accumulates
  // items (replaced on page 1 / new search, appended on subsequent pages) and
  // window[windowKey + 'Pagination'] holds { endpoint, search, page, hasMore, loading }
  // so the JS layer knows when/whether to request the next page on scroll.

  private async fetchFilterPage(
    endpoint: string,
    windowKey: string,
    page: number,
    search: string,
    append: boolean
  ): Promise<void> {
    const version = (this._fetchVersions.get(windowKey) ?? 0) + 1;
    this._fetchVersions.set(windowKey, version);

    if (!append) (window as any)[windowKey] = null; // "Loading..." signal for page 1
    (window as any)[`${windowKey}Pagination`] = { endpoint, search, page, hasMore: true, loading: true };

    if (!this.apiClient) {
      (window as any)[windowKey] = append ? ((window as any)[windowKey] ?? []) : [];
      (window as any)[`${windowKey}Pagination`] = { endpoint, search, page, hasMore: false, loading: false };
      return;
    }

    try {
      const qs = new URLSearchParams();
      qs.set('page', String(page));
      if (search) qs.set('search', search);
      const url = `${API_BASE}/api/reference-data/${endpoint}?${qs.toString()}`;

      const resp = await this.apiClient.get(url, AadHttpClient.configurations.v1);
      if (this._fetchVersions.get(windowKey) !== version) return;

      if (!resp.ok) {
        (window as any)[windowKey] = append ? ((window as any)[windowKey] ?? []) : [];
        (window as any)[`${windowKey}Pagination`] = { endpoint, search, page, hasMore: false, loading: false };
        return;
      }

      const json = await resp.json();
      const newItems = (json?.data?.items ?? []).map((item: any) => ({ id: item.id, title: item.name ?? '' }));
      const hasMore = json?.data?.pagination?.hasMore === true;

      const existing: any[] = append ? ((window as any)[windowKey] ?? []) : [];
      (window as any)[windowKey] = existing.concat(newItems);
      (window as any)[`${windowKey}Pagination`] = { endpoint, search, page, hasMore, loading: false };
    } catch (err) {
      console.error(`fetchFilterPage(${endpoint}) error:`, err);
      if (this._fetchVersions.get(windowKey) === version) {
        (window as any)[windowKey] = append ? ((window as any)[windowKey] ?? []) : [];
        (window as any)[`${windowKey}Pagination`] = { endpoint, search, page, hasMore: false, loading: false };
      }
    }
  }

  // Loads page 1 (fresh list or new search). Cached once fully paged through.
  private async fetchFilterReferenceData(endpoint: string, windowKey: string, search?: string): Promise<void> {
    const s = search ?? '';
    const cacheKey = `${endpoint}_${s}`;
    if (!s && this._filterCache.has(cacheKey)) {
      (window as any)[windowKey] = this._filterCache.get(cacheKey);
      (window as any)[`${windowKey}Pagination`] = { endpoint, search: '', page: 1, hasMore: false, loading: false };
      return;
    }

    await this.fetchFilterPage(endpoint, windowKey, 1, s, false);

    if (!s && (window as any)[`${windowKey}Pagination`]?.hasMore === false) {
      this._filterCache.set(cacheKey, (window as any)[windowKey] ?? []);
    }
  }

  // Loads the next page of whatever list/search is currently open in the shared
  // select modal. No-ops if already loading or there is no more data.
  private async fetchFilterReferenceDataNextPage(windowKey: string): Promise<void> {
    const pag = (window as any)[`${windowKey}Pagination`];
    if (!pag || pag.loading || pag.hasMore === false) return;
    const nextPage = (pag.page ?? 1) + 1;

    await this.fetchFilterPage(pag.endpoint, windowKey, nextPage, pag.search, true);

    const cacheKey = `${pag.endpoint}_${pag.search ?? ''}`;
    if (!pag.search && (window as any)[`${windowKey}Pagination`]?.hasMore === false) {
      this._filterCache.set(cacheKey, (window as any)[windowKey] ?? []);
    }
  }

  private fetchFilterStandards(): Promise<void> { return this.fetchFilterReferenceData('standard', 'nemkoFilterStandardItems'); }
  private fetchFilterSchemes(): Promise<void> { return this.fetchFilterReferenceData('scheme', 'nemkoFilterSchemeItems'); }
  private fetchFilterTestMethods(): Promise<void> { return this.fetchFilterReferenceData('test-method', 'nemkoFilterTestMethodItems'); }
  private fetchFilterEmployees(): Promise<void> { return this.fetchFilterReferenceData('Employee', 'nemkoFilterEmployeeItems'); }
  private fetchFilterOffices(): Promise<void> { return this.fetchFilterReferenceData('office', 'nemkoFilterOfficeItems'); }

  // ── Qualification Level Fetch (lazy — first fired when the '#f-level'
  // dropdown is focused; guarded the same way fetchProductCategoriesFirstPage
  // is, so repeated focuses don't re-fetch). ──────────────────────────────────
  private async fetchQualificationLevels(): Promise<void> {
    if ((window as any).nemkoQualificationLevels) return;
    const apiUrl = `${API_BASE}/api/reference-data/qualification-level`;
    if (!this.apiClient) { (window as any).nemkoQualificationLevels = []; return; }
    try {
      const response = await this.apiClient.get(apiUrl, AadHttpClient.configurations.v1);
      if (!response.ok) { (window as any).nemkoQualificationLevels = []; return; }
      const json = await response.json();
      const items = json?.data?.items ?? [];
      (window as any).nemkoQualificationLevels = items.map((item: any) => ({
        id: item.id,
        name: item.name ?? '',
      }));
    } catch (err) {
      console.error('fetchQualificationLevels error:', err);
      (window as any).nemkoQualificationLevels = [];
    }
  }

  // ── Product Category Fetch (feeds the search-select widgets in create/edit
  // Standard, create/edit Test Method, and the Test Method DB-tab filter).
  // Every keystroke (debounced in the JS layer) re-hits the API with
  // ?search={input text} instead of filtering a client-side cache; further
  // pages of the current search load on demand as the dropdown is scrolled.
  private async fetchProductCategoryPage(
    page: number,
    search?: string
  ): Promise<{ items: Array<{ id: number; name: string }>; hasMore: boolean }> {
    if (!this.apiClient) return { items: [], hasMore: false };
    try {
      const qs = new URLSearchParams();
      qs.set('page', String(page));
      if (search) qs.set('search', search);
      const resp = await this.apiClient.get(
        `${API_BASE}/api/reference-data/product-categories?${qs.toString()}`, AadHttpClient.configurations.v1
      );
      if (!resp.ok) return { items: [], hasMore: false };
      const json = await resp.json();
      const items = (json?.data?.items ?? []).map((item: any) => ({ id: Number(item.id), name: item.name ?? '' }));
      return { items, hasMore: json?.data?.pagination?.hasMore === true };
    } catch (err) {
      console.error('fetchProductCategoryPage error:', err);
      return { items: [], hasMore: false };
    }
  }

  private async fetchProductCategoriesPage(page: number, search: string, append: boolean): Promise<void> {
    const versionKey = 'nemkoProductCategories';
    const version = (this._fetchVersions.get(versionKey) ?? 0) + 1;
    this._fetchVersions.set(versionKey, version);

    if (!append) (window as any).nemkoProductCategories = null; // "Searching..." signal
    (window as any).nemkoProductCategoriesPagination = { search, page, hasMore: true, loading: true };

    const { items, hasMore } = await this.fetchProductCategoryPage(page, search);
    if (this._fetchVersions.get(versionKey) !== version) return; // a newer keystroke superseded this request

    const existing: Array<{ id: number; name: string }> = append ? ((window as any).nemkoProductCategories ?? []) : [];
    (window as any).nemkoProductCategories = existing.concat(items);
    (window as any).nemkoProductCategoriesPagination = { search, page, hasMore, loading: false };
  }

  // Fired on every keystroke (debounced in the JS layer) and on focus (search: '').
  private fetchProductCategoriesBySearch(search: string): Promise<void> {
    return this.fetchProductCategoriesPage(1, search ?? '', false);
  }

  private fetchProductCategoriesNextPage(): Promise<void> {
    const pag = (window as any).nemkoProductCategoriesPagination;
    if (!pag || pag.loading || pag.hasMore === false) return Promise.resolve();
    return this.fetchProductCategoriesPage(pag.page + 1, pag.search, true);
  }

  // ── DB Tab: Standards ────────────────────────────────────────────────────────
  private async fetchStandards(page: number = 1, sortBy?: string | null, sortOrder?: string | null, search?: string, operator?: string): Promise<void> {
    const qs = new URLSearchParams();
    qs.set('page', String(page));
    if (sortBy) qs.set('sortBy', sortBy);
    if (sortOrder) qs.set('sortOrder', sortOrder);
    if (search) qs.set('search', search);
    if (operator) qs.set('operator', operator);
    const apiUrl = `${API_BASE}/api/database/standards?${qs.toString()}`;

    try {
      const response = await this.apiClient.get(apiUrl, AadHttpClient.configurations.v1);
      if (!response.ok) {
        (window as any).nemkoStandardItems = [];
        (window as any).nemkoDbStandardRows = [];
        (window as any).nemkoDbStandardPagination = null;
        return;
      }
      const json = await response.json();
      const items = json?.data?.items ?? [];
      (window as any).nemkoDbStandardPagination = json?.data?.pagination ?? null;
      (window as any).nemkoStandardItems = items.map((item: any) => ({
        id: item.id,
        title: item.title ?? '',
      }));
      (window as any).nemkoDbStandardRows = items.map((item: any) => ({
        id: item.id,
        externalId: item.externalId ?? '',
        title: item.Title ?? item.title ?? '',
        standardFamily: item.standardFamilyName ?? '',
        productCategory: item.productCategory ?? '',
      }));
    } catch (err) {
      console.error('fetchStandards error:', err);
      (window as any).nemkoStandardItems = [];
      (window as any).nemkoDbStandardRows = [];
      (window as any).nemkoDbStandardPagination = null;
    }
  }

  private async fetchStandardDetails(id: string): Promise<void> {
    const apiUrl = `${API_BASE}/api/database/standards/${id}`;
    const fallback = { externalId: '', title: '', productCategory: '', icsCode: '', iaf: '', nace: '', accreditedStandard: false, linkToWorkbench: '', standardFamilyName: '' };
    if (!this.apiClient) {
      (window as any).nemkoStandardDetail = fallback;
      return;
    }
    try {
      const response = await this.apiClient.get(apiUrl, AadHttpClient.configurations.v1);
      if (!response.ok) { (window as any).nemkoStandardDetail = fallback; return; }
      const json = await response.json();
      (window as any).nemkoStandardDetail = json?.data ?? fallback;
    } catch (err) {
      console.error('fetchStandardDetails error:', err);
      (window as any).nemkoStandardDetail = fallback;
    }
  }


  // ── DB Tab: Schemes ──────────────────────────────────────────────────────────
  private async fetchSchemes(page: number = 1, sortBy?: string | null, sortOrder?: string | null, search?: string, operator?: string): Promise<void> {
    const qs = new URLSearchParams();
    qs.set('page', String(page));
    if (sortBy) qs.set('sortBy', sortBy);
    if (sortOrder) qs.set('sortOrder', sortOrder);
    if (search) qs.set('search', search);
    if (operator) qs.set('operator', operator);
    const apiUrl = `${API_BASE}/api/database/scheme?${qs.toString()}`;

    try {
      const response = await this.apiClient.get(apiUrl, AadHttpClient.configurations.v1);
      if (!response.ok) {
        (window as any).nemkoSchemeItems = [];
        (window as any).nemkoDbSchemeRows = [];
        (window as any).nemkoDbSchemePagination = null;
        return;
      }
      const json = await response.json();
      const items = json?.data?.items ?? [];
      (window as any).nemkoDbSchemePagination = json?.data?.pagination ?? null;
      (window as any).nemkoSchemeItems = items.map((item: any) => ({
        id: String(item.id),
        title: item.name ?? '',
      }));
      (window as any).nemkoDbSchemeRows = items.map((item: any) => ({
        id: String(item.id),
        externalId: item.externalId ?? '',
        name: item.name ?? '',
        refStandared: item.referenceStandard ?? '',
      }));
    } catch (err) {
      console.error('fetchSchemes error:', err);
      (window as any).nemkoSchemeItems = [];
      (window as any).nemkoDbSchemeRows = [];
      (window as any).nemkoDbSchemePagination = null;
    }
  }

  private async fetchSchemeDetails(id: string): Promise<void> {
    const apiUrl = `${API_BASE}/api/database/scheme/${id}`;
    const fallback = { externalId: '', name: '', referenceStandard: '' };
    if (!this.apiClient) { (window as any).nemkoSchemeDetail = fallback; return; }
    try {
      const response = await this.apiClient.get(apiUrl, AadHttpClient.configurations.v1);
      if (!response.ok) { (window as any).nemkoSchemeDetail = fallback; return; }
      const json = await response.json();
      (window as any).nemkoSchemeDetail = json?.data ?? fallback;
    } catch (err) {
      console.error('fetchSchemeDetails error:', err);
      (window as any).nemkoSchemeDetail = fallback;
    }
  }



  // ── Create Scheme ────────────────────────────────────────────────────────────
  private async createScheme(): Promise<void> {
    const apiUrl = `${API_BASE}/api/database/scheme`;
    const externalIdEl = this.domElement.querySelector('#schemeExternalId') as HTMLInputElement;
    const nameEl = this.domElement.querySelector('#schemeNameIp') as HTMLInputElement;
    const refEl = this.domElement.querySelector('#refStandaredTxtarea') as HTMLTextAreaElement;
    // ── VALIDATION ──
    if (!this.validateRequired(externalIdEl, 'External ID')) return;
    if (!this.validateRequired(nameEl, 'Scheme name')) return;
    try {
      const response = await this.apiClient.post(
        apiUrl,
        AadHttpClient.configurations.v1,
        {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            externalId: externalIdEl?.value?.trim(),
            name: nameEl?.value?.trim(),
            referenceStandard: refEl?.value?.trim(),
          }),
        });
      const json = await response.json();
      if (response.ok) {
        const createdName = nameEl?.value?.trim() ?? '';
        this.closeModal('createSchemeModal');
        this.resetSchemeModal();
        await this.fetchSchemes();
        (window as any)._nemkoAdvSearch?.renderSchemes();
        alert('Successfully created Scheme - ' + createdName);
      } else {
        alert('Failed: ' + (json?.message ?? 'Unknown error'));
      }
    } catch (err) {
      console.error('createScheme error:', err);
      alert('Network error while creating scheme.');
    }
  }

  // ── DB Tab: Test Methods ─────────────────────────────────────────────────────
  private async fetchTestMethods(page: number = 1, sortBy?: string | null, sortOrder?: string | null, search?: string, categoryFilter?: string, operator?: string): Promise<void> {
    const qs = new URLSearchParams();
    qs.set('page', String(page));
    if (sortBy) qs.set('sortBy', sortBy);
    if (sortOrder) qs.set('sortOrder', sortOrder);
    if (search) qs.set('search', search);
    if (categoryFilter) qs.set('categoryId', categoryFilter);
    if (operator) qs.set('operator', operator);
    const apiUrl = `${API_BASE}/api/database/test-methods?${qs.toString()}`;

    if (!this.apiClient) {
      (window as any).nemkoTestMethodItems = [];
      (window as any).nemkoDbTestMethodRows = [];
      (window as any).nemkoDbTestMethodPagination = null;
      return;
    }

    try {
      const response = await this.apiClient.get(apiUrl, AadHttpClient.configurations.v1);
      if (!response.ok) {
        (window as any).nemkoTestMethodItems = [];
        (window as any).nemkoDbTestMethodRows = [];
        (window as any).nemkoDbTestMethodPagination = null;
        return;
      }
      const json = await response.json();
      const items = json?.data?.items ?? [];
      (window as any).nemkoDbTestMethodPagination = json?.data?.pagination ?? null;
      (window as any).nemkoTestMethodItems = items.map((item: any) => ({
        id: String(item.id),
        title: item.name ?? '',
      }));
      (window as any).nemkoDbTestMethodRows = items.map((item: any) => ({
        id: String(item.id),
        externalId: item.externalId ?? '',
        name: item.name ?? '',
        pdctCategory: item.productCategory ?? '',
        refStandared: item.referenceStandard ?? '',
      }));
    } catch (err) {
      console.error('fetchTestMethods error:', err);
      (window as any).nemkoTestMethodItems = [];
      (window as any).nemkoDbTestMethodRows = [];
      (window as any).nemkoDbTestMethodPagination = null;
    }
  }

  private async fetchTestMethodDetails(id: string): Promise<void> {
    const apiUrl = `${API_BASE}/api/database/test-methods/${id}`;
    const fallback = { externalId: '', name: '', productCategory: '', referenceStandard: '' };
    if (!this.apiClient) { (window as any).nemkoTestMethodDetail = fallback; return; }
    try {
      const response = await this.apiClient.get(apiUrl, AadHttpClient.configurations.v1);
      if (!response.ok) { (window as any).nemkoTestMethodDetail = fallback; return; }
      const json = await response.json();
      (window as any).nemkoTestMethodDetail = json?.data ?? fallback;
    } catch (err) {
      console.error('fetchTestMethodDetails error:', err);
      (window as any).nemkoTestMethodDetail = fallback;
    }
  }


  // ── Create Test Method ───────────────────────────────────────────────────────
  private async createTestMethod(): Promise<void> {
    const apiUrl = `${API_BASE}/api/database/test-methods`;
    const externalIdEl = this.domElement.querySelector('#testMethodExternalId') as HTMLInputElement;
    const nameEl = this.domElement.querySelector('#methodNameIp') as HTMLInputElement;
    const catEl = this.domElement.querySelector('#pdctCategoryTm') as HTMLInputElement;
    const refEl = this.domElement.querySelector('#refStandaredTmTxtarea') as HTMLTextAreaElement;
    // ── VALIDATION ──
    if (!this.validateRequired(externalIdEl, 'External ID')) return;
    if (!this.validateRequired(nameEl, 'Method name')) return;

    try {
      const response = await this.apiClient.post(
        apiUrl,
        AadHttpClient.configurations.v1,
        {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            externalId: externalIdEl?.value?.trim(),
            name: nameEl?.value?.trim(),
            productCategoryId: catEl?.value ? Number(catEl.value) : null,
            referenceStandard: refEl?.value?.trim(),
          }),
        });
      const json = await response.json();
      if (response.ok) {
        const createdName = nameEl?.value?.trim() ?? '';
        this.closeModal('createTestmethodModal');
        this.resetTestMethodModal();
        await this.fetchTestMethods();
        (window as any)._nemkoAdvSearch?.renderTestMethods();
        alert('Successfully created Test Method - ' + createdName);
      } else {
        alert('Failed: ' + (json?.message ?? 'Unknown error'));
      }
    } catch (err) {
      console.error('createTestMethod error:', err);
      alert('Network error while creating test method.');
    }
  }

  // ── DB Tab: Employees ────────────────────────────────────────────────────────
  private async fetchEmployees(page: number = 1, sortBy?: string | null, sortOrder?: string | null, search?: string, operator?: string): Promise<void> {
    const qs = new URLSearchParams();
    qs.set('page', String(page));
    if (sortBy) qs.set('sortBy', sortBy);
    if (sortOrder) qs.set('sortOrder', sortOrder);
    if (search) qs.set('search', search);
    if (operator) qs.set('operator', operator);
    const apiUrl = `${API_BASE}/api/database/employees?${qs.toString()}`;

    if (!this.apiClient) {
      (window as any).nemkoEmployeeItems = [];
      (window as any).nemkoDbEmployeeRows = [];
      (window as any).nemkoDbEmployeePagination = null;
      return;
    }

    try {
      const response = await this.apiClient.get(apiUrl, AadHttpClient.configurations.v1);
      if (!response.ok) {
        (window as any).nemkoEmployeeItems = [];
        (window as any).nemkoDbEmployeeRows = [];
        (window as any).nemkoDbEmployeePagination = null;
        return;
      }
      const json = await response.json();
      const items = json?.data?.items ?? [];
      (window as any).nemkoDbEmployeePagination = json?.data?.pagination ?? null;
      (window as any).nemkoEmployeeItems = items.map((item: any) => ({
        id: item.id,
        title: item.name ?? '',
      }));
      (window as any).nemkoDbEmployeeRows = items.map((item: any) => ({
        id: item.id,
        name: item.name ?? '',
        job_title: item.jobTitle ?? '',
        subsidiary: item.subsidiary ?? '',
        manager: item.manager ?? '',
        personal_status: item.personalStatus ?? '',
      }));
    } catch (err) {
      console.error('fetchEmployees error:', err);
      (window as any).nemkoEmployeeItems = [];
      (window as any).nemkoDbEmployeeRows = [];
      (window as any).nemkoDbEmployeePagination = null;
    }
  }

  // ── Activate All Employees ────────────────────────────────────────────────────
  private async activateAllEmployees(): Promise<void> {
    const apiUrl = `${API_BASE}/api/database/employees/activate-all`;
    if (!this.apiClient) return;
    const response = await this.apiClient.fetch(apiUrl, AadHttpClient.configurations.v1, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`activate-all failed: ${response.status}`);
    }
  }

  // ── DB Tab: Employee Details (qualifications for a specific employee) ────────
  private async fetchEmployeeDetails(id: string, page: number = 1, sortBy?: string | null, sortOrder?: string | null, search?: string, operator?: string): Promise<void> {
    const qs = new URLSearchParams();
    qs.set('page', String(page));
    if (sortBy) qs.set('sortBy', sortBy);
    if (sortOrder) qs.set('sortOrder', sortOrder);
    if (search) qs.set('search', search);
    if (operator) qs.set('operator', operator);
    const apiUrl = `${API_BASE}/api/database/employees/${id}/qualifications?${qs.toString()}`;

    if (!this.apiClient) {
      (window as any).nemkoEmployeeDetailQualifications = [];
      (window as any).nemkoEmployeeDetailPagination = null;
      return;
    }

    try {
      const response = await this.apiClient.get(apiUrl, AadHttpClient.configurations.v1);
      if (!response.ok) {
        (window as any).nemkoEmployeeDetailQualifications = [];
        (window as any).nemkoEmployeeDetailPagination = null;
        return;
      }
      const json = await response.json();
      // Support both paginated { data: { items, pagination } } and flat { data: [...] } shapes
      let items: any[] = [];
      let pagination: any = null;
      if (Array.isArray(json?.data?.items)) {
        items = json.data.items;
        pagination = json.data.pagination ?? null;
      } else if (Array.isArray(json?.data)) {
        items = json.data;
        pagination = items.length > 0
          ? { pageNumber: 1, lastPageNumber: 1, totalCount: items.length, pageSize: items.length, hasBack: false, hasMore: false }
          : null;
      }

      (window as any).nemkoEmployeeDetailQualifications = items.map((item: any) => ({
        id: String(item.qualificationId ?? ''),
        qualifications: item.qualificationReference?.name ?? '',
        type: item.qualificationTypeId?.name ?? '',
        level: item.qualificationLevel?.name ?? '',
        qual_date: item.qualifiedDate ?? '',
        withdrawn_date: item.withdrawnDate ?? '',
        qual_by: Array.isArray(item.authorizer) ? item.authorizer.map((a: any) => a.name).join(', ') : '',
      }));
      (window as any).nemkoEmployeeDetailPagination = pagination;
    } catch (err) {
      console.error('fetchEmployeeDetails error:', err);
      (window as any).nemkoEmployeeDetailQualifications = [];
      (window as any).nemkoEmployeeDetailPagination = null;
    }
  }

  // ── Shared required-field check for the Standard/Scheme/Test Method
  // create+edit modals: marks the field invalid (existing Bootstrap
  // .is-invalid/.invalid-feedback styling) AND raises a blocking alert()
  // naming the field, per request. ────────────────────────────────────────────
  private validateRequired(el: HTMLInputElement | HTMLTextAreaElement | null, label: string): boolean {
    if (!el || !el.value?.trim()) {
      el?.classList.add('is-invalid');
      alert(`${label} is required.`);
      return false;
    }
    el.classList.remove('is-invalid');
    return true;
  }

  // ── Create Standard ──────────────────────────────────────────────────────────
  private async createStandard(): Promise<void> {
    const apiUrl = `${API_BASE}/api/database/standards`;
    const externalIdEl = this.domElement.querySelector('#standardExternalId') as HTMLInputElement;
    const titleEl = this.domElement.querySelector('#standaredTitle') as HTMLInputElement;
    const familyEl = this.domElement.querySelector('#standardFamilyName') as HTMLInputElement;
    const icsEl = this.domElement.querySelector('#icsCode') as HTMLInputElement;
    const iafEl = this.domElement.querySelector('#IAF') as HTMLInputElement;
    const naceEl = this.domElement.querySelector('#NACE') as HTMLInputElement;
    const catEl = this.domElement.querySelector('#pdctCategoryStd') as HTMLInputElement;
    const linkEl = this.domElement.querySelector('#linkToWorkBench') as HTMLInputElement;
    const yesRadio = this.domElement.querySelector('input[name="accreditedRadio"]') as HTMLInputElement;

    // ── VALIDATION ──
    if (!this.validateRequired(externalIdEl, 'External ID')) return;
    if (!this.validateRequired(titleEl, 'Standard title')) return;
    if (!this.validateRequired(familyEl, 'Standard family')) return;

    try {
      const options: IHttpClientOptions = {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          externalId: externalIdEl?.value?.trim(),
          standardTitle: titleEl?.value?.trim(),
          standardFamilyName: familyEl?.value?.trim() || null,
          icsCode: Number(icsEl?.value),
          iaf: Number(iafEl?.value),
          nace: Number(naceEl?.value),
          productCategoryId: catEl?.value ? Number(catEl.value) : null,
          accreditedStandard: yesRadio?.checked ?? false,
          linkToWorkbench: linkEl?.value?.trim() || null,
        }),
      };
      const response = await this.apiClient.post(apiUrl, AadHttpClient.configurations.v1, options);
      const json = await response.json();
      if (response.ok) {
        const createdTitle = titleEl?.value?.trim() ?? '';
        this.closeModal('createStandaredModal');
        this.resetStandardModal();
        await this.fetchStandards();
        (window as any)._nemkoAdvSearch?.renderStandards();
        alert('Successfully created Standard - ' + createdTitle);
      } else {
        alert('Failed: ' + (json?.message ?? 'Unknown error'));
      }
    } catch (err) {
      console.error('createStandard error:', err);
      alert('Network error while creating standard.');
    }
  }

  private resetStandardModal(): void {
    const externalIdEl = this.domElement.querySelector('#standardExternalId') as HTMLInputElement;
    const titleEl = this.domElement.querySelector('#standaredTitle') as HTMLInputElement;
    const familyEl = this.domElement.querySelector('#standardFamilyName') as HTMLInputElement;
    const icsEl = this.domElement.querySelector('#icsCode') as HTMLInputElement;
    const iafEl = this.domElement.querySelector('#IAF') as HTMLInputElement;
    const naceEl = this.domElement.querySelector('#NACE') as HTMLInputElement;
    const catEl = this.domElement.querySelector('#pdctCategoryStd') as HTMLInputElement;
    const catDisplayEl = this.domElement.querySelector('[data-target="pdctCategoryStd"]') as HTMLInputElement;
    const linkEl = this.domElement.querySelector('#linkToWorkBench') as HTMLInputElement;
    if (externalIdEl) externalIdEl.value = '';
    if (titleEl) titleEl.value = '';
    if (familyEl) familyEl.value = '';
    if (icsEl) icsEl.value = '';
    if (iafEl) iafEl.value = '';
    if (naceEl) naceEl.value = '';
    if (catEl) catEl.value = '';
    if (catDisplayEl) catDisplayEl.value = '';
    if (linkEl) linkEl.value = '';
    const radios = this.domElement.querySelectorAll('input[name="accreditedRadio"]');
    if (radios[0]) (radios[0] as HTMLInputElement).checked = false;
    if (radios[1]) (radios[1] as HTMLInputElement).checked = true;
  }

  private resetSchemeModal(): void {
    const externalIdEl = this.domElement.querySelector('#schemeExternalId') as HTMLInputElement;
    const nameEl = this.domElement.querySelector('#schemeNameIp') as HTMLInputElement;
    const refEl = this.domElement.querySelector('#refStandaredTxtarea') as HTMLTextAreaElement;
    if (externalIdEl) externalIdEl.value = '';
    if (nameEl) nameEl.value = '';
    if (refEl) refEl.value = '';
  }

  private resetTestMethodModal(): void {
    const externalIdEl = this.domElement.querySelector('#testMethodExternalId') as HTMLInputElement;
    const nameEl = this.domElement.querySelector('#methodNameIp') as HTMLInputElement;
    const catEl = this.domElement.querySelector('#pdctCategoryTm') as HTMLInputElement;
    const catDisplayEl = this.domElement.querySelector('[data-target="pdctCategoryTm"]') as HTMLInputElement;
    const refEl = this.domElement.querySelector('#refStandaredTmTxtarea') as HTMLTextAreaElement;
    if (externalIdEl) externalIdEl.value = '';
    if (nameEl) nameEl.value = '';
    if (catEl) catEl.value = '';
    if (catDisplayEl) catDisplayEl.value = '';
    if (refEl) refEl.value = '';
  }

  // ── Update Standard ──────────────────────────────────────────────────────────
  private async updateStandard(): Promise<void> {
    const idEl = this.domElement.querySelector('#editStandaredId') as HTMLInputElement;
    const id = idEl?.value;
    if (!id) return;
    const apiUrl = `${API_BASE}/api/database/standards/${id}`;
    const titleEl = this.domElement.querySelector('#editStandaredTitle') as HTMLInputElement;
    const familyEl = this.domElement.querySelector('#editStandardFamilyName') as HTMLInputElement;
    const icsEl = this.domElement.querySelector('#editIcsCode') as HTMLInputElement;
    const iafEl = this.domElement.querySelector('#editIAF') as HTMLInputElement;
    const naceEl = this.domElement.querySelector('#editNACE') as HTMLInputElement;
    const catEl = this.domElement.querySelector('#editPdctCategoryStd') as HTMLInputElement;
    const linkEl = this.domElement.querySelector('#editLinkToWorkBench') as HTMLInputElement;
    const yesRadio = this.domElement.querySelector('input[name="editAccreditedRadio"]') as HTMLInputElement;

    if (!this.validateRequired(titleEl, 'Standard title')) return;
    if (!this.validateRequired(familyEl, 'Standard family')) return;
    try {
      const response = await this.apiClient.fetch(apiUrl, AadHttpClient.configurations.v1, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          standardTitle: titleEl?.value?.trim(),
          standardFamilyName: familyEl?.value?.trim() || null,
          icsCode: Number(icsEl?.value),
          iaf: Number(iafEl?.value),
          nace: Number(naceEl?.value),
          productCategoryId: catEl?.value ? Number(catEl.value) : null,
          accreditedStandard: yesRadio?.checked ?? false,
          linkToWorkbench: linkEl?.value?.trim() || null,
        }),
      });
      const json = await response.json();
      if (response.ok) {
        const editedTitle = titleEl?.value?.trim() ?? '';
        this.closeModal('editStandaredModal');
        await this.fetchStandards();
        (window as any)._nemkoAdvSearch?.renderStandards();
        alert('Successfully edited Standard - ' + editedTitle);
      } else {
        alert('Failed: ' + (json?.message ?? 'Unknown error'));
      }
    } catch (err) {
      console.error('updateStandard error:', err);
      alert('Network error while updating standard.');
    }
  }

  // ── Update Scheme ────────────────────────────────────────────────────────────
  private async updateScheme(): Promise<void> {
    const idEl = this.domElement.querySelector('#editSchemeId') as HTMLInputElement;
    const id = idEl?.value;
    if (!id) return;
    const apiUrl = `${API_BASE}/api/database/scheme/${id}`;
    const nameEl = this.domElement.querySelector('#editSchemeNameIp') as HTMLInputElement;
    const refEl = this.domElement.querySelector('#editRefStandaredTxtarea') as HTMLTextAreaElement;
    // ── VALIDATION ──
    if (!this.validateRequired(nameEl, 'Scheme name')) return;
    try {
      const response = await this.apiClient.fetch(apiUrl, AadHttpClient.configurations.v1, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameEl?.value?.trim(),
          referenceStandard: refEl?.value?.trim(),
        }),
      });
      const json = await response.json();
      if (response.ok) {
        const editedName = nameEl?.value?.trim() ?? '';
        this.closeModal('editSchemeModal');
        await this.fetchSchemes();
        (window as any)._nemkoAdvSearch?.renderSchemes();
        alert('Successfully edited Scheme - ' + editedName);
      } else {
        alert('Failed: ' + (json?.message ?? 'Unknown error'));
      }
    } catch (err) {
      console.error('updateScheme error:', err);
      alert('Network error while updating scheme.');
    }
  }

  // ── Update Test Method ───────────────────────────────────────────────────────
  private async updateTestMethod(): Promise<void> {
    const idEl = this.domElement.querySelector('#editTestmethodId') as HTMLInputElement;
    const id = idEl?.value;
    if (!id) return;
    const apiUrl = `${API_BASE}/api/database/test-methods/${id}`;
    const nameEl = this.domElement.querySelector('#editMethodNameIp') as HTMLInputElement;
    const catEl = this.domElement.querySelector('#editPdctCategoryTm') as HTMLInputElement;
    const refEl = this.domElement.querySelector('#editRefStandaredTmTxtarea') as HTMLTextAreaElement;
    // ── VALIDATION ──
    if (!this.validateRequired(nameEl, 'Method name')) return;
    try {
      const response = await this.apiClient.fetch(apiUrl, AadHttpClient.configurations.v1, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameEl?.value?.trim(),
          productCategoryId: catEl?.value ? Number(catEl.value) : null,
          referenceStandard: refEl?.value?.trim() ?? '',
        }),
      });
      const json = await response.json();
      if (response.ok) {
        const editedName = nameEl?.value?.trim() ?? '';
        this.closeModal('editTestmethodModal');
        await this.fetchTestMethods();
        (window as any)._nemkoAdvSearch?.renderTestMethods();
        alert('Successfully edited Test Method - ' + editedName);
      } else {
        alert('Failed: ' + (json?.message ?? 'Unknown error'));
      }
    } catch (err) {
      console.error('updateTestMethod error:', err);
      alert('Network error while updating test method.');
    }
  }

  // ── Import: template columns now sourced from the ImportMetadata API ────────
  // Column names for the downloadable template and the informationModal table
  // are fetched live from GET /api/ImportMetadata/columns/{importType} instead
  // of being hardcoded; only the file-type check remains client-side.

  /** Converts a 0-based index into a spreadsheet-style column letter (0→A, 25→Z, 26→AA, ...). */
  private getColumnLetter(index: number): string {
    let n = index;
    let letter = '';
    do {
      letter = String.fromCharCode(65 + (n % 26)) + letter;
      n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    return letter;
  }

  /**
   * Fetches an import type's column names from
   * GET /api/ImportMetadata/columns/{importType}, caching the result per
   * importType so re-opening the information modal doesn't re-fetch.
   */
  private async fetchImportColumns(importType: string): Promise<string[]> {
    if (this._importColumnsCache[importType]) {
      return this._importColumnsCache[importType];
    }
    if (!this.apiClient) { throw new Error('API client not ready. Please try again.'); }

    const url = `${API_BASE}/api/ImportMetadata/columns/${importType}`;
    const response = await this.apiClient.fetch(url, AadHttpClient.configurations.v1, { method: 'GET' });
    const raw = await response.text();
    let json: any = null;
    try { json = raw ? JSON.parse(raw) : null; } catch { json = null; }

    if (!response.ok) {
      throw new Error(json?.message || ('API ' + response.status + ': ' + raw));
    }

    const columns: string[] = Array.isArray(json?.data) ? json.data : [];
    this._importColumnsCache[importType] = columns;
    return columns;
  }

  /** Minimal HTML-escaping for column names inserted via innerHTML. */
  private escapeHtml(value: string): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Renders the given import type's information-modal table header (A, B, C...)
   * and single data row from the given column names. Each import type has its
   * own thead/tbody, e.g. #info-modal-table-head-standard / -body-standard.
   */
  private populateInformationModalColumns(importType: string, columns: string[]): void {
    const thead = this.domElement.querySelector(`#info-modal-table-head-${importType}`) as HTMLElement;
    const tbody = this.domElement.querySelector(`#info-modal-table-body-${importType}`) as HTMLElement;
    if (!thead || !tbody) return;

    const headerCells = columns.map((_, i) =>
      `<th class="text-base md-text-lg">${this.getColumnLetter(i)}</th>`
    ).join('');
    const dataCells = columns.map(col => `<td>${this.escapeHtml(col)}</td>`).join('');

    thead.innerHTML = `<tr>${headerCells}</tr>`;
    tbody.innerHTML = `<tr>${dataCells}</tr>`;
  }

  private async uploadDatabaseFile(
    file: File,
    type: 'standard' | 'scheme' | 'testmethod' | 'employee'
  ): Promise<any> {

    const apiUrl =
      `${API_BASE}/api/import/${type}`;

    const formData = new FormData();

    formData.append('file', file);

    const response = await this.apiClient.post(
      apiUrl,
      AadHttpClient.configurations.v1,
      {
        body: formData
      }
    );

    let json: any = null;
    try { json = await response.json(); } catch { /* ignore — body may be empty */ }

    if (!response.ok) {
      throw new Error(json?.message ?? 'Upload failed');
    }

    return json;
  }

  private async exportQualifications(searchParams?: any): Promise<void> {
    const apiUrl = `${API_BASE}/api/export/qualifications`;

    if (!this.apiClient) return;

    const body = {
      search: searchParams?.search ?? '',
      page: 1,
      pageSize: 99999,
      sortBy: searchParams?.sortBy ?? '',
      sortOrder: searchParams?.sortOrder ?? '',
      ...(searchParams?.status !== undefined && { status: searchParams.status }),
      ...(searchParams?.conformityStatement !== undefined && { conformityStatement: searchParams.conformityStatement }),
      ...(searchParams?.certificationDecision !== undefined && { certificationDecision: searchParams.certificationDecision }),
      ...(searchParams?.qualificationLevel !== undefined && { qualificationLevel: searchParams.qualificationLevel }),
      ...(searchParams?.reportApprover !== undefined && { reportApprover: searchParams.reportApprover }),
      standard: searchParams?.standard ?? [],
      scheme: searchParams?.scheme ?? [],
      testMethod: searchParams?.testMethod ?? [],
      employee: searchParams?.employee ?? [],
      office: searchParams?.office ?? [],
      columnTextSearches: searchParams?.columnTextSearches ?? []
    };

    try {
      const response = await this.apiClient.post(
        apiUrl,
        AadHttpClient.configurations.v1,
        { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      );

      if (!response.ok) {
        console.error('exportQualifications failed:', response.status);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qualifications-' + new Date().toISOString().slice(0, 10) + '.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('exportQualifications error:', err);
    }
  }




  // ── Export to Excel — Standard / Scheme / Test Method ───────────────────────
  // Mirrors the &search= / &categoryId= pattern used by the DB-tab table
  // fetches (fetchStandards / fetchSchemes / fetchTestMethods).
  private async downloadExportFile(apiUrl: string, filenamePrefix: string): Promise<void> {
    if (!this.apiClient) return;

    try {
      const response = await this.apiClient.get(apiUrl, AadHttpClient.configurations.v1);

      if (!response.ok) {
        console.error(`${filenamePrefix} export failed:`, response.status);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filenamePrefix}-` + new Date().toISOString().slice(0, 10) + '.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`${filenamePrefix} export error:`, err);
    }
  }

  private async exportStandards(searchParams?: any): Promise<void> {
    const qs = new URLSearchParams();
    if (searchParams?.search) qs.set('search', searchParams.search);
    const apiUrl = `${API_BASE}/api/export/standards${qs.toString() ? `?${qs.toString()}` : ''}`;
    await this.downloadExportFile(apiUrl, 'standards');
  }

  private async exportSchemes(searchParams?: any): Promise<void> {
    const qs = new URLSearchParams();
    if (searchParams?.search) qs.set('search', searchParams.search);
    const apiUrl = `${API_BASE}/api/export/schemes${qs.toString() ? `?${qs.toString()}` : ''}`;
    await this.downloadExportFile(apiUrl, 'schemes');
  }

  private async exportTestMethods(searchParams?: any): Promise<void> {
    const qs = new URLSearchParams();
    if (searchParams?.search) qs.set('search', searchParams.search);
    if (searchParams?.categoryFilter) qs.set('categoryId', searchParams.categoryFilter);
    const apiUrl = `${API_BASE}/api/export/testmethods${qs.toString() ? `?${qs.toString()}` : ''}`;
    await this.downloadExportFile(apiUrl, 'test-methods');
  }

  private async exportEmployees(searchParams?: any): Promise<void> {
    const qs = new URLSearchParams();
    qs.set('search', searchParams?.search ?? '');
    const apiUrl = `${API_BASE}/api/export/employee?${qs.toString()}`;
    await this.downloadExportFile(apiUrl, 'employees');
  }





  // ── Import Modal ↔ Information Modal flow ────────────────────────────────────
  private bindImportModal(): void {
    const self = this;
    (window as any).nemkoOpenModal = (id: string) => this.openModal(id);
    (window as any).nemkoCloseModal = (id: string) => this.closeModal(id);
    (window as any).nemkoGetModalElement = (id: string): HTMLElement | null =>
      this.domElement.querySelector('#' + id) as HTMLElement | null;
    (window as any).nemkoFetchQualificationDetails = (id: string): Promise<void> =>
      this.fetchQualificationDetails(id);
    (window as any).nemkoFetchStandardDetails = (id: string): Promise<void> =>
      this.fetchStandardDetails(id);
    (window as any).nemkoFetchQualificationLevels = (): Promise<void> =>
      this.fetchQualificationLevels();
    (window as any).nemkoFetchSchemeDetails = (id: string): Promise<void> => this.fetchSchemeDetails(id);
    (window as any).nemkoFetchTestMethodDetails = (id: string): Promise<void> => this.fetchTestMethodDetails(id);

    // Server-side pagination fetch functions called by advanced-search.js
    (window as any).nemkoFetchQualificationsPage = (page: number, searchParams?: any): Promise<void> =>
      this.fetchQualifications({ ...searchParams, page });
    (window as any).nemkoExportQualifications = (searchParams?: any): Promise<void> =>
      this.exportQualifications(searchParams);
    (window as any).nemkoExportStandards = (searchParams?: any): Promise<void> =>
      this.exportStandards(searchParams);
    (window as any).nemkoExportSchemes = (searchParams?: any): Promise<void> =>
      this.exportSchemes(searchParams);
    (window as any).nemkoExportTestMethods = (searchParams?: any): Promise<void> =>
      this.exportTestMethods(searchParams);
    (window as any).nemkoExportEmployees = (searchParams?: any): Promise<void> =>
      this.exportEmployees(searchParams);
    (window as any).nemkoFetchStandardsPage = (page: number, sortBy?: string | null, sortOrder?: string | null, search?: string, operator?: string): Promise<void> =>
      this.fetchStandards(page, sortBy, sortOrder, search, operator);
    (window as any).nemkoFetchSchemesPage = (page: number, sortBy?: string | null, sortOrder?: string | null, search?: string, operator?: string): Promise<void> =>
      this.fetchSchemes(page, sortBy, sortOrder, search, operator);
    (window as any).nemkoFetchTestMethodsPage = (page: number, sortBy?: string | null, sortOrder?: string | null, search?: string, categoryFilter?: string, operator?: string): Promise<void> =>
      this.fetchTestMethods(page, sortBy, sortOrder, search, categoryFilter, operator);
    (window as any).nemkoFetchEmployeesPage = (page: number, sortBy?: string | null, sortOrder?: string | null, search?: string, operator?: string): Promise<void> =>
      this.fetchEmployees(page, sortBy, sortOrder, search, operator);
    (window as any).nemkoActivateAllEmployees = (): Promise<void> =>
      this.activateAllEmployees();
    (window as any).nemkoFetchEmployeeDetails = (id: string, page: number, sortBy?: string | null, sortOrder?: string | null, search?: string, operator?: string): Promise<void> =>
      this.fetchEmployeeDetails(id, page, sortBy, sortOrder, search, operator);

    // Lazy-load filter data when the shared select modal opens (called by JS before rendering list)
    (window as any).nemkoFetchFilterStandards = (): Promise<void> => this.fetchFilterStandards();
    (window as any).nemkoFetchFilterSchemes = (): Promise<void> => this.fetchFilterSchemes();
    (window as any).nemkoFetchFilterTestMethods = (): Promise<void> => this.fetchFilterTestMethods();
    (window as any).nemkoFetchFilterEmployees = (): Promise<void> => this.fetchFilterEmployees();
    (window as any).nemkoFetchFilterOffices = (): Promise<void> => this.fetchFilterOffices();

    // API-search functions for the shared filter modal (called on input with ?search=)
    (window as any).nemkoFetchFilterStandardsBySearch = (s: string): Promise<void> => this.fetchFilterReferenceData('standard', 'nemkoFilterStandardItems', s);
    (window as any).nemkoFetchFilterSchemesBySearch = (s: string): Promise<void> => this.fetchFilterReferenceData('scheme', 'nemkoFilterSchemeItems', s);
    (window as any).nemkoFetchFilterTestMethodsBySearch = (s: string): Promise<void> => this.fetchFilterReferenceData('test-method', 'nemkoFilterTestMethodItems', s);
    (window as any).nemkoFetchFilterEmployeesBySearch = (s: string): Promise<void> => this.fetchFilterReferenceData('Employee', 'nemkoFilterEmployeeItems', s);
    (window as any).nemkoFetchFilterOfficesBySearch = (s: string): Promise<void> => this.fetchFilterReferenceData('office', 'nemkoFilterOfficeItems', s);

    // Generic infinite-scroll "next page" fetcher for the shared select modal.
    // Called by the JS layer (keyed by the same itemsKey used above) when the
    // modal list is scrolled near the bottom. No-op if already loading/exhausted.
    (window as any).nemkoFetchFilterNextPage = (windowKey: string): Promise<void> =>
      this.fetchFilterReferenceDataNextPage(windowKey);

    // Product-category search-select (used by create/edit Standard, create/edit
    // Test Method, and the Test Method DB-tab filter). JS calls
    // nemkoFetchProductCategoriesBySearch on every keystroke (debounced) and on
    // focus (search: ''), and nemkoFetchProductCategoriesNextPage on scroll.
    (window as any).nemkoFetchProductCategoriesBySearch = (s: string): Promise<void> =>
      this.fetchProductCategoriesBySearch(s);
    (window as any).nemkoFetchProductCategoriesNextPage = (): Promise<void> =>
      this.fetchProductCategoriesNextPage();

    const createStdBtn = this.domElement.querySelector('#createStandaredModal .nemko-btn-save');
    if (createStdBtn) createStdBtn.addEventListener('click', () => this.withBtnGuard(createStdBtn, () => this.createStandard()));

    const createSchemeBtn = this.domElement.querySelector('#createSchemeModal .nemko-btn-save');
    if (createSchemeBtn) createSchemeBtn.addEventListener('click', () => this.withBtnGuard(createSchemeBtn, () => this.createScheme()));

    const createTmBtn = this.domElement.querySelector('#createTestmethodModal .nemko-btn-save');
    if (createTmBtn) createTmBtn.addEventListener('click', () => this.withBtnGuard(createTmBtn, () => this.createTestMethod()));

    const createStdModal = this.domElement.querySelector('#createStandaredModal');
    if (createStdModal) createStdModal.addEventListener('show.bs.modal', () => this.resetStandardModal());

    const createSchemeModal = this.domElement.querySelector('#createSchemeModal');
    if (createSchemeModal) createSchemeModal.addEventListener('show.bs.modal', () => this.resetSchemeModal());

    const createTmModal = this.domElement.querySelector('#createTestmethodModal');
    if (createTmModal) createTmModal.addEventListener('show.bs.modal', () => this.resetTestMethodModal());

    const editStdSaveBtn = this.domElement.querySelector('#editStandaredSaveBtn');
    if (editStdSaveBtn) editStdSaveBtn.addEventListener('click', () => this.withBtnGuard(editStdSaveBtn, () => this.updateStandard()));

    const editSchemeSaveBtn = this.domElement.querySelector('#editSchemeSaveBtn');
    if (editSchemeSaveBtn) editSchemeSaveBtn.addEventListener('click', () => this.withBtnGuard(editSchemeSaveBtn, () => this.updateScheme()));

    const editTmSaveBtn = this.domElement.querySelector('#editTestmethodSaveBtn');
    if (editTmSaveBtn) editTmSaveBtn.addEventListener('click', () => this.withBtnGuard(editTmSaveBtn, () => this.updateTestMethod()));

    const qdWithdrawBtn = this.domElement.querySelector('#qd-withdraw-btn');
    if (qdWithdrawBtn) qdWithdrawBtn.addEventListener('click', () => this.withdrawFromQualificationDetailsModal());

    const fileInput =
      this.domElement.querySelector(
        '#editTempDocModal input[type="file"]'
      ) as HTMLInputElement;

    const fileNameDisplay =
      this.domElement.querySelector(
        '#editTempDocModal .form-control[disabled]'
      ) as HTMLInputElement;

    if (fileInput && fileNameDisplay) {
      fileInput.addEventListener('change', () => {
        const file = fileInput.files?.[0];
        fileNameDisplay.value = file ? file.name : '';
      });
    }

    const downloadBtn = this.domElement.querySelector(
      '#editTempDocModal .nemko-btn-download'
    ) as HTMLButtonElement;

    if (downloadBtn) {
      downloadBtn.addEventListener('click', async () => {
        if (!self.apiClient) { self.setImportError('API client not ready. Please try again.'); return; }

        const originalLabel = downloadBtn.textContent;
        downloadBtn.disabled = true;
        downloadBtn.textContent = 'Downloading...';

        try {
          const importType = self.currentImportType;
          const url = `${API_BASE}/api/ImportMetadata/file/${importType}`;
          const response = await self.apiClient.fetch(url, AadHttpClient.configurations.v1, { method: 'GET' });

          if (!response.ok) {
            const raw = await response.text();
            throw new Error('API ' + response.status + ': ' + raw);
          }

          const blob = await response.blob();

          // Prefer the filename from Content-Disposition (if the API sends one),
          // falling back to a sensible default.
          let fileName = `${importType}-template.xlsx`;
          const disposition = response.headers?.get?.('content-disposition');
          const match = disposition ? /filename\*?=(?:UTF-8'')?"?([^;"]+)"?/i.exec(disposition) : null;
          if (match && match[1]) { fileName = decodeURIComponent(match[1].trim()); }

          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
        } catch (err) {
          console.error('Template download failed:', err);
          self.setImportError('Could not download the template: ' + (err as Error).message);
        } finally {
          downloadBtn.disabled = false;
          downloadBtn.textContent = originalLabel;
        }
      });
    }

    const uploadBtn = this.domElement.querySelector(
      '#editTempDocModal .nemko-btn-save'
    ) as HTMLButtonElement;

    if (uploadBtn) {
      uploadBtn.addEventListener('click', async () => {
        this.setImportError('');

        const file = fileInput?.files?.[0];

        if (!file) {
          this.setImportError('Please select a file.');
          return;
        }

        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        const allowed = ['.csv', '.xlsx', '.xls'];
        if (allowed.indexOf(ext) === -1) {
          this.setImportError('File type not supported. Only .xls, .xlsx, .csv files are allowed.');
          return;
        }

        // "Uploading..." now covers the whole upload request/response —
        // column/header validation has moved server-side, so there's no
        // separate client-side validation phase to cover anymore.
        await this.withUploadingLabel(uploadBtn, async () => {
          await this.withBtnGuard(uploadBtn, async () => {
            try {

              const uploadResult = await this.uploadDatabaseFile(
                file,
                this.currentImportType
              );

              const summary = uploadResult?.data;
              const baseMsg = uploadResult?.message || 'Upload successful';
              const alertMsg = summary
                ? `${baseMsg}\n\nTotal Requested: ${summary.totalRequested ?? 0}\nTotal Completed: ${summary.totalCompleted ?? 0}\nTotal Failed: ${summary.totalFailed ?? 0}`
                : baseMsg;
              alert(alertMsg);

              this.closeModal('editTempDocModal');
              this.resetImportModal();

              switch (this.currentImportType) {

                case 'standard':
                  await this.fetchStandards();
                  (window as any)._nemkoAdvSearch?.renderStandards?.();
                  break;

                case 'scheme':
                  await this.fetchSchemes();
                  (window as any)._nemkoAdvSearch?.renderSchemes?.();
                  break;

                case 'testmethod':
                  await this.fetchTestMethods();
                  (window as any)._nemkoAdvSearch?.renderTestMethods?.();
                  break;

                case 'employee':
                  await this.fetchEmployees();
                  (window as any)._nemkoAdvSearch?.renderEmployees?.();
                  break;
              }

            } catch (err) {
              console.error('Upload failed:', err);
              this.setImportError((err as Error).message || 'Upload failed. Please try again.');
            }
          });
        });
      });
    }

    this.domElement.addEventListener('click', function (e: Event) {
      const target = e.target as HTMLElement;

      const btn = target.closest('.import-trigger-btn') as HTMLElement;

      if (!btn) return;

      const importType = btn.getAttribute('data-import-type') ?? '';
      if (importType === 'standard') self.currentImportType = 'standard';
      else if (importType === 'scheme') self.currentImportType = 'scheme';
      else if (importType === 'testmethod') self.currentImportType = 'testmethod';
      else if (importType === 'employee') self.currentImportType = 'employee';

      e.preventDefault();

      self.resetImportModal();
      self.openModal('editTempDocModal');
    });

    const infoModalMap: Record<string, string> = {
      standard: 'informationModalStandard',
      scheme: 'informationModalScheme',
      testmethod: 'informationModalTestmethod',
      employee: 'informationModalEmployee',
    };

    const templateInfoBtn = this.domElement.querySelector('#import-template-info-btn') as HTMLButtonElement;
    if (templateInfoBtn) {
      templateInfoBtn.addEventListener('click', async () => {
        const importType = self.currentImportType;
        try {
          const columns = await self.fetchImportColumns(importType);
          self.populateInformationModalColumns(importType, columns);
        } catch (err) {
          console.error('Fetching template columns failed:', err);
          self.setImportError('Could not load column information: ' + (err as Error).message);
          return;
        }
        self.closeModal('editTempDocModal');
        self.openModal(infoModalMap[importType] ?? 'informationModalStandard');
      });
    }

    this.domElement.addEventListener('click', function (e: Event) {
      const target = e.target as HTMLElement;
      const btn = target.closest('.info-modal-ok-btn') as HTMLElement;
      if (!btn) return;
      const modalId = btn.dataset.modalId ?? '';
      if (modalId) self.closeModal(modalId);
      self.openModal('editTempDocModal');
    });

    this.domElement.addEventListener('click', function (e: Event) {
      const target = e.target as HTMLElement;
      const btn = target.closest('.info-modal-dismiss-btn') as HTMLElement;
      if (!btn) return;
      const modalId = btn.dataset.modalId ?? '';
      if (modalId) self.closeModal(modalId);
      self.openModal('editTempDocModal');
    });

    this.domElement.addEventListener('click', function (e: Event) {
      const target = e.target as HTMLElement;
      if (!target.closest('.import-modal-close-btn')) return;
      e.preventDefault();
      self.resetImportModal();
      self.closeModal('editTempDocModal');
    });
  }

  private resetImportModal(): void {
    const fileNameDisplay = this.domElement.querySelector('#editTempDocModal .form-control[disabled]') as HTMLInputElement;
    if (fileNameDisplay) fileNameDisplay.value = '';
    const fileInput = this.domElement.querySelector('#editTempDocModal input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    this.setImportError('');
  }

  private setImportError(msg: string): void {
    const el = this.domElement.querySelector('#import-file-error') as HTMLElement;
    if (!el) return;
    el.textContent = msg;
    el.style.display = msg ? 'block' : 'none';
  }

  private async withBtnGuard(btn: Element | null, fn: () => Promise<void>): Promise<void> {
    const b = btn as HTMLButtonElement | null;
    if (b) b.disabled = true;
    try { await fn(); } finally { if (b) b.disabled = false; }
  }

  // ── Swaps a button's label to "Uploading..." for the duration of fn(),
  // then restores it — used on the import "Upload" button, since large files
  // can take a while for the API to respond and the result comes via a
  // blocking alert(), so the label needs to stay through that too. ──────────
  private async withUploadingLabel(btn: Element | null, fn: () => Promise<void>): Promise<void> {
    const b = btn as HTMLButtonElement | null;
    const originalLabel = b ? b.textContent : null;
    if (b) b.textContent = 'Uploading...';
    try {
      await fn();
    } finally {
      if (b) b.textContent = originalLabel;
    }
  }

  private openModal(id: string): void {
    const el = this.domElement.querySelector('#' + id) as HTMLElement;
    if (!el) return;
    (window as any).$(el).modal('show');
  }

  private closeModal(id: string): void {
    const el = this.domElement.querySelector('#' + id) as HTMLElement;
    if (!el) return;
    (window as any).$(el).modal('hide');
  }

  private handleSidebarNavigation(): void {
    const params = new URLSearchParams(window.location.search);
    if (params.get('open') !== 'create-standard') return;

    requestAnimationFrame(() => {
      const databaseBtn = this.domElement.querySelector('[data-tab-id="database-table"]') as HTMLElement;
      databaseBtn?.click();

      const standardTab = this.domElement.querySelector('[data-db-tabid="db-tab-standared"]') as HTMLElement;
      standardTab?.click();

      const createBtn = this.domElement.querySelector('[data-bs-target="#createStandaredModal"]') as HTMLElement;
      createBtn?.click();

      const url = new URL(window.location.href);
      url.searchParams.delete('open');
      window.history.replaceState({}, '', url.toString());
    });
  }



  private loadCSS(): void {
    SPComponentLoader.loadCss(`${this.siteUrl}/SiteAssets/resources/css/jquery-ui.css`);
    SPComponentLoader.loadCss(`${this.siteUrl}/SiteAssets/resources/css/qualification-db.css`);
    SPComponentLoader.loadCss(`${this.siteUrl}/SiteAssets/resources/css/nemko-modal.css`);

    if (!document.getElementById('nemko-adv-search-select-css')) {
      const style = document.createElement('style');
      style.id = 'nemko-adv-search-select-css';
      style.textContent =
        '.nemko-email-suggestions{z-index:1060;max-height:200px;overflow-y:auto;' +
        'background:#fff;border:1px solid #ddd;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.15);margin-top:2px;}' +
        '.nemko-email-suggestions li{padding:8px 12px;cursor:pointer;}' +
        '.nemko-email-suggestions li:hover{background:#f0f0f0;}';
      document.head.appendChild(style);
    }
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

    const scriptsPromise = SPComponentLoader.loadScript(`${siteAssetsUrl}/resources/js/jquery-ui.js`)
      .then(() => SPComponentLoader.loadScript(`${siteAssetsUrl}/resources/js/advanced-search.js`));

    if (this._initFailed) {
      scriptsPromise
        .then(() => this.showTableError())
        .catch(err => console.error('[NEMKO] JS Load Error:', err));
      return;
    }

    // Only the Advanced Search tab's own data loads eagerly on page load.
    // Standards / Schemes / Test Methods / Employees now load the first time
    // their Database sub-tab is clicked (see initDbTabSwitch in
    // advanced-search.js), and Qualification Levels / Product Categories now
    // load the first time their dropdown is focused (see the '#f-level'
    // listener in initSearchFilters, and bindProductCategorySelects, in
    // advanced-search.js). This cuts the initial Promise.all from 7 calls
    // down to 1, so first paint no longer waits on tabs/dropdowns the user
    // may never open.
    const dataPromise = Promise.all([
      this.fetchQualifications({ status: true }), // defaults to Active
    ]);

    Promise.all([scriptsPromise, dataPromise])
      .then(() => {
        if (typeof (window as any).initAdvancedSearch === 'function') {
          (window as any).initAdvancedSearch();
          this.handleSidebarNavigation();
        } else {
          console.error('[NEMKO] initAdvancedSearch not found on window');
        }
      })
      .catch(err => console.error('[NEMKO] JS Load Error:', err));
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', { label: strings.DescriptionFieldLabel })
              ]
            }
          ]
        }
      ]
    };
  }
}