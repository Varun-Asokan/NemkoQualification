import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPComponentLoader } from '@microsoft/sp-loader';
import { AadHttpClient, HttpClientResponse } from '@microsoft/sp-http';

import * as strings from 'WpEmployeesWebPartStrings';
import employees from './Employees';
import SharedSidebar from '../../SharedSidebar';

export interface IWpEmployeesWebPartProps {
  description: string;
}

// ─── API shapes ───────────────────────────────────────────────────────────────

interface IPagination {
  pageSize: number;
  totalCount: number;
  hasBack: boolean;
  hasMore: boolean;
  pageNumber: number;
  lastPageNumber: number;
}

interface IPersonalStatus {
  id: number;
  name: string;
}

interface IEmployeeApiItem {
  id: number;
  name: string;
  personalStatus: string;
  office: string;
  approvalManager: string;
  directManager: string;
  localGM: string;
  qualityManager: string;
  hrContact: string;
  email: string;
  directManagerEmail: string;
  location: string;
  employeeType: string;
}

interface IManagerData {
  id: number;
  data: { name: string; email: string };
}

interface IEmployeeDetailData {
  id: number;
  name: string;
  email: string;
  leadershipFunction: boolean;
  isAdmin: boolean;
  personalStatus?: { id: number; name: string };
  office?: { id: number; name: string };
  approvalManager?: IManagerData;
  directManager?: IManagerData;
  localGM?: IManagerData;
  qualityManager?: IManagerData;
  hrContact?: IManagerData;
  location?: { id: number; name: string };
  employeeType?: { id: number; name: string };
}

interface IEmployeeApiResponse {
  statusCode: number;
  status: string;
  message: string;
  data: {
    items: IEmployeeApiItem[];
    pagination?: IPagination;
  };
}

// ─── Internal row shape ──────────────────────────────────────────────────────

interface IEmployeeRow {
  id: number;
  name: string;
  personal_status: string;
  office: string;
  approval_manager: string;
  direct_manager: string;
  localGM: string;
  quality_manager: string;
  HR_contact: string;
  email: string;
  direct_manager_email: string;
  location: string;
  employee_type: string;
  [key: string]: string | number;
}

// ─── Table config shape ───────────────────────────────────────────────────────

interface IColumnDef {
  key: string;
  label: string;
  sortable: boolean;
  sortApiKey?: string;
  visible: boolean;
  dropdown: boolean;
}

const COLUMNS: IColumnDef[] = [
  { key: 'name',             label: 'Name',             sortable: true, sortApiKey: 'name',            visible: true, dropdown: true },
  { key: 'personal_status',  label: 'Personal Status',  sortable: true, sortApiKey: 'personalstatus',  visible: true, dropdown: true },
  { key: 'office',           label: 'Office',           sortable: true, sortApiKey: 'office',          visible: true, dropdown: true },
  { key: 'approval_manager', label: 'Approval Manager', sortable: true, sortApiKey: 'approvalmanager', visible: true, dropdown: true },
  { key: 'direct_manager',   label: 'Direct Manager',   sortable: true, sortApiKey: 'directmanager',   visible: true, dropdown: true },
  { key: 'localGM',          label: 'Local GM',         sortable: true, sortApiKey: 'localgm',         visible: true, dropdown: true },
  { key: 'quality_manager',  label: 'Quality Manager',  sortable: true, sortApiKey: 'qualitymanager',  visible: true, dropdown: true },
  { key: 'HR_contact',       label: 'HR Contact',       sortable: true, sortApiKey: 'hrcontact',       visible: true, dropdown: true },
];

const SORT_CYCLE = ['asc', 'desc', 'default'];

// ─── WebPart ──────────────────────────────────────────────────────────────────

export default class WpEmployeesWebPart extends BaseClientSideWebPart<IWpEmployeesWebPartProps> {

  private siteUrl: string = '';
  private apiClient!: AadHttpClient;
  private graphClient: any = null;
  private _loadedCssLinks: HTMLLinkElement[] = [];
  private _emailDebounceTimer: number = 0;
  private _filterDebounceTimer: number = 0;

  private static readonly APP_ID_URI = 'api://66eda48a-d5f9-4db0-a911-0d936f8ce92b';
  private static readonly API_URL =
    'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/admin/employees';
  private static readonly PERSONAL_STATUS_URL =
    'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/reference-data/personal-status';
  private static readonly OFFICES_URL =
    'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/reference-data/office';
  // private static readonly APPROVAL_MANAGERS_URL =
  //   'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/reference-data/approval-managers';
  // private static readonly DIRECT_MANAGERS_URL =
  //   'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/reference-data/direct-managers';
  // private static readonly LOCAL_GM_URL =
  //   'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/reference-data/local-gm';
  // private static readonly QUALITY_MANAGER_URL =
  //   'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/reference-data/quality-manager';
  // private static readonly HR_CONTACT_URL =
  //   'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/reference-data/hr-contact';
  private static readonly EMPLOYEE_REF_URL =
    'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/reference-data/Employee';
  private static readonly EMPLOYEE_TYPE_URL =
    'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/reference-data/EmployeeType';

  // Office/approval-manager/direct-manager/local-GM/quality-manager/HR-contact
  // are paginated search-selects. Each data source is shared between its "new"
  // and "edit" modal fields (same underlying list), keyed by `key`.
  private static readonly SS_FIELD_CONFIGS: Array<{ key: string; url: string; targets: string[] }> = [
    { key: 'office', url: WpEmployeesWebPart.OFFICES_URL, targets: ['office', 'editOffice'] },
    { key: 'approvalManager', url: WpEmployeesWebPart.EMPLOYEE_REF_URL, targets: ['approvalManager', 'editApprovalManager'] },
    { key: 'directManager', url: WpEmployeesWebPart.EMPLOYEE_REF_URL, targets: ['directManger', 'editDirectManger'] },
    { key: 'localGM', url: WpEmployeesWebPart.EMPLOYEE_REF_URL, targets: ['localGMList', 'editLocalGMList'] },
    { key: 'qualityManager', url: WpEmployeesWebPart.EMPLOYEE_REF_URL, targets: ['qualityManger', 'editQualityManger'] },
    { key: 'hrContact', url: WpEmployeesWebPart.EMPLOYEE_REF_URL, targets: ['HR-contact', 'editHRContact'] },
  ];

  // ── Data state ────────────────────────────────────────────────────────────
  private rows: IEmployeeRow[] = [];
  // True when the last table load failed (one error pattern, audit D10 / handover C4)
  private _loadError = false;
  private paginationMeta: IPagination | null = null;
  private personalStatuses: Array<{ id: number; name: string }> = [];
  private employeeDetail: IEmployeeDetailData | null = null;

  // ── Reference data cache ──────────────────────────────────────────────────
  // office/approvalManager/directManager/localGM/qualityManager/hrContact are
  // paginated search-selects now — see SS_FIELD_CONFIGS + _ssPagination below.
  private refEmployeeTypes: Array<{ id: number; name: string }> | null = null;
  private _ssPagination: Record<string, { page: number; hasMore: boolean; loading: boolean; search: string; reqId: number }> = {};

  // ── Table / sort / filter state ───────────────────────────────────────────
  private columns: IColumnDef[] = COLUMNS.map(c => ({ ...c }));
  private sortState: { key: string | null; direction: string } = { key: null, direction: 'default' };
  private apiFilter = {
    sortBy: null as string | null,
    sortOrder: null as string | null,
    personalStatusId: null as number | null,
    columnTextSearches: [] as Array<{ columnName: string; searchText: string }>,
  };
  // ═══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  protected onInit(): Promise<void> {
    this.siteUrl = this.context.pageContext.web.absoluteUrl;
    return Promise.all([
      this.context.aadHttpClientFactory
        .getClient(WpEmployeesWebPart.APP_ID_URI)
        .then(client => { this.apiClient = client; })
        .catch(err => console.error('[WpEmployees] AAD client init failed:', err)),
      this.context.msGraphClientFactory
        .getClient('3')
        .then((client: any) => { this.graphClient = client; })
        .catch(err => console.error('[WpEmployees] Graph client init failed:', err)),
    ]).then(() => {});
  }

  public render(): void {
    const resourceUrl = `${this.siteUrl}/SiteAssets`;
    const workbench = document.getElementById('workbenchPageContent');
    if (workbench) workbench.style.maxWidth = 'none';

    this.domElement.innerHTML =
      SharedSidebar.getHtml({ resourceUrl, siteUrl: this.siteUrl, activeNavItem: '', activeTabId: '' })
      + employees.allElementsHtml;

    SharedSidebar.initBehavior(this.domElement, this.siteUrl);
    this.initWhenReady();
    this.loadCss();

    this.rows = [];
    this.paginationMeta = null;
    this.personalStatuses = [];
    this.refEmployeeTypes = null;
    this._ssItems = {};
    this._ssPagination = {};
    this.columns = COLUMNS.map(c => ({ ...c }));
    this.sortState = { key: null, direction: 'default' };
    this.apiFilter = { sortBy: null, sortOrder: null, personalStatusId: null, columnTextSearches: [] };

    this.fetchEmployeesAdmin()
      .catch(() => {
        console.warn('[WpEmployees] API fetch failed');
        this._loadError = true;
        this.rows = [];
        this.paginationMeta = null;
      })
      .then(() => { this.initializeUI(); })
      .catch(() => { this.initializeUI(); });

    // Personal statuses are only needed for the filter dropdown and modals —
    // fetch in the background so it doesn't block the table render.
    this.fetchPersonalStatuses()
      .catch(() => { this.personalStatuses = []; })
      .then(() => { this.populateStatusDropdowns(); });
  }

  private initWhenReady(): void {
    if ((window as any).bootstrap) {
      SharedSidebar.initBehavior(this.domElement, this.siteUrl);
      return;
    }
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if ((window as any).bootstrap) {
        clearInterval(interval);
        SharedSidebar.initBehavior(this.domElement, this.siteUrl);
      } else if (attempts > 20) {
        clearInterval(interval);
        SharedSidebar.initBehavior(this.domElement, this.siteUrl);
        console.warn('[NEMKO] Bootstrap not found after waiting');
      }
    }, 100);
  }

  public dispose(): void {
    ['empNewModal', 'empEditModal'].forEach(id => this.closeModal(id));
    this._loadedCssLinks.forEach(link => link.remove());
    this._loadedCssLinks = [];
    const acStyle = document.getElementById('nemko-emp-autocomplete-css');
    if (acStyle) acStyle.remove();
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    super.dispose();
  }

  // ─── CSS ───────────────────────────────────────────────────────────────────

  private loadCss(): void {
    const base = `${this.siteUrl}/SiteAssets/resources/css`;
    const files = ['employees.css', 'nemko-modal.css'];
    files.forEach(file => SPComponentLoader.loadCss(`${base}/${file}`));
    this._loadedCssLinks = files
      .map(file => document.querySelector<HTMLLinkElement>(`link[href*="${file}"]`))
      .filter((el): el is HTMLLinkElement => el !== null);

    if (!document.getElementById('nemko-emp-autocomplete-css')) {
      const style = document.createElement('style');
      style.id = 'nemko-emp-autocomplete-css';
      style.textContent =
        '.nemko-email-suggestions{z-index:1060;max-height:200px;overflow-y:auto;' +
        'background:#fff;border:1px solid #ddd;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.15);margin-top:2px;}' +
        '.nemko-email-suggestions li{padding:8px 12px;cursor:pointer;}' +
        '.nemko-email-suggestions li:hover{background:#f0f0f0;}' +
        '.nemko-email-suggestions li.nemko-not-in-ad{border-top:1px solid #eee;}';
      document.head.appendChild(style);
    }
  }

  // ─── Search-select items cache ──────────────────────────────────────────
  private _ssItems: Record<string, Array<{ id: number; name: string }>> = {};

  private bindSearchSelects(): void {
    this.domElement.querySelectorAll<HTMLInputElement>('.nemko-ss-display').forEach(input => {
      const targetId = input.getAttribute('data-target');
      if (!targetId) return;
      const hidden = this.domElement.querySelector<HTMLInputElement>('#' + targetId);
      const list = input.parentElement?.querySelector<HTMLUListElement>('.nemko-email-suggestions');
      if (!hidden || !list) return;

      const cfg = this.findSsConfig(targetId);
      let searchDebounce = 0;

      // Items are already filtered server-side (?search=), so just render them.
      const renderItems = (): void => {
        const items = this._ssItems[targetId] || [];
        if (!items.length) { list.style.display = 'none'; return; }
        list.innerHTML = items.map(function (it: { id: number; name: string }) {
          return '<li data-id="' + it.id + '">' + it.name + '</li>';
        }).join('');
        if (document.activeElement === input) list.style.display = 'block';
      };

      input.addEventListener('input', () => {
        const q = input.value.trim();
        if (!q) { hidden.value = ''; delete hidden.dataset.name; }
        if (!cfg) return;
        clearTimeout(searchDebounce);
        searchDebounce = window.setTimeout(() => {
          this.searchSsField(cfg, q)
            .then(() => { if (document.activeElement === input) renderItems(); })
            .catch(() => {});
        }, 300);
      });
      input.addEventListener('focus', () => {
        // Kick off page 1 the first time this field is actually used, rather
        // than blocking the whole modal up front — keeps modal-open instant.
        // Also resets to the unfiltered list if a previous search is active.
        if (cfg) {
          this.ensureSsFieldFirstPage(cfg).then(() => { renderItems(); });
        }
        renderItems();
      });

      list.addEventListener('mousedown', (e: Event) => {
        e.preventDefault(); // keep focus on the input (also covers scrollbar clicks/drags)
        const li = (e.target as HTMLElement).closest('li');
        if (!li || li.classList.contains('nemko-ss-loading-more')) return;
        hidden.value = li.getAttribute('data-id') || '';
        input.value = li.textContent || '';
        hidden.dataset.name = input.value;
        list.style.display = 'none';
      });

      input.addEventListener('blur', () => {
        setTimeout(() => {
          list.style.display = 'none';
          // Selection-only: revert display to the selected item's name.
          // Fall back to the stored name — the selected item may not be in
          // the current (server-filtered) result set.
          const selectedId = hidden.value;
          if (selectedId) {
            const items = this._ssItems[targetId] || [];
            const match = items.filter(function (it: { id: number; name: string }) { return String(it.id) === selectedId; })[0];
            input.value = match ? match.name : (hidden.dataset.name || '');
          } else {
            input.value = '';
          }
        }, 200);
      });

      // Infinite scroll: load the next page once the dropdown list is
      // scrolled near the bottom, then re-render (still applying whatever
      // filter text is currently typed).
      if (cfg) {
        let loadingMore = false;
        list.addEventListener('scroll', () => {
          const pag = this._ssPagination[cfg.key];
          if (!pag || pag.hasMore === false || pag.loading || loadingMore) return;
          const nearBottom = (list.scrollTop + list.clientHeight) >= (list.scrollHeight - 40);
          if (!nearBottom) return;

          loadingMore = true;
          const loadingLi = document.createElement('li');
          loadingLi.className = 'nemko-ss-loading-more';
          loadingLi.textContent = 'Loading...';
          loadingLi.style.cursor = 'default';
          loadingLi.style.textAlign = 'center';
          loadingLi.style.color = '#999';
          list.appendChild(loadingLi);

          this.fetchSsFieldNextPage(cfg)
            .then(() => { renderItems(); })
            .catch(() => {})
            .then(() => { loadingMore = false; });
        });
      }
    });
  }

  // ─── Graph user search & email autocomplete ─────────────────────────────

  private async searchUsers(query: string): Promise<Array<{ displayName: string; mail: string }>> {
    if (!this.graphClient || query.length < 2) return [];
    try {
      const escaped = query.replace(/'/g, "''");
      const result = await this.graphClient
        .api('/users')
        .filter("startswith(displayName,'" + escaped + "') or startswith(mail,'" + escaped + "')")
        .select('displayName,mail')
        .top(10)
        .get();
      return (result.value || [])
        .filter(function (u: any) { return u.mail; })
        .map(function (u: any) { return { displayName: u.displayName || '', mail: u.mail }; });
    } catch {
      return [];
    }
  }

  private bindEmailAutocomplete(inputId: string, suggestionsId: string): void {
    const input = this.domElement.querySelector<HTMLInputElement>('#' + inputId);
    const list = this.domElement.querySelector<HTMLUListElement>('#' + suggestionsId);
    if (!input || !list) return;

    let cachedResults: Array<{ displayName: string; mail: string }> = [];

    const renderSuggestions = (items: Array<{ displayName: string; mail: string }>, query: string): void => {
      cachedResults = items;
      var html = items.map(function (u) {
        return '<li data-mail="' + u.mail + '">' +
          '<span class="fw-medium">' + u.displayName + '</span>' +
          ' <span class="text-muted text-sm">' + u.mail + '</span></li>';
      }).join('');

      // Append "Not available in AD" option only when the typed text has no exact AD match
      var typedVal = query || input.value.trim();
      var typedLower = typedVal.toLowerCase();
      var hasExactMatch = items.some(function (u) { return (u.mail || '').toLowerCase() === typedLower; });
      if (typedVal && !hasExactMatch) {
        html += '<li data-mail="' + typedVal + '" class="nemko-not-in-ad">' +
          '<span class="text-muted fst-italic">' + typedVal + '</span>' +
          ' <span class="text-muted text-sm">— Not available in AD</span></li>';
      }

      if (!html) { list.style.display = 'none'; return; }
      list.innerHTML = html;
      list.style.display = 'block';
    };

    input.addEventListener('input', () => {
      clearTimeout(this._emailDebounceTimer);
      const val = input.value.trim();
      if (val.length < 2) { list.style.display = 'none'; cachedResults = []; return; }
      this._emailDebounceTimer = setTimeout(() => {
        this.searchUsers(val).then(function (items) { renderSuggestions(items, val); });
      }, 300) as any;
    });

    list.addEventListener('mousedown', (e: Event) => {
      const li = (e.target as HTMLElement).closest('li');
      if (!li) return;
      e.preventDefault();
      input.value = li.getAttribute('data-mail') || '';
      list.style.display = 'none';
    });

    input.addEventListener('blur', () => {
      setTimeout(() => { list.style.display = 'none'; }, 200);
    });

    input.addEventListener('focus', () => {
      if (input.value.trim().length >= 2 && cachedResults.length) {
        renderSuggestions(cachedResults, input.value.trim());
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UI INITIALIZATION & BINDING
  // ═══════════════════════════════════════════════════════════════════════════

  private initializeUI(): void {
    this.populateStatusDropdowns();
    this.buildColVisibilityDropdown();
    this.renderTable();
    this.bindAll();
  }

  private bindAll(): void {
    this.bindSearch();
    this.bindDelete();
    this.bindNewModal();
    this.bindEditModal();
    this.bindSearchSelects();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // API LAYER
  // ═══════════════════════════════════════════════════════════════════════════

  private async fetchEmployeesAdmin(
    page: number = 1,
    sortBy?: string | null,
    sortOrder?: string | null,
    personalStatusId?: number | null,
    columnTextSearches?: Array<{ columnName: string; searchText: string }> | null
  ): Promise<void> {
    this._loadError = false;
    if (!this.apiClient) {
      this._loadError = true;
      this.rows = [];
      this.paginationMeta = null;
      return;
    }
    const qs = new URLSearchParams();
    qs.set('page', String(page));
    if (sortBy) qs.set('sortBy', sortBy);
    if (sortOrder) qs.set('sortOrder', sortOrder);
    if (personalStatusId != null) qs.set('personalStatusId', String(personalStatusId));
    if (columnTextSearches && columnTextSearches.length > 0) {
      qs.set('columnTextSearches', JSON.stringify(columnTextSearches));
    }

    const url = `${WpEmployeesWebPart.API_URL}?${qs.toString()}`;
    const response: HttpClientResponse = await this.apiClient.get(url, AadHttpClient.configurations.v1);

    if (!response.ok) {
      this._loadError = true;
      this.rows = [];
      this.paginationMeta = null;
      return;
    }

    const json: IEmployeeApiResponse = await response.json();
    const items = json?.data?.items ?? [];

    this.rows = items.map((item: IEmployeeApiItem): IEmployeeRow => ({
      id: item.id,
      name: item.name ?? '',
      personal_status: item.personalStatus ?? '',
      office: item.office ?? '',
      approval_manager: item.approvalManager ?? '',
      direct_manager: item.directManager ?? '',
      localGM: item.localGM ?? '',
      quality_manager: item.qualityManager ?? '',
      HR_contact: item.hrContact ?? '',
      email: item.email ?? '',
      direct_manager_email: item.directManagerEmail ?? '',
      location: item.location ?? '',
      employee_type: item.employeeType ?? '',
    }));
    this.paginationMeta = json?.data?.pagination ?? null;
  }

  private async fetchPersonalStatuses(): Promise<void> {
    if (!this.apiClient) return;
    const response: HttpClientResponse = await this.apiClient.get(
      WpEmployeesWebPart.PERSONAL_STATUS_URL, AadHttpClient.configurations.v1
    );
    if (!response.ok) { this.personalStatuses = []; return; }
    const json = await response.json();
    this.personalStatuses = (json?.data?.items ?? []).map(
      (item: IPersonalStatus) => ({ id: item.id, name: item.name ?? '' })
    );
  }

  private async fetchReferenceList(url: string): Promise<Array<{ id: number; name: string }>> {
    if (!this.apiClient) return [];
    const response: HttpClientResponse = await this.apiClient.get(url, AadHttpClient.configurations.v1);
    if (!response.ok) return [];
    const json = await response.json();
    return (json?.data?.items ?? []).map(
      (item: IPersonalStatus) => ({ id: item.id, name: item.name ?? '' })
    );
  }

  // Fetches ONE page of a paginated reference-data endpoint.
  private async fetchRefPage(
    baseUrl: string, page: number, search: string = ''
  ): Promise<{ items: Array<{ id: number; name: string }>; hasMore: boolean }> {
    if (!this.apiClient) return { items: [], hasMore: false };
    const sep = baseUrl.indexOf('?') !== -1 ? '&' : '?';
    const searchQs = search ? `&search=${encodeURIComponent(search)}` : '';
    try {
      const response: HttpClientResponse = await this.apiClient.get(
        `${baseUrl}${sep}page=${page}${searchQs}`, AadHttpClient.configurations.v1
      );
      if (!response.ok) return { items: [], hasMore: false };
      const json = await response.json();
      const items: any[] = json?.data?.items ?? [];
      return {
        items: items.map((item: IPersonalStatus) => ({ id: item.id, name: item.name ?? '' })),
        hasMore: json?.data?.pagination?.hasMore === true,
      };
    } catch {
      return { items: [], hasMore: false };
    }
  }

  // Loads page 1 for a search-select field's data source — only once per key,
  // so re-opening either the "new" or "edit" modal reuses whatever was already
  // fetched instead of re-fetching. Populates _ssItems for both shared targets.
  private async ensureSsFieldFirstPage(cfg: { key: string; url: string; targets: string[] }): Promise<void> {
    const pag = this._ssPagination[cfg.key];
    if (pag && pag.search === '') return;
    await this.searchSsField(cfg, '');
  }

  // Fetches page 1 of a search-select field's data source for the given search
  // term (?search=) and replaces the cached items. reqId guards against an
  // older, slower response overwriting a newer search.
  private async searchSsField(cfg: { key: string; url: string; targets: string[] }, search: string): Promise<void> {
    const reqId = (this._ssPagination[cfg.key]?.reqId || 0) + 1;
    this._ssPagination[cfg.key] = { page: 1, hasMore: true, loading: true, search, reqId };
    const { items, hasMore } = await this.fetchRefPage(cfg.url, 1, search);
    if (this._ssPagination[cfg.key]?.reqId !== reqId) return;
    cfg.targets.forEach(t => { this._ssItems[t] = items; });
    this._ssPagination[cfg.key] = { page: 1, hasMore, loading: false, search, reqId };
  }

  // Loads the next page for a search-select field (triggered by scrolling its
  // dropdown list near the bottom). No-op if already loading or exhausted.
  private async fetchSsFieldNextPage(cfg: { key: string; url: string; targets: string[] }): Promise<void> {
    const pag = this._ssPagination[cfg.key];
    if (!pag || pag.loading || pag.hasMore === false) return;
    const nextPage = pag.page + 1;
    this._ssPagination[cfg.key] = { ...pag, loading: true };
    const { items, hasMore } = await this.fetchRefPage(cfg.url, nextPage, pag.search);
    if (this._ssPagination[cfg.key]?.reqId !== pag.reqId) return;
    const existing = this._ssItems[cfg.targets[0]] || [];
    const merged = existing.concat(items);
    cfg.targets.forEach(t => { this._ssItems[t] = merged; });
    this._ssPagination[cfg.key] = { ...pag, page: nextPage, hasMore, loading: false };
  }

  private findSsConfig(targetId: string): { key: string; url: string; targets: string[] } | null {
    return WpEmployeesWebPart.SS_FIELD_CONFIGS.filter(c => c.targets.indexOf(targetId) !== -1)[0] || null;
  }

  private async fetchEditRefData(): Promise<void> {
    const tasks: Promise<unknown>[] =
      WpEmployeesWebPart.SS_FIELD_CONFIGS.map(cfg => this.ensureSsFieldFirstPage(cfg).catch(() => {}));

    if (this.refEmployeeTypes === null) {
      tasks.push(
        this.fetchReferenceList(WpEmployeesWebPart.EMPLOYEE_TYPE_URL)
          .then(items => { this.refEmployeeTypes = items; })
          .catch(() => { this.refEmployeeTypes = []; })
      );
    }

    await Promise.all(tasks);
  }

  private async fetchEmployeeDetail(id: number): Promise<void> {
    if (!this.apiClient) { this.employeeDetail = null; return; }
    const response: HttpClientResponse = await this.apiClient.get(
      `${WpEmployeesWebPart.API_URL}/${id}`, AadHttpClient.configurations.v1
    );
    if (!response.ok) { this.employeeDetail = null; return; }
    const json = await response.json();
    this.employeeDetail = (json?.data ?? null) as IEmployeeDetailData | null;
  }

  private async updateEmployee(
    id: number,
    payload: {
      name: string; email: string; personalStatusId: number | null;
      officeId: number | null; approvalManagerId: number | null;
      directManagerId: number | null; localGMId: number | null;
      qualityManagerId: number | null; hrContactId: number | null;
      leadershipFunction: boolean; isAdmin: boolean; employeeTypeId: number | null;
    }
  ): Promise<void> {
    if (!this.apiClient) throw new Error('API client not ready');
    const response: HttpClientResponse = await this.apiClient.fetch(
      `${WpEmployeesWebPart.API_URL}/${id}`, AadHttpClient.configurations.v1,
      { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    );
    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      const errors = (json as any)?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        throw new Error(errors.map((e: any) => e.error ?? e.message ?? JSON.stringify(e)).join('\n'));
      }
      throw new Error((json as any)?.message ?? `Update failed (${response.status})`);
    }
  }

  private async createEmployee(payload: {
    name: string; email: string; personalStatusId: number | null;
    officeId: number | null; approvalManagerId: number | null;
    directManagerId: number | null; localGMId: number | null;
    employeeTypeId: number | null; qualityManagerId: number | null;
    hrContactId: number | null; leadershipFunction: boolean; isAdmin: boolean;
  }): Promise<void> {
    if (!this.apiClient) throw new Error('API client not ready');
    const response: HttpClientResponse = await this.apiClient.fetch(
      WpEmployeesWebPart.API_URL, AadHttpClient.configurations.v1,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    );
    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      const errors = (json as any)?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        throw new Error(errors.map((e: any) => e.error ?? e.message ?? JSON.stringify(e)).join('\n'));
      }
      throw new Error((json as any)?.message ?? `Create failed (${response.status})`);
    }
  }

  private async deleteEmployeeApi(ids: number[]): Promise<void> {
    if (!this.apiClient) throw new Error('API client not ready');
    const response: HttpClientResponse = await this.apiClient.fetch(
      WpEmployeesWebPart.API_URL, AadHttpClient.configurations.v1,
      { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ids) }
    );
    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      const errors = (json as any)?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        throw new Error(errors.map((e: any) => e.error ?? e.message ?? JSON.stringify(e)).join('\n'));
      }
      throw new Error((json as any)?.message ?? `Delete failed (${response.status})`);
    }
  }

  private async deleteAllEmployees(): Promise<void> {
    if (!this.apiClient) throw new Error('API client not ready');
    const response: HttpClientResponse = await this.apiClient.fetch(
      `${WpEmployeesWebPart.API_URL}/all`, AadHttpClient.configurations.v1,
      { method: 'DELETE' }
    );
    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      const errors = (json as any)?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        throw new Error(errors.map((e: any) => e.error ?? e.message ?? JSON.stringify(e)).join('\n'));
      }
      throw new Error((json as any)?.message ?? `Delete all failed (${response.status})`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SERVER-SIDE FILTER & REFRESH
  // ═══════════════════════════════════════════════════════════════════════════

  private applyServerFilters(page: number): void {
    this.fetchEmployeesAdmin(
      page,
      this.apiFilter.sortBy,
      this.apiFilter.sortOrder,
      this.apiFilter.personalStatusId,
      this.apiFilter.columnTextSearches.length ? this.apiFilter.columnTextSearches : null
    )
      .then(() => { this.renderTable(); })
      .catch((err: unknown) => {
        console.warn('[WpEmployees] filter fetch error:', err);
        this._loadError = true;
        this.rows = [];
        this.paginationMeta = null;
        this.renderTable();
      });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SORT
  // ═══════════════════════════════════════════════════════════════════════════

  private cycleSort(key: string): void {
    if (this.sortState.key !== key) {
      this.sortState.key = key;
      this.sortState.direction = 'asc';
    } else {
      const idx = SORT_CYCLE.indexOf(this.sortState.direction);
      this.sortState.direction = SORT_CYCLE[(idx + 1) % SORT_CYCLE.length];
      if (this.sortState.direction === 'default') this.sortState.key = null;
    }
    const sortCol = this.columns.filter((c: IColumnDef) => c.key === this.sortState.key)[0];
    this.apiFilter.sortBy = (this.sortState.direction !== 'default' && sortCol?.sortApiKey)
      ? sortCol.sortApiKey : null;
    this.apiFilter.sortOrder = this.sortState.direction !== 'default' ? this.sortState.direction : null;
    this.renderTable();
    this.applyServerFilters(1);
  }

  private getSortClass(key: string): string {
    return this.sortState.key === key ? `sort-${this.sortState.direction}` : '';
  }

  private getSortTitle(key: string): string {
    if (this.sortState.key !== key || this.sortState.direction === 'default') return 'Click to sort ascending';
    if (this.sortState.direction === 'asc') return 'Click to sort descending';
    return 'Click to reset sort';
  }

  private getSortSVG(key: string): string {
    const isActive = this.sortState.key === key;
    const dir = isActive ? this.sortState.direction : 'default';
    const active = 'var(--color-primary, #006e8c)';
    const inactive = '#C0C0C0';
    const upFill = (isActive && dir === 'asc') ? active : inactive;
    const downFill = (isActive && dir === 'desc') ? active : inactive;
    return `<svg width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 1L1 5H9L5 1Z" fill="${upFill}" />
      <path d="M5 13L1 9H9L5 13Z" fill="${downFill}" />
    </svg>`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDERING
  // ═══════════════════════════════════════════════════════════════════════════

  private renderTable(): void {
    const container = this.domElement.querySelector('#employees-table');
    if (!container) return;
    const table = container.querySelector('.nemko-table-container .table') as HTMLTableElement;
    if (!table) return;

    const visCols = this.columns.filter(c => c.visible);

    // thead
    const theadTr = table.querySelector('thead tr');
    if (theadTr) {
      theadTr.innerHTML =
        `<th class="table-chkbox-col">
          <label class="nemko-frm-chkbox d-flex">
            <input type="checkbox" id="select-all-emp" class="form-check-input d-none" />
            <span class="chkbox-icon"></span>
          </label>
        </th>` +
        visCols.map(col => col.sortable
          ? `<th class="sortable-col" data-col-key="${col.key}"
                style="cursor:pointer;${this.nmColWidthStyle(col.key, visCols)}" title="${this.getSortTitle(col.key)}">
              <div class="w-100 d-flex justify-content-between align-items-center gap-1"
                  style="flex-wrap:nowrap;pointer-events:none;">
                <p class="text-color-3 font-medium text-sm" style="margin:0;min-width:0;white-space:normal;">${col.label}</p>
                <span class="sort-icon ${this.getSortClass(col.key)}"
                    style="display:inline-flex;flex-shrink:0;align-items:center;">
                  ${this.getSortSVG(col.key)}
                </span>
              </div>
            </th>`
          : `<th data-col-key="${col.key}" style="${this.nmColWidthStyle(col.key, visCols)}"><div class="w-100 d-flex align-items-center">
              <p class="text-color-3 font-medium text-sm" style="white-space:normal;">${col.label}</p>
            </div></th>`
        ).join('');

      theadTr.querySelectorAll<HTMLElement>('.sortable-col').forEach(th => {
        th.addEventListener('click', () => {
          const key = th.dataset.colKey;
          if (key) this.cycleSort(key);
        });
      });
    }

    // tbody
    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    if (!this.rows.length && this._loadError) {
      // Load failed: same error state as my-qualifications.js (audit D10 / handover C4)
      tbody.innerHTML = `<tr><td colspan="999" class="text-center py-4 text-color-3 text-sm font-medium">` +
        `Could not load data. <a href="#" role="button" class="nemko-table-retry-link">Try again</a></td></tr>`;
      const retryLink = tbody.querySelector('.nemko-table-retry-link');
      if (retryLink) {
        retryLink.addEventListener('click', (e) => {
          e.preventDefault();
          this.applyServerFilters(this.paginationMeta?.pageNumber ?? 1);
        });
      }
    } else if (!this.rows.length) {
      tbody.innerHTML = `<tr><td colspan="999" class="text-center py-4 text-color-3 text-sm font-medium">No records found. Try adjusting your search criteria.</td></tr>`;
    } else {
      tbody.innerHTML = this.rows.map((row, i) => `
        <tr class="emp-table-row" data-index="${i}" style="cursor:pointer;">
          <td class="table-chkbox-col">
            <label class="nemko-frm-chkbox d-flex">
              <input type="checkbox" class="row-checkbox form-check-input d-none" data-index="${i}" />
              <span class="chkbox-icon"></span>
            </label>
          </td>
          ${visCols.map(col => `<td>${row[col.key] ?? ''}</td>`).join('')}
        </tr>
      `).join('');

      table.querySelectorAll<HTMLElement>('.emp-table-row').forEach(tr => {
        tr.addEventListener('click', (e: Event) => {
          if ((e.target as HTMLElement).closest('.table-chkbox-col')) return;
          this.openEditModal(parseInt(tr.dataset.index ?? '0', 10));
        });
      });

      // Select-All
      const selectAll = table.querySelector<HTMLInputElement>('#select-all-emp');
      const rowCheckboxes = (): NodeListOf<HTMLInputElement> => table.querySelectorAll('.row-checkbox');

      if (selectAll) {
        selectAll.addEventListener('change', () => {
          rowCheckboxes().forEach(cb => { cb.checked = selectAll.checked; });
        });
        table.addEventListener('change', (e: Event) => {
          if (!(e.target as HTMLElement).classList.contains('row-checkbox')) return;
          const all: HTMLInputElement[] = [].slice.call(rowCheckboxes());
          selectAll.checked = all.every((cb: HTMLInputElement) => cb.checked);
          selectAll.indeterminate = !selectAll.checked && all.some((cb: HTMLInputElement) => cb.checked);
        });
      }
    }

    this.renderPagination();
  }

  // ─── Column widths (audit D4 / handover P7, same pattern as my-qualifications.js) ──
  // Relative weights shared over the visible columns so the table fits its
  // container instead of scrolling sideways. The checkbox column is not weighted.
  private static readonly NM_COL_WEIGHTS: Record<string, number> = {
    name: 16, personal_status: 10, office: 12, approval_manager: 13,
    direct_manager: 13, localGM: 12, quality_manager: 13, HR_contact: 12
  };
  private nmColWidthStyle(key: string, visCols: Array<{ key: string }>): string {
    const weights = WpEmployeesWebPart.NM_COL_WEIGHTS;
    let total = 0;
    visCols.forEach(c => { total += (weights[c.key] || 10); });
    const pct = ((weights[key] || 10) / (total || 1)) * 100;
    return `width:${pct.toFixed(2)}%;min-width:0;`;
  }

  private renderPagination(): void {
    const container = this.domElement.querySelector('#employees-table');
    if (!container) return;
    const paginationEls = container.querySelectorAll<HTMLElement>('.nemko-pagination');
    if (!paginationEls.length) return;

    const meta = this.paginationMeta;
    const page = meta?.pageNumber ?? 1;
    const last = meta?.lastPageNumber ?? 1;
    const total = meta?.totalCount ?? 0;
    const size = meta?.pageSize ?? 0;
    const hasBack = !!meta?.hasBack;
    const hasMore = !!meta?.hasMore;
    const start = total === 0 ? 0 : (page - 1) * size + 1;
    const end = size > 0 ? Math.min(page * size, total) : total;

    const paginationHtml =
      `<li class="page-item ${!hasBack ? 'disabled' : 'cursor-pointer'}" data-page="first">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.72266 4.53745L8.16766 0.60786L8.16766 8.46704L2.72266 4.53745Z" fill="#989898"/><rect width="1.815" height="8.1675" fill="#989898"/></svg>
      </li>
      <li class="page-item ${!hasBack ? 'disabled' : 'cursor-pointer'}" data-page="prev">
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M-1.9834e-07 4.53745L5.445 0.60786L5.445 8.46704L-1.9834e-07 4.53745Z" fill="#989898"/><path d="M6.35352 4.53745L11.7985 0.60786L11.7985 8.46704L6.35352 4.53745Z" fill="#989898"/></svg>
      </li>
      <li class="page-item">
        <span class="font-medium font-inter text-black text-xs">${start} to ${end} of ${total}</span>
      </li>
      <li class="page-item ${!hasMore ? 'disabled' : 'cursor-pointer'}" data-page="next">
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M13.6125 4.53745L8.1675 0.60786L8.1675 8.46704L13.6125 4.53745Z" fill="#989898"/><path d="M7.25898 4.53745L1.81398 0.60786L1.81398 8.46704L7.25898 4.53745Z" fill="#989898"/></svg>
      </li>
      <li class="page-item ${!hasMore ? 'disabled' : 'cursor-pointer'}" data-page="last">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M7.25984 4.53751L1.81484 0.607921L1.81484 8.4671L7.25984 4.53751Z" fill="#989898"/><rect width="1.815" height="8.1675" transform="matrix(-1 0 0 1 9.9825 0)" fill="#989898"/></svg>
      </li>`;

    paginationEls.forEach(paginationEl => {
      paginationEl.classList.add('justify-content-start');
      // Audit D9: hide page navigation when there is nothing to page through
      paginationEl.style.visibility = total === 0 ? 'hidden' : '';
      paginationEl.innerHTML = paginationHtml;
      paginationEl.querySelectorAll<HTMLElement>('.page-item:not(.disabled)').forEach(item => {
        item.addEventListener('click', () => {
          const action = item.dataset.page;
          let newPage = page;
          if (action === 'first') newPage = 1;
          if (action === 'prev') newPage = Math.max(1, page - 1);
          if (action === 'next') newPage = Math.min(last, page + 1);
          if (action === 'last') newPage = last;
          if (newPage === page) return;
          this.applyServerFilters(newPage);
        });
      });
    });
  }

  private buildColVisibilityDropdown(): void {
    const ddMenu = this.domElement.querySelector<HTMLElement>('#employees-col-visibility');
    if (!ddMenu) return;
    const ddCols = this.columns.filter(c => c.dropdown);

    ddMenu.innerHTML = ddCols.map(col => `
      <li class="py-10">
        <label class="dropdown-item d-flex align-items-center gap-2" data-col-key="${col.key}">
          <input type="checkbox" ${col.visible ? 'checked' : ''} class="d-none" name="col-heading" />
          <span class="chkbox-icon ${col.visible ? 'active' : ''}"></span>
          <p class="font-medium text-sm text-color-3">${col.label}</p>
        </label>
      </li>
    `).join('');

    ddMenu.querySelectorAll<HTMLInputElement>('input[name="col-heading"]').forEach(cb => {
      cb.addEventListener('change', () => {
        const key = cb.closest('label')?.getAttribute('data-col-key');
        const col = this.columns.filter((c: IColumnDef) => c.key === key)[0];
        if (!col) return;
        col.visible = cb.checked;
        cb.closest('label')?.querySelector('.chkbox-icon')?.classList.toggle('active', cb.checked);
        this.renderTable();
      });
    });
  }

  private populateStatusDropdowns(): void {
    const statuses = this.personalStatuses;

    const filterSel = this.domElement.querySelector<HTMLSelectElement>('#empStatusFilter');
    if (filterSel) {
      const current = filterSel.value;
      filterSel.innerHTML = '<option value="">All</option>';
      statuses.forEach(s => {
        const opt = document.createElement('option');
        opt.value = String(s.id);
        opt.textContent = s.name;
        if (String(s.id) === current) opt.selected = true;
        filterSel.appendChild(opt);
      });
    }

    const newSel = this.domElement.querySelector<HTMLSelectElement>('#personalStatus');
    if (newSel) {
      newSel.innerHTML = '<option value="" disabled selected></option>';
      statuses.forEach(s => {
        const opt = document.createElement('option');
        opt.value = String(s.id);
        opt.textContent = s.name;
        newSel.appendChild(opt);
      });
    }

    const editSel = this.domElement.querySelector<HTMLSelectElement>('#editPersonalStatus');
    if (editSel) {
      const current = editSel.value;
      editSel.innerHTML = '<option value="" disabled selected></option>';
      statuses.forEach(s => {
        const opt = document.createElement('option');
        opt.value = String(s.id);
        opt.textContent = s.name;
        if (String(s.id) === current) opt.selected = true;
        editSel.appendChild(opt);
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODAL HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  // Same approach as WpMyQualificationsWebPart: hand off to the real Bootstrap
  // modal plugin (via jQuery) instead of toggling classes/inline styles by hand.
  // This gives us the dark backdrop, click-outside-to-close and Esc-to-close
  // behaviour for free, and keeps both web parts consistent.
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

  // ═══════════════════════════════════════════════════════════════════════════
  // FORM HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  private setField(id: string, val: string | number | undefined | null): void {
    const el = this.domElement.querySelector<HTMLInputElement>('#' + id);
    if (el) el.value = val != null ? String(val) : '';
  }

  private setSelectById(id: string, numId: number | null | undefined): void {
    const el = this.domElement.querySelector('#' + id);
    if (!el) return;

    // Search-select (hidden input)
    if (el.tagName === 'INPUT' && (el as HTMLInputElement).type === 'hidden') {
      const hidden = el as HTMLInputElement;
      hidden.value = numId != null ? String(numId) : '';
      const display = hidden.parentElement?.querySelector<HTMLInputElement>('.nemko-ss-display');
      if (display) {
        if (numId == null) { display.value = ''; delete hidden.dataset.name; return; }
        const items = this._ssItems[id] || [];
        const match = items.filter(function (it: { id: number; name: string }) { return it.id === numId; })[0];
        display.value = match ? match.name : '';
        hidden.dataset.name = display.value;
      }
      return;
    }

    // Regular <select>
    const sel = el as HTMLSelectElement;
    if (numId == null) { sel.selectedIndex = 0; return; }
    let found = false;
    for (let i = 0; i < sel.options.length; i++) {
      if (Number(sel.options[i].value) === Number(numId)) { sel.selectedIndex = i; found = true; break; }
    }
    if (!found) sel.selectedIndex = 0;
  }

  // For the 6 paginated search-selects: sets the hidden id + visible display
  // text directly from a known {id, name} pair (as returned by the employee
  // detail endpoint), instead of looking the id up in whatever page of the
  // reference list happens to be loaded — the assigned manager/office may live
  // beyond page 1. Also seeds it into _ssItems so opening the dropdown shows
  // the current selection immediately, even before any page is fetched.
  private setSelectByIdAndName(id: string, numId: number | null | undefined, name: string | undefined): void {
    const el = this.domElement.querySelector('#' + id);
    if (!el) return;

    if (el.tagName === 'INPUT' && (el as HTMLInputElement).type === 'hidden') {
      const hidden = el as HTMLInputElement;
      hidden.value = numId != null ? String(numId) : '';
      const display = hidden.parentElement?.querySelector<HTMLInputElement>('.nemko-ss-display');
      if (display) display.value = (numId != null && name) ? name : '';
      if (numId != null && name) hidden.dataset.name = name;
      else delete hidden.dataset.name;

      if (numId != null && name) {
        const items = this._ssItems[id] || (this._ssItems[id] = []);
        if (!items.some(it => it.id === numId)) items.unshift({ id: numId, name });
      }
      return;
    }

    // Fallback for any non-search-select field
    this.setSelectById(id, numId);
  }

  private setSelectByText(id: string, text: string): void {
    const el = this.domElement.querySelector('#' + id);
    if (!el) return;

    // Search-select (hidden input)
    if (el.tagName === 'INPUT' && (el as HTMLInputElement).type === 'hidden') {
      const hidden = el as HTMLInputElement;
      const items = this._ssItems[id] || [];
      const match = items.filter(function (it: { id: number; name: string }) { return it.name === text; })[0];
      hidden.value = match ? String(match.id) : '';
      if (match) hidden.dataset.name = match.name;
      else delete hidden.dataset.name;
      const display = hidden.parentElement?.querySelector<HTMLInputElement>('.nemko-ss-display');
      if (display) display.value = text || '';
      return;
    }

    // Regular <select>
    const sel = el as HTMLSelectElement;
    let found = false;
    for (let i = 0; i < sel.options.length; i++) {
      if (sel.options[i].text === text || sel.options[i].value === text) { sel.selectedIndex = i; found = true; break; }
    }
    if (!found) sel.selectedIndex = 0;
  }

  private getFieldText(id: string): string {
    return (this.domElement.querySelector<HTMLInputElement>('#' + id)?.value ?? '').trim();
  }

  private getFieldNum(id: string): number | null {
    const v = this.domElement.querySelector<HTMLSelectElement>('#' + id)?.value;
    return (v && v !== '') ? Number(v) : null;
  }

  // ─── Dropdown Population ───────────────────────────────────────────────────

  private fillSelect(id: string, items: Array<{ id: number; name: string }> | null): void {
    const el = this.domElement.querySelector('#' + id);
    if (!el) return;

    // Search-select (hidden input): store items for autocomplete filtering
    if (el.tagName === 'INPUT' && (el as HTMLInputElement).type === 'hidden') {
      this._ssItems[id] = items || [];
      return;
    }

    // Regular <select>: populate options
    const sel = el as HTMLSelectElement;
    const currentVal = sel.value;
    sel.innerHTML = '<option value=""></option>';
    (items || []).forEach(item => {
      const opt = document.createElement('option');
      opt.value = String(item.id);
      opt.textContent = item.name;
      sel.appendChild(opt);
    });
    if (currentVal) sel.value = currentVal;
  }

  // office/approvalManager/directManager/localGM/qualityManager/hrContact are
  // populated directly into _ssItems by ensureSsFieldFirstPage — no fillSelect
  // needed for them here. employeeType stays a plain <select>, untouched.
  private populateEditSelects(): void {
    this.fillSelect('editEmployeeType', this.refEmployeeTypes);
  }

  private populateNewSelects(): void {
    this.fillSelect('newEmployeeType', this.refEmployeeTypes);
  }

  private populateEditFromDetail(d: IEmployeeDetailData): void {
    this.setField('editFullName', d.name);
    this.setField('editEmailIp', d.email);
    this.setSelectById('editEmployeeType', d.employeeType?.id);
    this.setSelectById('editPersonalStatus', d.personalStatus?.id);
    this.setSelectByIdAndName('editOffice', d.office?.id, d.office?.name);
    this.setSelectByIdAndName('editApprovalManager', d.approvalManager?.id, d.approvalManager?.data?.name);
    this.setSelectByIdAndName('editDirectManger', d.directManager?.id, d.directManager?.data?.name);
    this.setSelectByIdAndName('editLocalGMList', d.localGM?.id, d.localGM?.data?.name);
    this.setSelectByIdAndName('editQualityManger', d.qualityManager?.id, d.qualityManager?.data?.name);
    this.setSelectByIdAndName('editHRContact', d.hrContact?.id, d.hrContact?.data?.name);

    const radios = this.domElement.querySelectorAll<HTMLInputElement>('input[name="editLeadershipFunction"]');
    if (radios.length >= 2) { radios[0].checked = !!d.leadershipFunction; radios[1].checked = !d.leadershipFunction; }
    const adminRadios = this.domElement.querySelectorAll<HTMLInputElement>('input[name="editIsAdmin"]');
    if (adminRadios.length >= 2) { adminRadios[0].checked = !!d.isAdmin; adminRadios[1].checked = !d.isAdmin; }

    this.setField('editEmployeeId', d.id);
  }

  private populateEditFromRow(row: IEmployeeRow): void {
    this.setField('editFullName', row.name);
    this.setField('editEmailIp', row.email);
    this.setSelectByText('editEmployeeType', row.employee_type);
    this.setSelectByText('editPersonalStatus', row.personal_status);
    this.setSelectByText('editOffice', row.office);
    this.setSelectByText('editApprovalManager', row.approval_manager);
    this.setSelectByText('editDirectManger', row.direct_manager);
    this.setSelectByText('editLocalGMList', row.localGM);
    this.setSelectByText('editQualityManger', row.quality_manager);
    this.setSelectByText('editHRContact', row.HR_contact);
    this.setField('editEmployeeId', row.id || '');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODAL WORKFLOWS
  // ═══════════════════════════════════════════════════════════════════════════

  private resetNewModal(): void {
    const modal = this.domElement.querySelector('#empNewModal');
    if (!modal) return;
    modal.querySelectorAll<HTMLInputElement>('input[type="text"], input[type="email"]').forEach(el => { el.value = ''; });
    modal.querySelectorAll<HTMLInputElement>('input[type="hidden"]').forEach(el => { el.value = ''; delete el.dataset.name; });
    modal.querySelectorAll<HTMLSelectElement>('select').forEach(el => { el.selectedIndex = 0; });
    const radios = modal.querySelectorAll<HTMLInputElement>('input[name="radioDefault2"]');
    radios.forEach(r => { r.checked = false; });
    if (radios.length) radios[radios.length - 1].checked = true;
    const adminRadios = modal.querySelectorAll<HTMLInputElement>('input[name="newIsAdmin"]');
    adminRadios.forEach(r => { r.checked = false; });
    if (adminRadios.length) adminRadios[adminRadios.length - 1].checked = true;
    modal.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    modal.querySelectorAll<HTMLElement>('.invalid-feedback').forEach(el => { el.style.display = ''; });
  }

  private openNewModal(): void {
    this.resetNewModal();
    this.openModal('empNewModal');

    const modalBody = this.domElement.querySelector('#empNewModal .modal-body') as HTMLElement;
    const setLoading = (on: boolean): void => {
      if (!modalBody) return;
      modalBody.style.opacity = on ? '0.5' : '';
      modalBody.style.pointerEvents = on ? 'none' : '';
    };

    setLoading(true);
    this.fetchEditRefData()
      .then(() => {
        this.populateNewSelects();
        const statuses = this.personalStatuses;
        const statusEl = this.domElement.querySelector<HTMLSelectElement>('#personalStatus');
        if (statusEl) {
          statusEl.innerHTML = '<option value="" disabled selected></option>';
          statuses.forEach(s => {
            const opt = document.createElement('option');
            opt.value = String(s.id);
            opt.textContent = s.name;
            statusEl.appendChild(opt);
          });
        }
      })
      .catch(() => {})
      .then(() => { setLoading(false); });
  }

  private openEditModal(rowIndex: number): void {
    if (rowIndex < 0 || rowIndex >= this.rows.length) return;
    const row = this.rows[rowIndex];

    this.openModal('empEditModal');

    // Same loading/content swap as WpMyQualificationsWebPart's edit modal —
    // show a "Loading..." placeholder instead of the empty/dimmed form while
    // reference data + employee detail are being fetched.
    const loadingEl = this.domElement.querySelector('#empEditModalLoading') as HTMLElement;
    const contentEl = this.domElement.querySelector('#empEditModalContent') as HTMLElement;
    const setLoading = (on: boolean): void => {
      if (loadingEl) loadingEl.style.display = on ? 'block' : 'none';
      if (contentEl) contentEl.style.display = on ? 'none' : '';
    };

    setLoading(true);

    const refPromise = this.fetchEditRefData().catch(() => {});
    const detailPromise = (row.id && this.apiClient)
      ? this.fetchEmployeeDetail(row.id).catch(() => {})
      : Promise.resolve();

    Promise.all([refPromise, detailPromise])
      .then(() => {
        this.populateEditSelects();
        if (this.employeeDetail) this.populateEditFromDetail(this.employeeDetail);
        else this.populateEditFromRow(row);
      })
      .catch(() => {
        this.populateEditSelects();
        this.populateEditFromRow(row);
      })
      .then(() => { setLoading(false); });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EVENT BINDING
  // ═══════════════════════════════════════════════════════════════════════════

  private bindSearch(): void {
    const wrapper = this.domElement.querySelector('#employees-table');
    if (!wrapper) return;

    const resetBtn = wrapper.querySelector('.ao-filter-right-btns .nemko-btn-cancel');
    const statusSel = wrapper.querySelector<HTMLSelectElement>('#empStatusFilter');

    const applyFilters = (): void => {
      const searches: Array<{ columnName: string; searchText: string }> = [];
      wrapper.querySelectorAll<HTMLInputElement>('[data-emp-column]').forEach(inp => {
        const col = inp.dataset.empColumn;
        const val = inp.value.trim();
        if (col && val) searches.push({ columnName: col, searchText: val });
      });
      this.apiFilter.columnTextSearches = searches;
      this.apiFilter.personalStatusId = (statusSel?.value) ? Number(statusSel.value) : null;

      this.applyServerFilters(1);
    };

    // No Search button — filtering is dynamic. Text columns are debounced
    // so we don't hit the API on every keystroke; the status dropdown
    // filters immediately on change.
    wrapper.querySelectorAll<HTMLInputElement>('[data-emp-column]').forEach(inp => {
      inp.addEventListener('input', () => {
        clearTimeout(this._filterDebounceTimer);
        this._filterDebounceTimer = setTimeout(applyFilters, 400) as any;
      });
    });

    statusSel?.addEventListener('change', () => {
      clearTimeout(this._filterDebounceTimer);
      applyFilters();
    });

    resetBtn?.addEventListener('click', () => {
      clearTimeout(this._filterDebounceTimer);
      wrapper.querySelectorAll<HTMLInputElement>('[data-emp-column]').forEach(inp => { inp.value = ''; });
      if (statusSel) statusSel.value = '';

      this.apiFilter = { columnTextSearches: [], personalStatusId: null, sortBy: null, sortOrder: null };
      this.sortState = { key: null, direction: 'default' };
      this.applyServerFilters(1);
    });
  }

  private bindDelete(): void {
    const wrapper = this.domElement.querySelector('#employees-table');
    if (!wrapper) return;

    const btnDelete = wrapper.querySelector('#emp-delete-btn') as HTMLButtonElement;
    const btnDeleteAll = wrapper.querySelector('#emp-delete-all-btn') as HTMLButtonElement;

    btnDelete?.addEventListener('click', () => {
      const table = wrapper.querySelector('.nemko-table-container .table');
      if (!table) return;
      const checked: HTMLInputElement[] = [].slice.call(table.querySelectorAll('.row-checkbox:checked'));
      if (!checked.length) { alert('Please select a row to delete.'); return; }

      const rowIds = checked
        .map(cb => this.rows[parseInt(cb.dataset.index ?? '0', 10)]?.id)
        .filter(id => id);
      if (!rowIds.length) { alert('Selected row has no valid ID.'); return; }
      if (!confirm(`Delete ${rowIds.length} employee${rowIds.length > 1 ? 's' : ''}?`)) return;

      btnDelete.disabled = true;
      this.deleteEmployeeApi(rowIds)
        .then(() => { this.applyServerFilters(this.paginationMeta?.pageNumber ?? 1); })
        .catch(() => {})
        .then(() => { btnDelete.disabled = false; });
    });

    btnDeleteAll?.addEventListener('click', () => {
      const total = this.paginationMeta?.totalCount ?? this.rows.length;
      if (!total) { alert('No employees to delete.'); return; }
      if (!confirm(`Delete all ${total} employee${total !== 1 ? 's' : ''}? This cannot be undone.`)) return;

      btnDeleteAll.disabled = true;
      this.deleteAllEmployees()
        .then(() => { this.applyServerFilters(1); })
        .catch(() => {})
        .then(() => { btnDeleteAll.disabled = false; });
    });
  }

  private bindNewModal(): void {
    const newBtn = this.domElement.querySelector('#emp-new-btn');
    newBtn?.addEventListener('click', () => this.openNewModal());
    this.bindEmailAutocomplete('emailIp', 'emailIpSuggestions');

    const modal = this.domElement.querySelector('#empNewModal');
    if (!modal) return;

    // Whenever the modal finishes closing — Cancel, the X button, Esc, or a
    // click on the dark backdrop outside the modal — clear the form straight
    // away, same as WpMyQualificationsWebPart does for #addQualificationModal.
    modal.addEventListener('hidden.bs.modal', () => this.resetNewModal());

    const saveBtn = modal.querySelector('.modal-footer .nemko-btn-save') as HTMLButtonElement;
    if (!saveBtn) return;

    saveBtn.addEventListener('click', () => {
      const fullName = this.getFieldText('fullName');
      const email = this.getFieldText('emailIp').toLowerCase();
      let isValid = true;
      const missingFields: string[] = [];

      const nameEl = this.domElement.querySelector('#fullName');
      if (!fullName) { nameEl?.classList.add('is-invalid'); isValid = false; missingFields.push('Full Name'); }
      else { nameEl?.classList.remove('is-invalid'); }

      const emailEl = this.domElement.querySelector('#emailIp');
      if (!email) { emailEl?.classList.add('is-invalid'); isValid = false; missingFields.push('Email'); }
      else { emailEl?.classList.remove('is-invalid'); }

      const psEl = this.domElement.querySelector<HTMLSelectElement>('#personalStatus');
      if (!psEl?.value) { psEl?.classList.add('is-invalid'); isValid = false; missingFields.push('Personal Status'); }
      else { psEl?.classList.remove('is-invalid'); }

      const officeEl = this.domElement.querySelector<HTMLSelectElement>('#office');
      const officeFb = officeEl?.closest('.form-control-col')?.querySelector<HTMLElement>('.invalid-feedback');
      if (!officeEl?.value) {
        officeEl?.classList.add('is-invalid');
        if (officeFb) officeFb.style.display = 'block';
        isValid = false;
        missingFields.push('Office');
      } else {
        officeEl?.classList.remove('is-invalid');
        if (officeFb) officeFb.style.display = '';
      }

      const dmEl = this.domElement.querySelector<HTMLSelectElement>('#directManger');
      const dmFb = dmEl?.closest('.form-control-col')?.querySelector<HTMLElement>('.invalid-feedback');
      if (!dmEl?.value) {
        dmEl?.classList.add('is-invalid');
        if (dmFb) dmFb.style.display = 'block';
        isValid = false;
        missingFields.push('Direct Manager');
      } else {
        dmEl?.classList.remove('is-invalid');
        if (dmFb) dmFb.style.display = '';
      }

      if (!isValid) {
        alert(`Please fill in the following required field(s):\n- ${missingFields.join('\n- ')}`);
        return;
      }

      const leadershipRadios = this.domElement.querySelectorAll<HTMLInputElement>('input[name="radioDefault2"]');
      const leadershipFunction = leadershipRadios.length > 0 ? leadershipRadios[0].checked : false;
      const adminRadios = this.domElement.querySelectorAll<HTMLInputElement>('input[name="newIsAdmin"]');
      const isAdmin = adminRadios.length > 0 ? adminRadios[0].checked : false;

      const payload = {
        name: fullName,
        email: email,
        personalStatusId: this.getFieldNum('personalStatus'),
        officeId: this.getFieldNum('office'),
        approvalManagerId: this.getFieldNum('approvalManager'),
        directManagerId: this.getFieldNum('directManger'),
        localGMId: this.getFieldNum('localGMList'),
        employeeTypeId: this.getFieldNum('newEmployeeType'),
        qualityManagerId: this.getFieldNum('qualityManger'),
        hrContactId: this.getFieldNum('HR-contact'),
        leadershipFunction,
        isAdmin,
      };

      const originalLabel = saveBtn.textContent;
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
      this.createEmployee(payload)
        .then(() => {
          this.closeModal('empNewModal');
          this.applyServerFilters(1);
          alert(`Employee "${payload.name}" successfully created.`);
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Create failed';
          alert(msg);
        })
        .then(() => { saveBtn.disabled = false; saveBtn.textContent = originalLabel; });
    });
  }

  private bindEditModal(): void {
    const editBtn = this.domElement.querySelector('#emp-edit-btn');
    editBtn?.addEventListener('click', () => {
      const table = this.domElement.querySelector('.nemko-table-container .table');
      if (!table) return;
      const checked = table.querySelector<HTMLInputElement>('.row-checkbox:checked');
      if (checked) {
        this.openEditModal(parseInt(checked.dataset.index ?? '0', 10));
      } else {
        alert('Please select a row to edit.');
      }
    });

    const modal = this.domElement.querySelector('#empEditModal');
    if (!modal) return;

    const saveBtn = modal.querySelector('.modal-footer .nemko-btn-save') as HTMLButtonElement;
    if (!saveBtn) return;

    saveBtn.addEventListener('click', () => {
      const id = Number(this.domElement.querySelector<HTMLInputElement>('#editEmployeeId')?.value);
      if (!id) { console.warn('[WpEmployees] editEmployeeId missing'); return; }

      let isValid = true;
      const missingFields: string[] = [];

      const nameEl = this.domElement.querySelector('#editFullName');
      if (!this.getFieldText('editFullName')) { nameEl?.classList.add('is-invalid'); isValid = false; missingFields.push('Full Name'); }
      else { nameEl?.classList.remove('is-invalid'); }

      const emailEl = this.domElement.querySelector('#editEmailIp');
      if (!this.getFieldText('editEmailIp')) { emailEl?.classList.add('is-invalid'); isValid = false; missingFields.push('Email'); }
      else { emailEl?.classList.remove('is-invalid'); }

      const psEl = this.domElement.querySelector<HTMLSelectElement>('#editPersonalStatus');
      if (!psEl?.value) { psEl?.classList.add('is-invalid'); isValid = false; missingFields.push('Personal Status'); }
      else { psEl?.classList.remove('is-invalid'); }

      const officeEl = this.domElement.querySelector<HTMLSelectElement>('#editOffice');
      const officeFb = officeEl?.closest('.form-control-col')?.querySelector<HTMLElement>('.invalid-feedback');
      if (!officeEl?.value) {
        officeEl?.classList.add('is-invalid');
        if (officeFb) officeFb.style.display = 'block';
        isValid = false;
        missingFields.push('Office');
      } else {
        officeEl?.classList.remove('is-invalid');
        if (officeFb) officeFb.style.display = '';
      }

      const dmEl = this.domElement.querySelector<HTMLSelectElement>('#editDirectManger');
      const dmFb = dmEl?.closest('.form-control-col')?.querySelector<HTMLElement>('.invalid-feedback');
      if (!dmEl?.value) {
        dmEl?.classList.add('is-invalid');
        if (dmFb) dmFb.style.display = 'block';
        isValid = false;
        missingFields.push('Direct Manager');
      } else {
        dmEl?.classList.remove('is-invalid');
        if (dmFb) dmFb.style.display = '';
      }

      if (!isValid) {
        alert(`Please fill in the following required field(s):\n- ${missingFields.join('\n- ')}`);
        return;
      }

      const radios = this.domElement.querySelectorAll<HTMLInputElement>('input[name="editLeadershipFunction"]');
      const leadershipFunction = radios.length > 0 ? radios[0].checked : false;
      const adminRadios = this.domElement.querySelectorAll<HTMLInputElement>('input[name="editIsAdmin"]');
      const isAdmin = adminRadios.length > 0 ? adminRadios[0].checked : false;

      const payload = {
        name: this.getFieldText('editFullName'),
        email: this.getFieldText('editEmailIp'),
        personalStatusId: this.getFieldNum('editPersonalStatus'),
        officeId: this.getFieldNum('editOffice'),
        approvalManagerId: this.getFieldNum('editApprovalManager'),
        directManagerId: this.getFieldNum('editDirectManger'),
        localGMId: this.getFieldNum('editLocalGMList'),
        qualityManagerId: this.getFieldNum('editQualityManger'),
        hrContactId: this.getFieldNum('editHRContact'),
        leadershipFunction,
        isAdmin,
        employeeTypeId: this.getFieldNum('editEmployeeType'),
      };

      const originalLabel = saveBtn.textContent;
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
      this.updateEmployee(id, payload)
        .then(() => {
          this.closeModal('empEditModal');
          this.applyServerFilters(this.paginationMeta?.pageNumber ?? 1);
          alert(`Employee "${payload.name}" successfully updated.`);
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Update failed';
          alert(msg);
        })
        .then(() => { saveBtn.disabled = false; saveBtn.textContent = originalLabel; });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PROPERTY PANE
  // ═══════════════════════════════════════════════════════════════════════════

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
