import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPComponentLoader } from '@microsoft/sp-loader';
import { AadHttpClient } from '@microsoft/sp-http';
import * as strings from 'WpVerificationAndAuthorizationWebPartStrings';
import VerificationAndAuthorization from './VerificationAndAuthorization';
import SharedSidebar from '../../SharedSidebar';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface IWpVerificationAndAuthorizationWebPartProps {
  description: string;
}

interface IVerificationRow {
  Id: number;
  QualificationId: string;
  ExternalId?: string;
  Employee: string;
  Qualification: string;
  Type: string;
  Level: string;
  TargetDate: string;
  ReceivedDate?: string;
  Authorizer: string;
  AuthorizerEmployeeIds?: number[];
  VerifiedBy: string;
  Status: string;
  ConformityStatement?: boolean;
  CertificationDecision?: boolean;
  QualificationLevel?: number;
  QualificationTypeId?: number;
  ReportApprover?: boolean;
  FinalLimitation?: string;
  LocalUnit?: string;
  AppliedByEmail?: string;
}

interface IAuthorizationRow {
  Id: number;
  QualificationId: string;
  ExternalId?: string;
  Employee: string;
  AppliedByEmail?: string;
  Qualification: string;
  Type: string;
  Level: string;
  TargetDate: string;
  ReceivedDate?: string;
  Authorizer: string;
  VerifiedBy: string;
  VerifiedByEmail: string;
  AuthorizerEmployeeIds?: number[];
  Status: string;
  Withdrawn?: boolean;
  WithdrawnDate?: string;
  WithdrawnBy?: string;
  ConformityStatement?: boolean;
  CertificationDecision?: boolean;
  QualificationLevel?: number;
  QualificationTypeId?: number;
  ReportApprover?: boolean;
  QualifiedDate?: string;
  FinalLimitation?: string;
  LocalUnit?: string;
}


interface IAuditEntry {
  timestamp: string;
  userId: string;
  action: string;
  targets: string;
}

/** Pagination metadata returned (or inferred) from the API */
interface IPaginationMeta {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasBack?: boolean;
  hasMore?: boolean;
}

/** Full shape returned by GET /api/qualification/verify/{Status} */
interface IApiQualificationItem {
  id?: number;
  qualificationId?: string;
  employeeName?: string;
  employee?: string;
  qualificationName?: string;
  qualification?: string;
  level?: string;
  qualificationLevel?: number;
  targetDate?: string;
  authorizer?: string;
  verifiedBy?: string;
  verifiedByEmail?: string;
  status?: string;
  conformityStatement?: boolean;
  certificationDecision?: boolean;
  reportApprover?: boolean;
}

interface IBulkUpdateResult {
  completedIds: number[];
  notFoundIds: number[];
  authorizerEmpty: number[];
  totalRequested: number;
  totalCompleted: number;
  totalFailed: number;
}
// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE_URL =
  'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net';


const AAD_APP_ID = 'api://66eda48a-d5f9-4db0-a911-0d936f8ce92b';

const DEFAULT_PAGE_SIZE = 10;


const SORT_KEY_TO_API_FIELD: { [key: string]: string } = {
  Employee: 'employee',
  Qualification: 'qualificationreference',
  Type: 'qualificationtype',
  Level: 'qualificationlevel',
  TargetDate: 'targetachievedate',
  ReceivedDate: 'requesteddate',
  Authorizer: 'authorizer',
  VerifiedBy: 'verifier',
  Status: 'qualificationstatus'
};

// ─── WebPart ──────────────────────────────────────────────────────────────────
export default class WpVerificationAndAuthorizationWebPart
  extends BaseClientSideWebPart<IWpVerificationAndAuthorizationWebPartProps> {

  // ── UI State ───────────────────────────────────────────────────────────────
  private siteUrl: string = '';
  private currentUserEmail: string = '';
  private apiClient!: AadHttpClient;                          // ← ADDED

  private verificationRows: IVerificationRow[] = [];
  private authorizationRows: IAuthorizationRow[] = [];
  private auditLog: IAuditEntry[] = [];

  private currentMainTab: string = 'verification';
  private currentSubTab: string = 'pending';

  /** Server-side search query (sent to API on each call) */
  private verSearchQuery: string = '';
  private authSearchQuery: string = '';

  /** Server-side search operator (contains / startswith / endswith / eq / neq / empty / notempty) */
  private verSearchOperator: string = 'contains';
  private authSearchOperator: string = 'contains';

  /** Server-side filters (same params/shape as the Authorized table in My Qualifications) */
  private verFilters: {
    status: boolean | null;
    conformityStatement: boolean | null;
    certificationDecision: boolean | null;
    qualificationLevel: number | null;
    reportApprover: boolean | null;
    qualificationType: string | null;
  } = {
      status: null,
      conformityStatement: null,
      certificationDecision: null,
      qualificationLevel: null,
      reportApprover: null,
      qualificationType: null
    };

  private authFilters: {
    status: boolean | null;
    conformityStatement: boolean | null;
    certificationDecision: boolean | null;
    qualificationLevel: number | null;
    reportApprover: boolean | null;
    qualificationType: string | null;
  } = {
      status: null,
      conformityStatement: null,
      certificationDecision: null,
      qualificationLevel: null,
      reportApprover: null,
      qualificationType: null
    };

  /** Reference data for the Level filter dropdowns, fetched once on init */
  private qualificationLevels: Array<{ id: number; name: string }> = [];

  private colVisibility: { [key: string]: boolean } = {};

  // ── Pagination State ───────────────────────────────────────────────────────
  private paginationState: { [tabKey: string]: IPaginationMeta } = {};

  // ── Sort State ─────────────────────────────────────────────────────────────
  private sortState: { key: string; direction: 'asc' | 'desc' | 'default' } = {
    key: '',
    direction: 'default'
  };

  // ── Loading flag ───────────────────────────────────────────────────────────
  private _isLoading: boolean = false;
  // True when the last table load failed (one error pattern, audit D10 / handover C4)
  private _loadError: boolean = false;

  // ── Modal helpers ──────────────────────────────────────────────────────────
  private activeDetailsRowId: number = -1;
  private rejectReasonConfirmCallback: ((reason: string) => void) | null = null;
  private withdrawReasonConfirmCallback: ((reason: string) => void) | null = null;
  private selectedAuthorizerTemps: Array<{ id: number; name: string; email: string }> = [];

  /** Populated per-modal from GET /api/reference-data/Authorizer?qualificationTypeId=&qualificationLevel= */
  private authorizerOptions: Array<{ id: number; name: string; email: string }> = [];

  private withdrawDetailsRequestId: number = 0;
  private qualDetailsRequestId: number = 0;

  private yesNo(value: boolean | null | undefined): string {
    return value ? 'Yes' : 'No';
  }
  // ── Lifecycle ──────────────────────────────────────────────────────────────
  protected onInit(): Promise<void> {
    this.siteUrl = this.context.pageContext.web.absoluteUrl;
    this.currentUserEmail = this.context.pageContext.user.email.toLowerCase();
    this.loadCss();
    // jQuery is loaded globally; jQuery UI provides the Target Achieve Date datepicker
    this.loadJqueryUi(this.siteUrl + '/SiteAssets/resources/js/jquery-ui.js')
      .catch(err => console.error('[NEMKO] jquery-ui.js failed to load:', err));

    return this.context.aadHttpClientFactory
      .getClient(AAD_APP_ID)
      .then(client => {
        this.apiClient = client;
      })
      .catch(err => {
        console.error('[NEMKO] AAD client init failed:', err);
      });
  }

  public render(): void {
    SharedSidebar.unregisterNavHandler('my-verification');
    SharedSidebar.unregisterNavHandler('my-authorizations');

    const workbench = document.getElementById('workbenchPageContent');
    if (workbench) workbench.style.maxWidth = 'none';

    const resourceUrl = this.siteUrl + '/SiteAssets';
    const params = new URLSearchParams(window.location.search);
    const isAuthorization = params.get('tab') === 'authorization';
    const activeTabId = isAuthorization ? 'verif-authorization-table' : 'verif-verification-table';
    const activeNavItem = isAuthorization ? 'my-authorizations' : 'my-verification';

    this.currentMainTab = isAuthorization ? 'authorization' : 'verification';

    this.domElement.innerHTML =
      SharedSidebar.getHtml({ resourceUrl, siteUrl: this.siteUrl, activeNavItem, activeTabId }) +
      VerificationAndAuthorization.allElementsHtml.replace(/__KEY_URL_RESOURCE__/g, resourceUrl);

    SharedSidebar.initBehavior(this.domElement, this.siteUrl);
    this.initWhenReady();

    SharedSidebar.registerNavHandler('my-verification', this.handleSidebarNavClick.bind(this));
    SharedSidebar.registerNavHandler('my-authorizations', this.handleSidebarNavClick.bind(this));

    // Show correct panel
    const verPanel = this.domElement.querySelector<HTMLElement>('#verif-verification-table');
    const authPanel = this.domElement.querySelector<HTMLElement>('#verif-authorization-table');
    if (isAuthorization) {
      if (verPanel) verPanel.style.display = 'none';
      if (authPanel) authPanel.style.display = 'block';
    } else {
      if (verPanel) verPanel.style.display = 'block';
      if (authPanel) authPanel.style.display = 'none';
    }

    this.domElement.querySelectorAll('.nemko-tab-btn').forEach(btn => {
      btn.classList.toggle(
        'nemko-tab-btn-active',
        btn.getAttribute('data-tab-id') === activeTabId
      );
    });

    this.updateSubTabLabels();



    const doInit = () => {
      this.bindAll();
      if (this.apiClient) {
        this.fetchQualificationLevels().then(() => {
          this.populateLevelFilterSelect('ver-level-filter');
          this.populateLevelFilterSelect('auth-level-filter');
        });
        this.fetchAndRefresh();
      }
      else {
        setTimeout(doInit, 200);
      }
    }
    setTimeout(doInit, 300);
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

  // Loads jQuery UI with a plain <script> tag instead of SPComponentLoader. Through
  // SPComponentLoader, jQuery UI's AMD wrapper asks for a "jquery" module the loader may
  // never resolve, so the load intermittently hangs. The page also keeps a global
  // define.amd (SPFx loader), which would make jQuery UI register as an AMD module instead
  // of attaching to jQuery, so define.amd is hidden only while this one script loads.
  // One shared load per page; a failed load can be retried later.
  private loadJqueryUi(url: string, timeoutMs: number = 15000): Promise<void> {
    const w = window as any;
    if (w.jQuery?.fn?.datepicker) return Promise.resolve();
    if (w.__nemkoJqueryUiLoad) return w.__nemkoJqueryUiLoad;

    const load = new Promise<void>((resolve, reject) => {
      const start = Date.now();
      const inject = (): void => {
        if (!w.jQuery) {
          if (Date.now() - start > timeoutMs) {
            reject(new Error('Global jQuery not found; jquery-ui.js not loaded'));
            return;
          }
          setTimeout(inject, 100);
          return;
        }
        const amd = w.define?.amd;
        if (amd) w.define.amd = undefined;
        const restoreAmd = (): void => { if (amd) w.define.amd = amd; };

        const script = document.createElement('script');
        script.src = url;
        script.onload = () => {
          restoreAmd();
          if (w.jQuery?.fn?.datepicker) resolve();
          else reject(new Error('jquery-ui.js loaded but datepicker is not attached to jQuery'));
        };
        script.onerror = () => {
          restoreAmd();
          reject(new Error(`Failed to load ${url}`));
        };
        document.head.appendChild(script);
      };
      inject();
    });

    w.__nemkoJqueryUiLoad = load.catch(err => {
      w.__nemkoJqueryUiLoad = null;
      throw err;
    });
    return w.__nemkoJqueryUiLoad;
  }

  // ── CSS / JS ───────────────────────────────────────────────────────────────
  private loadCss(): void {
    const base = this.siteUrl + '/SiteAssets/resources/css';
    SPComponentLoader.loadCss(base + '/jquery-ui.css');
    SPComponentLoader.loadCss(base + '/qualification-db.css');
    SPComponentLoader.loadCss(base + '/nemko-modal.css');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // API LAYER
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Builds the full URL for GET /api/qualification/verify/{Status}
   */
  private buildApiUrl(options: {
    status: string;
    search?: string;
    operator?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
    statusBool?: boolean;
    conformityStatement?: boolean;
    certificationDecision?: boolean;
    qualificationLevel?: number;
    reportApprover?: boolean;
    qualificationType?: string;
  }): string {
    const qs = new URLSearchParams();

    if (options.statusBool !== undefined)
      qs.set('status', String(options.statusBool));

    if (options.conformityStatement !== undefined)
      qs.set('conformityStatement', String(options.conformityStatement));

    if (options.certificationDecision !== undefined)
      qs.set('certificationDecision', String(options.certificationDecision));

    if (options.qualificationLevel !== undefined)
      qs.set('qualificationLevel', String(options.qualificationLevel));

    if (options.reportApprover !== undefined)
      qs.set('reportApprover', String(options.reportApprover));

    if (options.qualificationType)
      qs.set('qualificationType', options.qualificationType);

    if (options.search && options.search.trim())
      qs.set('search', options.search.trim());

    if (options.operator && options.operator.trim())
      qs.set('operator', options.operator.trim());

    if (options.page !== undefined && !isNaN(options.page))
      qs.set('page', String(options.page));

    if (options.sortBy && options.sortBy.trim())
      qs.set('sortBy', options.sortBy.trim());

    if (options.sortOrder && options.sortOrder !== 'default')
      qs.set('sortOrder', options.sortOrder);

    const base = `${API_BASE_URL}/api/qualification/verify/${encodeURIComponent(options.status)}`;
    const queryString = qs.toString();
    return queryString ? `${base}?${queryString}` : base;
  }

  /**
   * ✅ FIXED: Core fetch method now uses AadHttpClient instead of plain fetch().
   * This resolves the CORS error and adds proper AAD bearer-token authentication.
   */
  private async fetchQualifications(options: {
    status: string;
    search?: string;
    operator?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
    statusBool?: boolean;
    conformityStatement?: boolean;
    certificationDecision?: boolean;
    qualificationLevel?: number;
    reportApprover?: boolean;
    qualificationType?: string;
  }): Promise<{ items: IApiQualificationItem[]; meta: IPaginationMeta }> {

    const emptyResult = {
      items: [] as IApiQualificationItem[],
      meta: { currentPage: 1, pageSize: DEFAULT_PAGE_SIZE, totalCount: 0, totalPages: 0 }
    };

    if (!this.apiClient) {
      console.warn('[NEMKO] apiClient not initialised yet');
      this._loadError = true;
      return emptyResult;
    }

    try {
      const url = this.buildApiUrl({
        status: options.status,
        search: options.search,
        operator: options.operator,
        page: options.page ?? 1,
        pageSize: options.pageSize ?? DEFAULT_PAGE_SIZE,
        sortBy: options.sortBy,
        sortOrder: options.sortOrder,
        statusBool: options.statusBool,
        conformityStatement: options.conformityStatement,
        certificationDecision: options.certificationDecision,
        qualificationLevel: options.qualificationLevel,
        reportApprover: options.reportApprover,
        qualificationType: options.qualificationType
      });

      console.log('[NEMKO] Fetching:', url);

      const response = await this.apiClient.get(url, AadHttpClient.configurations.v1);

      if (!response.ok) {
        console.error(`[NEMKO] API ${response.status} – ${url}`);
        this._loadError = true;
        return emptyResult;
      }

      const raw = await response.json();

      let items: IApiQualificationItem[] = [];
      let totalCount = 0;
      let totalPages = 0;
      let currentPage = options.page ?? 1;
      let pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
      let hasBack: boolean | undefined;
      let hasMore: boolean | undefined;

      if (Array.isArray(raw)) {
        items = raw as IApiQualificationItem[];
        totalCount = items.length;
        totalPages = 1;
      } else {
        const obj = raw as any;
        const dataEnvelope = obj.data ?? obj;
        const pagination = dataEnvelope.pagination ?? {};

        items = dataEnvelope.items ?? [];
        totalCount = pagination.totalCount ?? items.length;
        pageSize = pagination.pageSize ?? DEFAULT_PAGE_SIZE;
        hasBack = pagination.hasBack;
        hasMore = pagination.hasMore;
        totalPages = (pagination.lastPageNumber ?? Math.ceil(totalCount / pageSize)) || 1;

        const rawPage = Number(pagination.pageNumber ?? pagination.page ?? currentPage);
        currentPage = (!isNaN(rawPage) && rawPage > 0) ? rawPage : currentPage;
      }

      return {
        items,
        meta: { currentPage, pageSize, totalCount, totalPages, hasBack, hasMore }
      };


    } catch (err) {
      console.error(`[NEMKO] fetch error for status="${options.status}":`, err);
      this._loadError = true;
      return emptyResult;
    }
  }

  // ── Field mappers ──────────────────────────────────────────────────────────
  private mapToVerificationRow(item: any, idx: number): IVerificationRow {
    const employeeName = (
      item.employee?.name ??
      item.employeeName ??
      item.appliedBy?.name ??
      item.appliedBy?.email ??
      ''
    ).trim();
    return {
      Id: item.qualificationId ?? idx + 1,
      QualificationId: String(item.qualificationId ?? ''),
      ExternalId: item.externalId ?? '',
      Employee: employeeName,
      Qualification: item.qualificationReference?.name ?? item.qualificationName ?? '',
      Type: item.qualificationTypeId?.name ?? '',
      Level: item.qualificationLevel?.name ?? item.level ?? '',
      TargetDate: item.targetAchieveDate?.split('T')[0] ?? item.targetDate ?? '',
      ReceivedDate: item.requestedDate?.split('T')[0] ?? item.requestedDate ?? '',
      Authorizer: Array.isArray(item.authorizer)
        ? item.authorizer.map((a: any) => a.name).join(', ')
        : (item.authorizer?.name ?? item.authorizer ?? ''),
      AuthorizerEmployeeIds: Array.isArray(item.authorizer)
        ? item.authorizer.map((a: any) => a.employeeId ?? 0).filter((id: number) => id > 0)
        : (item.authorizer?.employeeId ? [item.authorizer.employeeId] : []),
      VerifiedBy: Array.isArray(item.verifier)
        ? item.verifier.map((v: any) => v.name).join(', ')
        : (item.verifier?.name ?? item.verifiedBy ?? ''),
      Status: item.qualificationStatus?.name ?? item.status ?? 'Pending',
      ConformityStatement: item.confirmityStatement,
      CertificationDecision: item.certificationDecision,
      QualificationLevel: item.qualificationLevel?.qualificationLevelId ?? item.qualificationLevel?.id ?? item.qualificationLevel,
      ReportApprover: item.reportApprover,
      FinalLimitation: item.FinalLimitations ?? '',
      LocalUnit: item.localUnit ?? '',
      AppliedByEmail: item.appliedBy?.email ?? '',
      QualificationTypeId: Number(
        item.qualificationTypeId?.qualificationTypeId ??
        item.qualificationType?.qualificationTypeId ??
        item.qualificationType?.id ??
        item.qualificationTypeId
      ) || 0,
    };
  }

  private mapToAuthorizationRow(item: any, idx: number): IAuthorizationRow {
    const employeeName = (
      item.employee?.name ??
      item.employeeName ??
      item.appliedBy?.name ??
      item.appliedBy?.email ??
      ''
    ).trim();
    return {
      Id: item.qualificationId ?? idx + 1,
      QualificationId: String(item.qualificationId ?? ''),
      ExternalId: item.externalId ?? '',
      Employee: employeeName,
      AppliedByEmail: item.appliedBy?.email ?? '',
      Qualification: item.qualificationReference?.name ?? item.qualificationName ?? '',
      Type: item.qualificationTypeId?.name ?? '',
      Level: item.qualificationLevel?.name ?? item.level ?? '',
      TargetDate: item.targetAchieveDate?.split('T')[0] ?? item.targetDate ?? '',
      ReceivedDate: item.requestedDate?.split('T')[0] ?? item.requestedDate ?? '',
      VerifiedBy: Array.isArray(item.verifier)
        ? item.verifier.map((v: any) => v.name).join(', ')
        : (item.verifier?.name ?? item.verifiedBy ?? ''),
      VerifiedByEmail: Array.isArray(item.verifier)
        ? item.verifier.map((v: any) => v.email).join(', ')
        : (item.verifier?.email ?? item.verifiedByEmail ?? ''),
      AuthorizerEmployeeIds: Array.isArray(item.authorizer)
        ? item.authorizer.map((a: any) => a.employeeId ?? 0).filter((id: number) => id > 0)
        : (item.authorizer?.employeeId ? [item.authorizer.employeeId] : []),
      Withdrawn: item.withdrawn === true,
      WithdrawnDate: item.withdrawnDate ?? '',
      WithdrawnBy: item.withdrawnBy?.name ?? '',
      Authorizer: Array.isArray(item.authorizer)
        ? item.authorizer.map((v: any) => v.name).join(', ')
        : (item.authorizer?.name ?? item.authorizer ?? ''),
      Status: item.qualificationStatus?.name ?? item.status ?? 'Pending',


      ConformityStatement: item.confirmityStatement,
      CertificationDecision: item.certificationDecision,
      QualificationLevel: item.qualificationLevel?.qualificationLevelId,
      QualificationTypeId: Number(
        item.qualificationTypeId?.qualificationTypeId ??
        item.qualificationType?.qualificationTypeId ??
        item.qualificationType?.id ??
        item.qualificationTypeId
      ) || 0,
      ReportApprover: item.reportApprover,
      QualifiedDate: item.qualifiedDate?.split('T')[0] ?? item.qualifiedDate ?? '',
      FinalLimitation: item.FinalLimitations ?? ''
    };
  }

  // ── Derive the correct tabKey for pagination state ─────────────────────────
  private currentTabKey(): string {
    return this.currentMainTab + '_' + this.currentSubTab;
  }

  private getPagination(tabKey: string): IPaginationMeta {
    if (!this.paginationState[tabKey]) {
      this.paginationState[tabKey] = {
        currentPage: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        totalCount: 0,
        totalPages: 0
      };
    }
    return this.paginationState[tabKey];
  }

  /**
   * Main data-loading entry point.
   */
  private async loadApiData(): Promise<void> {
    this._isLoading = true;
    this._loadError = false;
    this.showTableLoading();

    const tabKey = this.currentTabKey();
    const paging = this.getPagination(tabKey);
    const search = this.currentMainTab === 'verification'
      ? this.verSearchQuery
      : this.authSearchQuery;
    const operator = this.currentMainTab === 'verification'
      ? this.verSearchOperator
      : this.authSearchOperator;

    const sortBy = (this.sortState.key && this.sortState.direction !== 'default')
      ? (SORT_KEY_TO_API_FIELD[this.sortState.key] ?? this.sortState.key.toLocaleLowerCase())
      : undefined;
    const sortOrder = (this.sortState.direction !== 'default')
      ? this.sortState.direction
      : undefined;

    try {
      if (this.currentMainTab === 'verification') {

        if (this.currentSubTab === 'pending') {
          const result = await this.fetchQualifications({
            status: 'pending',
            search,
            operator,
            page: paging.currentPage,
            pageSize: paging.pageSize,
            sortBy,
            sortOrder,
            statusBool: this.verFilters.status ?? undefined,
            conformityStatement: this.verFilters.conformityStatement ?? undefined,
            certificationDecision: this.verFilters.certificationDecision ?? undefined,
            qualificationLevel: this.verFilters.qualificationLevel ?? undefined,
            reportApprover: this.verFilters.reportApprover ?? undefined,
            qualificationType: this.verFilters.qualificationType ?? undefined
          });
          this.verificationRows = Array.isArray(result.items) ? result.items.map((it, i) => this.mapToVerificationRow(it, i)) : [];
          this.paginationState[tabKey] = result.meta;

        } else {
          const result = await this.fetchQualifications({
            status: 'me',
            search,
            operator,
            page: paging.currentPage,
            pageSize: paging.pageSize,
            sortBy,
            sortOrder,
            statusBool: this.verFilters.status ?? undefined,
            conformityStatement: this.verFilters.conformityStatement ?? undefined,
            certificationDecision: this.verFilters.certificationDecision ?? undefined,
            qualificationLevel: this.verFilters.qualificationLevel ?? undefined,
            reportApprover: this.verFilters.reportApprover ?? undefined,
            qualificationType: this.verFilters.qualificationType ?? undefined
          });
          this.verificationRows = Array.isArray(result.items) ? result.items.map((it, i) => this.mapToVerificationRow(it, i)) : [];
          this.paginationState[tabKey] = result.meta;
        }

      } else {

        if (this.currentSubTab === 'pending') {
          const result = await this.fetchAuthorizations({
            status: 'pending',
            search, operator, page: paging.currentPage, sortBy, sortOrder,
            statusBool: this.authFilters.status ?? undefined,
            conformityStatement: this.authFilters.conformityStatement ?? undefined,
            certificationDecision: this.authFilters.certificationDecision ?? undefined,
            qualificationLevel: this.authFilters.qualificationLevel ?? undefined,
            reportApprover: this.authFilters.reportApprover ?? undefined,
            qualificationType: this.authFilters.qualificationType ?? undefined
          });
          this.authorizationRows = Array.isArray(result.items) ? result.items.map((it, i) => this.mapToAuthorizationRow(it, i)) : [];
          this.paginationState[tabKey] = result.meta;

        } else {
          const result = await this.fetchAuthorizations({
            status: 'me',
            search, operator, page: paging.currentPage, sortBy, sortOrder,
            statusBool: this.authFilters.status ?? undefined,
            conformityStatement: this.authFilters.conformityStatement ?? undefined,
            certificationDecision: this.authFilters.certificationDecision ?? undefined,
            qualificationLevel: this.authFilters.qualificationLevel ?? undefined,
            reportApprover: this.authFilters.reportApprover ?? undefined,
            qualificationType: this.authFilters.qualificationType ?? undefined
          });
          this.authorizationRows = Array.isArray(result.items) ? result.items.map((it, i) => this.mapToAuthorizationRow(it, i)) : [];
          this.paginationState[tabKey] = result.meta;
        }
      }
    } catch (err) {
      console.error('[NEMKO] loadApiData error:', err);
      this._loadError = true;
    } finally {
      this._isLoading = false;
    }
  }
  private handleDeletedQualification(qualId: string, modalId: string): void {

    this.closeModal(modalId);

    requestAnimationFrame(() => {

      requestAnimationFrame(() => {

        alert('This qualification has been deleted by the applicant and is no longer available.');

        this.verificationRows = this.verificationRows.filter(r => r.QualificationId !== qualId);

        this.authorizationRows = this.authorizationRows.filter(r => r.QualificationId !== qualId);

        this.fetchAndRefresh();

      });

    });

  }


  // ─── Column widths (audit D4 / handover P6, same pattern as my-qualifications.js) ──
  // Relative weights shared over the visible columns so the table fits its
  // container instead of scrolling sideways. The checkbox column keeps 36px.
  private static readonly NM_COL_WEIGHTS: Record<string, number> = {
    Employee: 14, Qualification: 20, Type: 9, Level: 8, TargetDate: 9, ReceivedDate: 9,
    Authorizer: 13, VerifiedBy: 13, Status: 9, Details: 8, Withdraw: 9
  };
  private nmColWidthStyle(key: string, visibleCols: Array<{ key: string }>): string {
    const weights = WpVerificationAndAuthorizationWebPart.NM_COL_WEIGHTS;
    let total = 0;
    visibleCols.forEach(c => { if (c.key !== 'chk') total += (weights[c.key] || 10); });
    const pct = ((weights[key] || 10) / (total || 1)) * 100;
    return `width:${pct.toFixed(2)}%;min-width:0;`;
  }

  /** Fetch data then redraw the current view + pagination bar */
  private fetchAndRefresh(): void {
    this.loadApiData()
      .then(() => {
        this.updateSubTabLabels();
        this.refreshCurrentView();
        this.renderPaginationBar();
      })
      .catch((err) => {
        console.error('[NEMKO] fetchAndRefresh error:', err);
        this.refreshCurrentView();
        this.renderPaginationBar();
      });
  }

  // ── Loading indicator ──────────────────────────────────────────────────────
  private showTableLoading(): void {
    const selector = this.currentMainTab === 'verification' ? '#ver-table tbody' : '#auth-table tbody';
    const tbody = this.domElement.querySelector(selector);
    if (tbody) {
      tbody.innerHTML =
        '<tr><td colspan="10" class="text-center py-4 text-color-3 text-sm font-medium">' +
        'Loading data…' +
        '</td></tr>';
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAGINATION BAR
  // ══════════════════════════════════════════════════════════════════════════

  private renderPaginationBar(): void {
    const tabKey = this.currentTabKey();
    const meta = this.getPagination(tabKey);

    const panelId = this.currentMainTab === 'verification'
      ? '#verif-verification-table'
      : '#verif-authorization-table';
    const paginationEls = this.domElement.querySelectorAll<HTMLElement>(
      panelId + ' .nemko-pagination'
    );
    if (!paginationEls.length) return;

    const { currentPage, totalCount, totalPages, pageSize, hasBack, hasMore } = meta;
    const from = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const to = Math.min(currentPage * pageSize, totalCount);
    const self = this;

    const btnStyle = 'background:none;border:none;padding:0;cursor:pointer;display:flex;align-items:center;';
    const disabledStyle = 'opacity:0.4;pointer-events:none;';

    const isFirst = hasBack !== undefined ? !hasBack : currentPage <= 1;
    const isLast = hasMore !== undefined ? !hasMore : (currentPage >= totalPages || totalPages <= 1);

    const paginationHtml =
      `<li class="page-item${isFirst ? ' disabled' : ''}">
        <button style="${btnStyle}${isFirst ? disabledStyle : ''}" data-pg-action="first" title="First page">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.72 4.54L8.17.61v7.86L2.72 4.54Z" fill="#989898"/><rect width="1.815" height="8.1675" fill="#989898"/></svg>
        </button>
      </li>` +
      `<li class="page-item${isFirst ? ' disabled' : ''}">
        <button style="${btnStyle}${isFirst ? disabledStyle : ''}" data-pg-action="prev" title="Previous page">
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M0 4.54L5.45.61v7.86L0 4.54Z" fill="#989898"/><path d="M6.35 4.54L11.8.61v7.86L6.35 4.54Z" fill="#989898"/></svg>
        </button>
      </li>` +
      `<li class="page-item">
        <span class="font-medium font-inter text-black text-xs">${from} to ${to} of ${totalCount}</span>
      </li>` +
      `<li class="page-item${isLast ? ' disabled' : ''}">
        <button style="${btnStyle}${isLast ? disabledStyle : ''}" data-pg-action="next" title="Next page">
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M13.61 4.54L8.17.61v7.86l5.44-3.93Z" fill="#989898"/><path d="M7.26 4.54L1.81.61v7.86l5.45-3.93Z" fill="#989898"/></svg>
        </button>
      </li>` +
      `<li class="page-item${isLast ? ' disabled' : ''}">
        <button style="${btnStyle}${isLast ? disabledStyle : ''}" data-pg-action="last" title="Last page">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M7.26 4.54L1.81.61v7.86L7.26 4.54Z" fill="#989898"/><rect width="1.815" height="8.1675" transform="matrix(-1 0 0 1 9.98 0)" fill="#989898"/></svg>
        </button>
      </li>`;

    paginationEls.forEach(paginationEl => {
      paginationEl.classList.add('justify-content-start');
      // Audit D9: hide page navigation when there is nothing to page through
      paginationEl.style.visibility = totalCount === 0 ? 'hidden' : '';
      paginationEl.innerHTML = paginationHtml;

      paginationEl.querySelectorAll('[data-pg-action]').forEach(btn => {
        btn.addEventListener('click', function () {
          const action = btn.getAttribute('data-pg-action') || '';
          const pg = self.getPagination(self.currentTabKey());

          if (action === 'first') { pg.currentPage = 1; }
          else if (action === 'prev') { pg.currentPage = Math.max(1, pg.currentPage - 1); }
          else if (action === 'next') { pg.currentPage = Math.min(pg.totalPages, pg.currentPage + 1); }
          else if (action === 'last') { pg.currentPage = Math.max(1, pg.totalPages); }

          self.fetchAndRefresh();
        });
      });
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // BIND ALL
  // ══════════════════════════════════════════════════════════════════════════
  private bindAll(): void {
    this.bindMainTabs();
    this.bindSubTabs();
    this.bindActions();
    this.bindSearch();
    this.bindSearchOperators();
    this.bindServerFilters();
    this.bindQualificationDetailsModal();
    this.bindRejectReasonModal();
    this.bindWithdrawReasonModal();

    this.initDatepickers();
  }

  // ── Main Tabs ──────────────────────────────────────────────────────────────
  private bindMainTabs(): void {
    const self = this;
    const buttons = this.domElement.querySelectorAll('.nemko-tab-btn');

    for (let i = 0; i < buttons.length; i++) {
      (function (btn: Element) {
        btn.addEventListener('click', function () {
          const tabId = btn.getAttribute('data-tab-id') || '';
          self.currentMainTab = (tabId === 'verif-authorization-table') ? 'authorization' : 'verification';

          const navKey = (tabId === 'verif-authorization-table') ? 'my-authorizations' : 'my-verification';
          self.domElement.querySelectorAll<HTMLElement>('.sidebar-nav-link').forEach(l => l.classList.remove('active-sm-link'));
          const activeLink = self.domElement.querySelector<HTMLElement>(`.sidebar-nav-link[data-nav-key="${navKey}"]`);
          if (activeLink) activeLink.classList.add('active-sm-link');

          buttons.forEach(b => b.classList.remove('nemko-tab-btn-active'));
          btn.classList.add('nemko-tab-btn-active');

          self.domElement.querySelectorAll<HTMLElement>('.nemko-data-table-wrapper')
            .forEach(p => { p.style.display = 'none'; });
          const activePanel = self.domElement.querySelector<HTMLElement>('#' + tabId);
          if (activePanel) activePanel.style.display = 'block';

          self.currentSubTab = 'pending';
          self.sortState = { key: '', direction: 'default' };
          self.updateSubTabLabels();
          self.activateSubTab(0);
          self.resetSearchInputs();
          self.fetchAndRefresh();
        });
      })(buttons[i]);
    }
  }

  // ── Sub Tabs ───────────────────────────────────────────────────────────────
  private bindSubTabs(): void {
    const self = this;
    const tabs = this.domElement.querySelectorAll('.tab-link-btn');
    for (let i = 0; i < tabs.length; i++) {
      (function (btn: Element, index: number) {
        btn.addEventListener('click', function () {
          self.currentSubTab = (index === 0) ? 'pending' : 'mine';
          self.sortState = { key: '', direction: 'default' };
          self.activateSubTab(index);
          self.resetSearchInputs();
          self.updateBarVisibility();
          self.fetchAndRefresh();
        });
      })(tabs[i], i);
    }
  }
  private async fetchAuthorizations(options: {
    status: string;
    search?: string;
    operator?: string;
    page?: number;
    sortBy?: string;
    sortOrder?: string;
    statusBool?: boolean;
    conformityStatement?: boolean;
    certificationDecision?: boolean;
    qualificationLevel?: number;
    reportApprover?: boolean;
    qualificationType?: string;
  }): Promise<{ items: IApiQualificationItem[]; meta: IPaginationMeta }> {

    const emptyResult = {
      items: [] as IApiQualificationItem[],
      meta: { currentPage: 1, pageSize: DEFAULT_PAGE_SIZE, totalCount: 0, totalPages: 0 }
    };

    if (!this.apiClient) {
      console.warn('[NEMKO] apiClient not initialised yet');
      this._loadError = true;
      return emptyResult;
    }

    try {
      const qs = new URLSearchParams();
      if (options.search?.trim()) qs.set('search', options.search.trim());
      if (options.operator?.trim()) qs.set('operator', options.operator.trim());
      if (options.page !== undefined) qs.set('page', String(options.page));
      if (options.sortBy?.trim()) qs.set('sortBy', options.sortBy.trim());
      if (options.sortOrder && options.sortOrder !== 'default') qs.set('sortOrder', options.sortOrder);
      if (options.statusBool !== undefined) qs.set('status', String(options.statusBool));
      if (options.conformityStatement !== undefined) qs.set('conformityStatement', String(options.conformityStatement));
      if (options.certificationDecision !== undefined) qs.set('certificationDecision', String(options.certificationDecision));
      if (options.qualificationLevel !== undefined) qs.set('qualificationLevel', String(options.qualificationLevel));
      if (options.reportApprover !== undefined) qs.set('reportApprover', String(options.reportApprover));
      if (options.qualificationType) qs.set('qualificationType', options.qualificationType);

      const base = `${API_BASE_URL}/api/qualification/authorize/${encodeURIComponent(options.status)}`;
      const url = qs.toString() ? `${base}?${qs.toString()}` : base;

      console.log('[NEMKO] Fetching:', url);

      const response = await this.apiClient.get(url, AadHttpClient.configurations.v1);
      if (!response.ok) {
        console.error(`[NEMKO] API ${response.status} – ${url}`);
        this._loadError = true;
        return emptyResult;
      }

      const raw = await response.json();

      let items: IApiQualificationItem[] = [];
      let totalCount = 0; let totalPages = 0;
      let currentPage = options.page ?? 1;
      let ps = DEFAULT_PAGE_SIZE;
      if (Array.isArray(raw)) {
        items = raw; totalCount = items.length; totalPages = 1;
      } else {
        const obj = raw as any;
        const dataEnvelope = obj.data ?? obj;
        const pagination = dataEnvelope.pagination ?? {};

        items = dataEnvelope.items ?? [];
        totalCount = pagination.totalCount ?? items.length;
        ps = pagination.pageSize ?? DEFAULT_PAGE_SIZE;
        totalPages = (pagination.lastPageNumber ?? Math.ceil(totalCount / ps)) || 1;

        const rawPage = Number(pagination.pageNumber ?? pagination.page ?? currentPage);
        currentPage = (!isNaN(rawPage) && rawPage > 0) ? rawPage : currentPage;
      }

      return { items, meta: { currentPage, pageSize: ps, totalCount, totalPages } };

    } catch (err) {
      console.error(`[NEMKO] fetchAuthorizations error:`, err);
      this._loadError = true;
      return emptyResult;
    }
  }
  // ── Fetch a single qualification by ID (fresh data for modals) ────────────
  private async fetchQualificationById(id: string): Promise<any | null> {
    if (!this.apiClient || !id) return null;
    try {
      const url = `${API_BASE_URL}/api/qualification/${encodeURIComponent(id)}`;
      console.log('[NEMKO] fetchQualificationById:', url);
      const response = await this.apiClient.get(url, AadHttpClient.configurations.v1);
      if (response.status === 404) {
        console.warn('[NEMKO] fetchQualificationById not found (deleted):', id);
        return { __notFound: true };
      }
      if (!response.ok) {
        console.warn('[NEMKO] fetchQualificationById non-ok:', response.status, 'id:', id);
        return null;
      }
      const json = await response.json();
      return json?.data ?? null;
    } catch (err) {
      console.error('[NEMKO] fetchQualificationById error:', err);
      return null;
    }
  }

  private handleSidebarNavClick(navKey: string): void {
    const isVerification = navKey === 'my-verification';
    this.currentMainTab = isVerification ? 'verification' : 'authorization';
    const tabPanelId = isVerification ? 'verif-verification-table' : 'verif-authorization-table';

    this.domElement.querySelectorAll('.nemko-tab-btn').forEach(btn =>
      btn.classList.toggle('nemko-tab-btn-active', btn.getAttribute('data-tab-id') === tabPanelId)
    );
    this.domElement.querySelectorAll<HTMLElement>('.nemko-data-table-wrapper').forEach(p => { p.style.display = 'none'; });
    const panel = this.domElement.querySelector<HTMLElement>('#' + tabPanelId);
    if (panel) panel.style.display = 'block';

    this.domElement.querySelectorAll<HTMLElement>('.sidebar-nav-link').forEach(l => l.classList.remove('active-sm-link'));
    const activeLink = this.domElement.querySelector<HTMLElement>(`.sidebar-nav-link[data-nav-key="${navKey}"]`);
    if (activeLink) activeLink.classList.add('active-sm-link');

    this.currentSubTab = 'pending';
    this.sortState = { key: '', direction: 'default' };
    this.updateSubTabLabels();
    this.activateSubTab(0);
    this.resetSearchInputs();
    this.fetchAndRefresh();
  }

  private activateSubTab(index: number): void {
    const tabs = this.domElement.querySelectorAll('.tab-link-btn');
    tabs.forEach((t, i) => {
      if (i === index) { t.classList.add('tab-link-btn-active'); }
      else { t.classList.remove('tab-link-btn-active'); }
    });
  }

  private updateSubTabLabels(): void {
    const tabs = this.domElement.querySelectorAll('.tab-link-btn');
    if (this.currentMainTab === 'verification') {
      if (tabs[0]) tabs[0].textContent = 'Pending Verification';
      if (tabs[1]) tabs[1].textContent = 'Verified by Me';
    } else {
      if (tabs[0]) tabs[0].textContent = 'Pending Authorization';
      if (tabs[1]) tabs[1].textContent = 'Authorized by Me';
    }
  }

  private resetSearchInputs(): void {
    this.verSearchQuery = '';
    this.authSearchQuery = '';
    this.verSearchOperator = 'contains';
    this.authSearchOperator = 'contains';
    const verInput = this.domElement.querySelector('#ver-search') as HTMLInputElement;
    const authInput = this.domElement.querySelector('#auth-search') as HTMLInputElement;
    if (verInput) { verInput.value = ''; verInput.disabled = false; }
    if (authInput) { authInput.value = ''; authInput.disabled = false; }

    this.verFilters = {
      status: null,
      conformityStatement: null,
      certificationDecision: null,
      qualificationLevel: null,
      reportApprover: null,
      qualificationType: null
    };
    this.authFilters = {
      status: null,
      conformityStatement: null,
      certificationDecision: null,
      qualificationLevel: null,
      reportApprover: null,
      qualificationType: null
    };
    this.domElement.querySelectorAll<HTMLSelectElement>('select[data-filter-key]').forEach(sel => {
      sel.value = '';
    });

    this.domElement.querySelectorAll('.search-operator-dd').forEach(dd => {
      const btn = dd.querySelector('.text-transform-btn[data-bs-toggle="dropdown"]') as HTMLElement;
      if (btn) { btn.innerHTML = '<u>Ab</u>'; btn.setAttribute('data-operator', 'contains'); }
      dd.querySelectorAll('.search-op-item').forEach(i => {
        i.classList.toggle('active', i.getAttribute('data-operator') === 'contains');
      });
    });

    const tabKey = this.currentTabKey();
    const pg = this.getPagination(tabKey);
    pg.currentPage = 1;
  }

  // ── Search (debounced, triggers API call) ──────────────────────────────────
  private _searchDebounceTimer: any = null;

  private bindSearch(): void {
    const self = this;
    const verSearch = this.domElement.querySelector('#ver-search') as HTMLInputElement;
    const authSearch = this.domElement.querySelector('#auth-search') as HTMLInputElement;

    const handleSearch = (inputEl: HTMLInputElement, isVer: boolean) => {
      inputEl.addEventListener('input', function () {
        if (isVer) { self.verSearchQuery = inputEl.value; }
        else { self.authSearchQuery = inputEl.value; }

        if (self._searchDebounceTimer) { clearTimeout(self._searchDebounceTimer); }
        self._searchDebounceTimer = setTimeout(() => {
          const pg = self.getPagination(self.currentTabKey());
          pg.currentPage = 1;

          self.fetchAndRefresh();
        }, 400);
      });
    };

    if (verSearch) handleSearch(verSearch, true);
    if (authSearch) handleSearch(authSearch, false);
  }


  // ── Server-side filters (Type / Status / Report Approver / Conformity /
  //    Certification Decision / Level) — same params as the Authorized table
  //    in My Qualifications, applied to both the Verification and
  //    Authorization panels. ─────────────────────────────────────────────────
  private static readonly FILTER_PARAM_MAP: { [key: string]: 'status' | 'reportApprover' | 'conformityStatement' | 'certificationDecision' } = {
    active: 'status',
    report: 'reportApprover',
    conformity: 'conformityStatement',
    certificationDecision: 'certificationDecision',
  };

  private bindServerFilters(): void {
    const self = this;

    const TABLE_CONFIG: { [tableId: string]: { isVer: boolean } } = {
      'verif-verification-table': { isVer: true },
      'verif-authorization-table': { isVer: false },
    };

    Object.keys(TABLE_CONFIG).forEach(tableId => {
      const isVer = TABLE_CONFIG[tableId].isVer;
      const container = this.domElement.querySelector('#' + tableId) as HTMLElement;
      if (!container) return;

      container.querySelectorAll('select[data-filter-key]').forEach(selEl => {
        const sel = selEl as HTMLSelectElement;
        if (sel.dataset.serverFilterInit === '1') return;
        sel.dataset.serverFilterInit = '1';
        const filterKey = sel.dataset.filterKey || '';

        sel.addEventListener('change', function () {
          const val = sel.value;
          const filters = isVer ? self.verFilters : self.authFilters;

          if (filterKey === 'level') {
            filters.qualificationLevel = val ? parseInt(val, 10) : null;
          } else if (filterKey === 'qualificationType') {
            filters.qualificationType = val ? val : null;
          } else {
            const apiParam = WpVerificationAndAuthorizationWebPart.FILTER_PARAM_MAP[filterKey];
            if (!apiParam) return;
            (filters as any)[apiParam] = val === '' ? null : (val.toLowerCase() === 'yes');
          }

          const pg = self.getPagination(self.currentTabKey());
          pg.currentPage = 1;
          self.fetchAndRefresh();
        });
      });
    });
  }

  /** GET /api/reference-data/qualification-level — same endpoint used to
   *  populate the Level filter on the My Qualifications Authorized table. */
  private async fetchQualificationLevels(): Promise<void> {
    if (this.qualificationLevels.length > 0) return; // already loaded
    if (!this.apiClient) return;
    try {
      const url = `${API_BASE_URL}/api/reference-data/qualification-level`;
      const response = await this.apiClient.get(url, AadHttpClient.configurations.v1);
      if (!response.ok) return;
      const raw = await response.json();
      const items: any[] = Array.isArray(raw) ? raw : (raw?.data?.items ?? raw?.data ?? raw?.items ?? []);
      this.qualificationLevels = items.map((item: any) => ({ id: item.id, name: item.name ?? '' }));
    } catch (err) {
      console.warn('[NEMKO] Could not load qualification levels:', err);
    }
  }

  private populateLevelFilterSelect(selectId: string): void {
    const sel = this.domElement.querySelector('#' + selectId) as HTMLSelectElement;
    if (!sel || this.qualificationLevels.length === 0) return;
    sel.querySelectorAll('option:not([value=""])').forEach(o => o.remove());
    this.qualificationLevels.forEach(lv => {
      const opt = document.createElement('option');
      opt.value = String(lv.id);
      opt.textContent = lv.name;
      sel.appendChild(opt);
    });
  }


  private getSearchOperatorSymbolHtml(symbolType: string, symbol: string): string {
    if (symbolType === 'text-full') return '<u>Ab</u>';
    if (symbolType === 'text-start') return '<u>A</u>b';
    if (symbolType === 'text-end') return 'A<u>b</u>';
    return symbol;
  }

  private bindSearchOperators(): void {
    const self = this;

    const OPERATOR_TABLE_CONFIG: { [tableId: string]: { inputId: string; isVer: boolean } } = {
      'verif-verification-table': { inputId: 'ver-search', isVer: true },
      'verif-authorization-table': { inputId: 'auth-search', isVer: false },
    };

    Object.keys(OPERATOR_TABLE_CONFIG).forEach(tableId => {
      const cfg = OPERATOR_TABLE_CONFIG[tableId];
      const container = this.domElement.querySelector('#' + tableId) as HTMLElement;
      if (!container) return;

      const operatorBtn = container.querySelector('.text-transform-btn[data-bs-toggle="dropdown"]') as HTMLElement;
      if (!operatorBtn || operatorBtn.dataset.operatorInit === '1') return;
      operatorBtn.dataset.operatorInit = '1';

      const searchInput = container.querySelector('#' + cfg.inputId) as HTMLInputElement;

      container.querySelectorAll('.search-op-item[data-table="' + tableId + '"]').forEach(item => {
        item.addEventListener('click', function (this: HTMLElement, e: Event) {
          e.preventDefault();
          const el = this as HTMLElement;
          const op = el.dataset.operator || 'contains';
          const symbol = el.dataset.symbol || '';
          const symbolType = el.dataset.symbolType || '';

          operatorBtn.innerHTML = self.getSearchOperatorSymbolHtml(symbolType, symbol);
          operatorBtn.setAttribute('data-operator', op);

          container.querySelectorAll('.search-op-item[data-table="' + tableId + '"]').forEach(i => {
            i.classList.toggle('active', i.getAttribute('data-operator') === op);
          });

          const isValueless = (op === 'empty' || op === 'notempty');

          if (searchInput) {
            searchInput.disabled = isValueless;
            if (isValueless) searchInput.value = '';
          }

          if (cfg.isVer) {
            self.verSearchOperator = op;
            self.verSearchQuery = isValueless ? '' : (searchInput ? searchInput.value : '');
          } else {
            self.authSearchOperator = op;
            self.authSearchQuery = isValueless ? '' : (searchInput ? searchInput.value : '');
          }

          const pg = self.getPagination(self.currentTabKey());
          pg.currentPage = 1;

          self.fetchAndRefresh();
        });
      });
    });
  }



  // ── Action Buttons ─────────────────────────────────────────────────────────
  private bindActions(): void {
    const self = this;
    this.domElement.addEventListener('click', function (e: Event) {
      const target = e.target as HTMLElement;

      const evaluateEl = target.closest('.evaluate-link') as HTMLElement | null;
      if (evaluateEl) {
        e.preventDefault();
        const row = evaluateEl.closest('tr');
        if (row) {
          if (self.currentMainTab === 'verification') { self.openQualificationDetailsModal(row); }
          else { self.openAuthorizationDetailsModal(row); }
        }
        return;
      }

      const clickableRow = target.closest('#ver-table tbody tr[data-row-clickable="1"]') as HTMLElement | null;
      if (clickableRow && self.currentMainTab === 'verification' && self.currentSubTab === 'mine') {
        self.openQualificationDetailsModal(clickableRow);
        return;
      }

      const clickableAuthRow = target.closest('#auth-table tbody tr[data-row-clickable="1"]') as HTMLElement | null;
      if (clickableAuthRow && self.currentMainTab === 'authorization' && self.currentSubTab === 'mine') {
        self.openWithdrawDetailsModal(clickableAuthRow);
        return;
      }

      const className = (typeof target.className === 'string') ? target.className : '';
      if (className.indexOf('verify-selected') !== -1) { self.verifySelected(); return; }
      if (className.indexOf('authorize-selected') !== -1) { self.authorizeSelected(); return; }
      if (className.indexOf('reject-selected') !== -1) { self.rejectSelected(target.getAttribute('data-panel') || ''); return; }
      if (target.getAttribute('data-dismiss-modal')) { self.closeModal(target.getAttribute('data-dismiss-modal') || ''); return; }
      if (target.id === 'qd-verify-btn') { self.verifyFromDetailsModal(); return; }
      if (target.id === 'qd-reject-btn') { self.rejectFromDetailsModal(); return; }
      if (target.id === 'qd-withdraw-btn') { self.withdrawFromQualificationDetailsModal(); return; }
      if (target.id === 'wd-withdraw-btn') { self.withdrawFromWithdrawDetailsModal(); return; }
    });
  }

  private renderColVisibilityMenu(
    menuId: string,
    columns: Array<{ key: string; label: string; visible: boolean }>,
    tabKey: string
  ): void {
    const menu = this.domElement.querySelector('#' + menuId) as HTMLElement;
    if (!menu) return;

    const self = this;
    const toggleable = columns.filter(c => c.key !== 'chk' && c.key !== 'Withdraw');

    menu.innerHTML = toggleable.map(col => {
      const storageKey = tabKey + '_' + col.key;
      if (this.colVisibility[storageKey] === undefined) { this.colVisibility[storageKey] = true; }
      const isVisible = this.colVisibility[storageKey];
      return (
        `<li class="py-10">` +
        `<label class="dropdown-item d-flex align-items-center gap-2" data-col-key="${col.key}">` +
        `<input type="checkbox" ${isVisible ? 'checked' : ''} class="d-none" name="col-heading-${tabKey}" />` +
        `<span class="chkbox-icon ${isVisible ? 'active' : ''}"></span>` +
        `<p class="font-medium text-sm text-color-3">${col.label}</p>` +
        `</label></li>`
      );
    }).join('');

    menu.querySelectorAll(`input[name="col-heading-${tabKey}"]`).forEach(cb => {
      cb.addEventListener('change', function () {
        const input = cb as HTMLInputElement;
        const label = input.closest('label') as HTMLElement;
        const colKey = label ? (label.getAttribute('data-col-key') || '') : '';

        if (!input.checked) {
          const visibleCount = toggleable.filter(c => self.colVisibility[tabKey + '_' + c.key] !== false).length;
          if (visibleCount <= 1) {
            input.checked = true;
            return;
          }
        }

        self.colVisibility[tabKey + '_' + colKey] = input.checked;
        const icon = label ? label.querySelector('.chkbox-icon') : null;
        if (icon) { if (input.checked) { icon.classList.add('active'); } else { icon.classList.remove('active'); } }
        self.refreshCurrentView();
      });
    });
  }

  // ── Sort SVG ───────────────────────────────────────────────────────────────
  private getSortSVG(key: string): string {
    const isActive = this.sortState.key === key;
    const dir = isActive ? this.sortState.direction : 'default';
    const active = 'var(--color-primary, #006e8c)';
    const inactive = '#C0C0C0';
    const upStroke = (isActive && dir === 'asc') ? active : inactive;
    const downStroke = (isActive && dir === 'desc') ? active : inactive;
    return (
      `<span style="display:inline-flex;flex-shrink:0;align-items:center;">` +
      `<svg width="12" height="16" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg">` +
      `<path d="M5 1L1 5H9L5 1Z" fill="${upStroke}" />` +
      `<path d="M5 13L1 9H9L5 13Z" fill="${downStroke}" />` +
      `</svg></span>`
    );
  }

  // ── Refresh ────────────────────────────────────────────────────────────────
  private refreshCurrentView(): void {
    if (this.currentMainTab === 'verification') {
      this.renderVerificationTable();
    } else {
      this.renderAuthorizationTable();
    }
    this.updateBarVisibility();
  }

  private updateBarVisibility(): void {
    const isVer = this.currentMainTab === 'verification';
    const isPending = this.currentSubTab === 'pending';

    const verBar = this.domElement.querySelector('#ver-action-bar') as HTMLElement;
    const authBar = this.domElement.querySelector('#auth-action-bar') as HTMLElement;

    if (verBar) verBar.style.setProperty('display', 'none', 'important');
    if (authBar) authBar.style.setProperty('display', 'none', 'important');

    if (isVer && isPending) {
      if (verBar) verBar.style.setProperty('display', 'flex', 'important');
    }
    if (!isVer && isPending) {
      if (authBar) authBar.style.setProperty('display', 'flex', 'important');
    }
  }

  // ── Verification Table Rendering ───────────────────────────────────────────
  private renderVerificationTable(): void {
    if (this.currentSubTab === 'pending') { this.renderVerificationPending(); }
    else { this.renderVerificationMine(); }
  }

  private renderVerificationPending(): void {
    const allCols = [
      { key: 'chk', label: '', visible: true },
      { key: 'Employee', label: 'Employee', visible: true },
      { key: 'Qualification', label: 'Qualification', visible: true },
      { key: 'Type', label: 'Type', visible: true },
      { key: 'Level', label: 'Level', visible: true },
      { key: 'TargetDate', label: 'Target Date', visible: true },
      { key: 'ReceivedDate', label: 'Initiated Date', visible: true },
      { key: 'Authorizer', label: 'To Be Authorized by', visible: true },
      { key: 'Status', label: 'Status', visible: true },
      { key: 'Details', label: 'Details', visible: true }
    ];

    const rows = this.verificationRows.map(r => ({
      chk: '<input type="checkbox" />',
      Employee: r.Employee,
      Qualification: r.Qualification,
      Type: r.Type,
      Level: r.Level,
      TargetDate: r.TargetDate,
      ReceivedDate: r.ReceivedDate,
      Authorizer: r.Authorizer,
      Status: r.Status,
      Details: '<a href="#" class="text-primary text-sm evaluate-link">Evaluate</a>'
    }));

    this.renderColVisibilityMenu('authorized-col-visibility', allCols, 'verPending');
    this.drawTable('#ver-table', allCols, rows, 'verPending');
  }

  private renderVerificationMine(): void {
    const allCols = [
      { key: 'Employee', label: 'Employee', visible: true },
      { key: 'Qualification', label: 'Qualification', visible: true },
      { key: 'Type', label: 'Type', visible: true },
      { key: 'Level', label: 'Level', visible: true },
      { key: 'TargetDate', label: 'Target Date', visible: true },
      { key: 'ReceivedDate', label: 'Initiated Date', visible: true },
      { key: 'Authorizer', label: 'To Be Authorized by', visible: true },
      { key: 'Status', label: 'Status', visible: true }
    ];

    const rows = this.verificationRows.map(r => ({
      Employee: r.Employee,
      Qualification: r.Qualification,
      Type: r.Type,
      Level: r.Level,
      TargetDate: r.TargetDate,
      ReceivedDate: r.ReceivedDate,
      Authorizer: r.Authorizer,
      Status: r.Status
    }));

    this.renderColVisibilityMenu('authorized-col-visibility', allCols, 'verMine');
    this.drawTable('#ver-table', allCols, rows, 'verMine', true);
  }

  // ── Authorization Table Rendering ──────────────────────────────────────────
  private renderAuthorizationTable(): void {
    if (this.currentSubTab === 'pending') { this.renderAuthorizationPending(); }
    else { this.renderAuthorizationMine(); }
  }

  private renderAuthorizationPending(): void {
    const allCols = [
      { key: 'chk', label: '', visible: true },
      { key: 'Employee', label: 'Employee', visible: true },
      { key: 'Qualification', label: 'Qualification', visible: true },
      { key: 'Type', label: 'Type', visible: true },
      { key: 'Level', label: 'Level', visible: true },
      { key: 'TargetDate', label: 'Target Date', visible: true },
      { key: 'ReceivedDate', label: 'Initiated Date', visible: true },
      { key: 'VerifiedBy', label: 'Verified by', visible: true },
      { key: 'Status', label: 'Status', visible: true },
      { key: 'Details', label: 'Details', visible: true }
    ];

    const rows = this.authorizationRows.map(r => ({
      chk: '<input type="checkbox" />',
      Employee: r.Employee,
      Qualification: r.Qualification,
      Type: r.Type,
      Level: r.Level,
      TargetDate: r.TargetDate,
      ReceivedDate: r.ReceivedDate,
      VerifiedBy: r.VerifiedBy,
      Status: r.Status,
      Details: '<a href="#" class="text-primary text-sm evaluate-link">Evaluate</a>'
    }));

    this.renderColVisibilityMenu('requested-col-visibility', allCols, 'authPending');
    this.drawTable('#auth-table', allCols, rows, 'authPending');
  }

  private renderAuthorizationMine(): void {
    const allCols = [
      { key: 'Employee', label: 'Employee', visible: true },
      { key: 'Qualification', label: 'Qualification', visible: true },
      { key: 'Type', label: 'Type', visible: true },
      { key: 'Level', label: 'Level', visible: true },
      { key: 'TargetDate', label: 'Target Date', visible: true },
      { key: 'ReceivedDate', label: 'Initiated Date', visible: true },
      { key: 'VerifiedBy', label: 'Verified by', visible: true },
      { key: 'Status', label: 'Status', visible: true }
    ];

    const rows = this.authorizationRows.map(r => ({
      Employee: r.Employee,
      Qualification: r.Qualification,
      Type: r.Type,
      Level: r.Level,
      TargetDate: r.TargetDate,
      ReceivedDate: r.ReceivedDate,
      VerifiedBy: r.VerifiedBy,
      Status: r.Status
    }));

    this.renderColVisibilityMenu('requested-col-visibility', allCols, 'authMine');
    this.drawTable('#auth-table', allCols, rows, 'authMine', true);
  }

  // ── Core Table Drawing ─────────────────────────────────────────────────────
  private drawTable(
    selector: string,
    allColumns: Array<{ key: string; label: string; visible: boolean }>,
    rows: any[],
    tabKey: string,
    clickableRows: boolean = false
  ): void {
    const table = this.domElement.querySelector(selector) as HTMLTableElement;
    if (!table) return;

    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    if (!thead || !tbody) return;

    const visibleCols = allColumns.filter(col => {
      if (col.key === 'chk' || col.key === 'Withdraw') return true;
      return this.colVisibility[tabKey + '_' + col.key] !== false;
    });

    let headHtml = '<tr>';
    for (const col of visibleCols) {
      if (col.key === 'chk') {
        // headHtml += '<th style="width:36px;"></th>';
        headHtml += '<th style="width:36px;"><input type="checkbox" class="select-all-chk" /></th>';
      } else if (col.key === 'Details' || col.key === 'Withdraw') {
        headHtml +=
          `<th style="${this.nmColWidthStyle(col.key, visibleCols)}"><div class="w-100 d-flex justify-content-between align-items-center">` +
          `<p class="text-color-3 font-medium text-sm" style="white-space:normal;">${col.label}</p></div></th>`;
      } else {
        headHtml +=
          `<th class="sortable-col" data-sort-key="${col.key}" style="cursor:pointer;${this.nmColWidthStyle(col.key, visibleCols)}">` +
          `<div class="w-100 d-flex justify-content-between align-items-center gap-1" style="flex-wrap:nowrap;">` +
          `<p class="text-color-3 font-medium text-sm" style="margin:0;min-width:0;white-space:normal;">${col.label}</p>` +
          this.getSortSVG(col.key) +
          `</div></th>`;
      }
    }
    headHtml += '</tr>';
    thead.innerHTML = headHtml;
    const selectAllChk = thead.querySelector('.select-all-chk') as HTMLInputElement | null;
    if (selectAllChk) {
      selectAllChk.addEventListener('change', () => {
        tbody.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(cb => {
          cb.checked = selectAllChk.checked;
        });
      });
    }

    const self = this;
    thead.querySelectorAll('.sortable-col').forEach(th => {
      th.addEventListener('click', function () {
        const clickedKey = th.getAttribute('data-sort-key') || '';
        if (self.sortState.key === clickedKey) {
          if (self.sortState.direction === 'asc') { self.sortState.direction = 'desc'; }
          else if (self.sortState.direction === 'desc') { self.sortState.direction = 'default'; self.sortState.key = ''; }
          else { self.sortState.direction = 'asc'; }
        } else {
          self.sortState.key = clickedKey;
          self.sortState.direction = 'asc';
        }
        const pg = self.getPagination(self.currentTabKey());
        pg.currentPage = 1;
        self.fetchAndRefresh();
      });
    });

    if (rows.length === 0) {
      // Load failed: same error state as my-qualifications.js (audit D10 / handover C4)
      if (!this._isLoading && this._loadError) {
        tbody.innerHTML =
          `<tr><td colspan="${visibleCols.length}" class="text-center py-4 text-color-3 text-sm font-medium">` +
          'Could not load data. <a href="#" role="button" class="nemko-table-retry-link">Try again</a>' +
          `</td></tr>`;
        const retryLink = tbody.querySelector('.nemko-table-retry-link');
        if (retryLink) {
          retryLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.fetchAndRefresh();
          });
        }
        return;
      }
      tbody.innerHTML =
        `<tr><td colspan="${visibleCols.length}" class="text-center py-4 text-color-3 text-sm font-medium">` +
        (this._isLoading ? 'Loading data…' : 'No records found. Try adjusting your search criteria.') +
        `</td></tr>`;
      return;
    }

    const sourceRows = this.currentMainTab === 'verification' ? this.verificationRows : this.authorizationRows;
    tbody.innerHTML = rows.map((row, rowIdx) => {
      const dataRow = sourceRows[rowIdx];
      const qualId = dataRow ? dataRow.QualificationId : '';
      return (clickableRows
        ? `<tr class="nemko-row-clickable" data-row-clickable="1" data-qual-id="${qualId}" style="cursor:pointer;">`
        : `<tr data-qual-id="${qualId}">`) +
        visibleCols.map(col => {
          const val = row[col.key];
          const content = val !== undefined && val !== null ? val : '';
          // 'chk' (checkbox) / 'Details' / 'Withdraw' cells carry their own
          // interactive HTML — clamping them risks clipping the control
          // itself, so only plain-text columns get wrapped (matches
          // my-qualifications.js's line-clamp-3 pattern).
          if (col.key === 'chk' || col.key === 'Details' || col.key === 'Withdraw') {
            return '<td>' + content + '</td>';
          }
          return '<td><div class="line-clamp-3">' + content + '</div></td>';
        }).join('') +
        '</tr>';
    }).join('');
  }

  // ── Verify / Authorize / Reject ────────────────────────────────────────────
  private async verifySelected(): Promise<void> {
    const tbody = this.domElement.querySelector('#ver-table tbody');
    if (!tbody) return;
    const checked = this.getCheckedRowIndexes(tbody);
    if (checked.length === 0) { alert('Please select at least one row to verify.'); return; }

    const selectedRows = checked.map(ci => this.verificationRows[ci]).filter(Boolean);
    const ids = selectedRows.map(r => Number(r.QualificationId));

    if (this.authorizerOptions.length === 0) {
      await this.loadAuthorizerOptionsFromApi(0, 0);
    }
    const verifierEmployeeId = this.getEmployeeIdByEmail(this.currentUserEmail);

    this.apiBulkUpdate(ids, 'verify', verifierEmployeeId)
      .then(result => {
        this.verificationRows = this.verificationRows.filter(r => result.completedIds.indexOf(Number(r.QualificationId)) === -1);
        selectedRows
          .filter(row => result.completedIds.indexOf(Number(row.QualificationId)) !== -1)
          .forEach(row => this.addAudit('Verified', row.Employee, row.Qualification));
        this.showBulkUpdateResultAlert(result, 'verified');
        this.fetchAndRefresh();
      })
      .catch(err => {
        console.error('[NEMKO] BulkUpdate verify failed:', err);
        alert('Bulk verification failed. Please try again.');
      });
  }

  private async authorizeSelected(): Promise<void> {
    const tbody = this.domElement.querySelector('#auth-table tbody');
    if (!tbody) return;
    const checked = this.getCheckedRowIndexes(tbody);
    if (checked.length === 0) { alert('Please select at least one row to authorize.'); return; }

    const selectedRows = checked.map(ci => this.authorizationRows[ci]).filter(Boolean);
    const ids = selectedRows.map(r => Number(r.QualificationId));

    if (this.authorizerOptions.length === 0) {
      await this.loadAuthorizerOptionsFromApi(0, 0);
    }
    const authorizerEmployeeId = this.getEmployeeIdByEmail(this.currentUserEmail);

    this.apiBulkUpdate(ids, 'authorize', authorizerEmployeeId)
      .then(result => {
        this.authorizationRows = this.authorizationRows.filter(r => result.completedIds.indexOf(Number(r.QualificationId)) === -1);
        selectedRows
          .filter(row => result.completedIds.indexOf(Number(row.QualificationId)) !== -1)
          .forEach(row => this.addAudit('Authorized', row.Employee, row.Qualification));
        this.showBulkUpdateResultAlert(result, 'authorized');
        this.fetchAndRefresh();
      })
      .catch(err => {
        console.error('[NEMKO] BulkUpdate authorize failed:', err);
        alert('Bulk authorization failed. Please try again.');
      });
  }

  private getEmployeeIdByEmail(email: string): number {
    if (!email) return 0;
    const matches = this.authorizerOptions.filter(
      (a: { id: number; name: string; email: string }) => a.email && a.email.toLowerCase() === email.toLowerCase()
    );
    return matches.length > 0 ? matches[0].id : 0;
  }

  // private async apiVerifyQualification(qualificationId: number, toBeAuthorizedByEmployeeIds: number[], finalLimitation: string, targetAchieveDate?: string): Promise<void> {
  private async apiVerifyQualification(qualificationId: number, toBeAuthorizedByEmployeeIds: number[], finalLimitation: string, targetAchieveDate?: string, remarks?: string): Promise<void> {
    if (!this.apiClient) return;
    const url = `${API_BASE_URL}/api/qualification/Operation`;
    const body: any = {
      qualificationId: [qualificationId],
      status: 'verify',
      toBeVerifiedBy: [],
      toBeAuthorizedBy: toBeAuthorizedByEmployeeIds.map(id => ({ employeeId: id })),
      actionComment: finalLimitation,
      remarks: remarks ?? ''
    };
    if (targetAchieveDate) {
      body.targetAchieveDate = targetAchieveDate;
    }
    const response = await this.apiClient.fetch(url, AadHttpClient.configurations.v1, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw new Error(`API ${response.status}`);
    }
  }

  // private async apiAuthorizeQualification(qualificationId: number, toBeAuthorizedByEmployeeId: number, finalLimitation: string): Promise<void> {
  private async apiAuthorizeQualification(qualificationId: number, toBeAuthorizedByEmployeeId: number, finalLimitation: string, remarks?: string): Promise<void> {
    if (!this.apiClient) return;
    const url = `${API_BASE_URL}/api/qualification/Operation`;
    const response = await this.apiClient.fetch(url, AadHttpClient.configurations.v1, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        qualificationId: [qualificationId],
        status: 'authorize',
        toBeVerifiedBy: [],
        toBeAuthorizedBy: [{ employeeId: toBeAuthorizedByEmployeeId }],
        actionComment: finalLimitation,
    remarks: remarks ?? ''
      })
    });
    if (!response.ok) {
      throw new Error(`API ${response.status}`);
    }
  }
  private async apiRejectQualification(
    qualificationId: number,
    reason: string = ''
  ): Promise<void> {

    if (!this.apiClient) return;

    const url = `${API_BASE_URL}/api/qualification/Operation`;

    const response = await this.apiClient.fetch(
      url,
      AadHttpClient.configurations.v1,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qualificationId: [qualificationId],
          status: 'reject',
          actionComment: reason
        })
      }
    );

    if (!response.ok) {
      throw new Error(`API ${response.status}`);
    }
  }



  private async apiWithdrawQualification(qualificationId: number, reason: string = ''): Promise<void> {
    if (!this.apiClient) return;
    const url = `${API_BASE_URL}/api/qualification/Operation`;
    const response = await this.apiClient.fetch(url, AadHttpClient.configurations.v1, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        qualificationId: [qualificationId],
        status: 'withdraw',
        actionComment: reason
      })
    });
    if (!response.ok) {
      throw new Error(`API ${response.status}`);
    }
  }

  private withdrawFromQualificationDetailsModal(): void {
    const self = this;
    const row = this.findRow(this.verificationRows, function (r) { return r.Id === self.activeDetailsRowId; });
    if (!row) { this.closeModal('qualificationDetailsModal'); return; }

    this.openWithdrawReasonModal((reason: string) => {
      this.apiWithdrawQualification(Number(row.QualificationId), reason)
        .then(() => {
          row.Status = 'Withdrawn';
          this.addAudit('Withdrawn', row.Employee, row.Qualification);
          this.closeModal('qualificationDetailsModal');
          alert('Qualification has been withdrawn successfully.');
          this.fetchAndRefresh();
        })
        .catch(err => {
          console.error('[NEMKO] Withdraw failed:', err);
          alert('Failed to withdraw qualification. Please try again.');
        });
    }, 'qualificationDetailsModal');
  }
  private withdrawFromWithdrawDetailsModal(): void {
    const self = this;
    const row = this.findRow(this.authorizationRows, function (r) { return r.Id === self.activeDetailsRowId; });
    if (!row) { this.closeModal('withdrawDetailsModal'); return; }

    this.openWithdrawReasonModal((reason: string) => {
      this.apiWithdrawQualification(Number(row.QualificationId), reason)
        .then(() => {
          row.Status = 'Withdrawn';
          row.Withdrawn = true;
          this.addAudit('Withdrawn', row.Employee, row.Qualification);
          this.closeModal('withdrawDetailsModal');
          alert('Qualification has been withdrawn successfully.');
          this.fetchAndRefresh();
        })
        .catch(err => {
          console.error('[NEMKO] Withdraw failed:', err);
          alert('Failed to withdraw qualification. Please try again.');
        });
    }, 'withdrawDetailsModal');
  }


  private async apiBulkUpdate(
    qualificationIds: number[],
    action: 'verify' | 'authorize' | 'reject',
    employeeId?: number,
    reason?: string,
  remarks?: string
  ): Promise<IBulkUpdateResult> {
    const emptyResult: IBulkUpdateResult = {
      completedIds: [],
      notFoundIds: [],
      authorizerEmpty: [],
      totalRequested: qualificationIds.length,
      totalCompleted: 0,
      totalFailed: qualificationIds.length
    };
    if (!this.apiClient) return emptyResult;
    const url = `${API_BASE_URL}/api/qualification/BulkUpdate`;
    const payload: any = {
      qualificationId: qualificationIds,
      status: action,
      toBeVerifiedBy: [],
      toBeAuthorizedBy: []
    };
    if (reason) {
      payload.actionComment = reason;
    }
    if (remarks) {
    payload.remarks = remarks;
  }
    const response = await this.apiClient.fetch(url, AadHttpClient.configurations.v1, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`API ${response.status}`);
    }
    const json = await response.json().catch(() => null);
    const data = json && json.data ? json.data : {};
    return {
      completedIds: (data.completedIds || []).map(Number),
      notFoundIds: (data.notFoundIds || []).map(Number),
      authorizerEmpty: (data.authorizerEmpty || []).map(Number),
      totalRequested: data.totalRequested ?? qualificationIds.length,
      totalCompleted: data.totalCompleted ?? 0,
      totalFailed: data.totalFailed ?? qualificationIds.length
    };
  }
  private showBulkUpdateResultAlert(result: IBulkUpdateResult, actionLabel: string): void {
    const messages: string[] = [];
    if (result.completedIds.length > 0) {
      messages.push(`${result.completedIds.length} qualification(s) ${actionLabel} successfully.`);
    }
    if (result.authorizerEmpty.length > 0) {
      messages.push(`${result.authorizerEmpty.length} qualification(s) could not be ${actionLabel} because no authorizer is assigned (ID: ${result.authorizerEmpty.join(', ')}).`);
    }
    if (result.notFoundIds.length > 0) {
      messages.push(`${result.notFoundIds.length} qualification(s) were not found (ID: ${result.notFoundIds.join(', ')}).`);
    }
    if (messages.length === 0) {
      messages.push(`No qualifications were ${actionLabel}. Please try again.`);
    }
    alert(messages.join('\n'));
  }

  private rejectSelected(panel: string): void {
    const tableId = panel === 'verification' ? '#ver-table' : '#auth-table';
    const tbody = this.domElement.querySelector(tableId + ' tbody');
    if (!tbody) return;
    const checked = this.getCheckedRowIndexes(tbody);
    if (checked.length === 0) { alert('Please select at least one row to reject.'); return; }

    const sourceRows = panel === 'verification' ? this.verificationRows : this.authorizationRows;
    const selectedRows = checked.map(ci => sourceRows[ci]).filter(Boolean);
    const ids = selectedRows.map(r => Number(r.QualificationId));

    this.openRejectReasonModal((reason: string) => {

      this.apiBulkUpdate(ids, 'reject', undefined, reason)
        .then(result => {
          if (panel === 'verification') {
            this.verificationRows = this.verificationRows.filter(r => result.completedIds.indexOf(Number(r.QualificationId)) === -1);
          } else {
            this.authorizationRows = this.authorizationRows.filter(r => result.completedIds.indexOf(Number(r.QualificationId)) === -1);
          }
          selectedRows
            .filter(row => result.completedIds.indexOf(Number(row.QualificationId)) !== -1)
            .forEach(row => this.addAudit('Rejected', row.Employee, row.Qualification));
          this.showBulkUpdateResultAlert(result, 'rejected');
          this.fetchAndRefresh();
        })
        .catch(err => {
          console.error('[NEMKO] BulkUpdate reject failed:', err);
          alert('Reject failed. Please try again.');
        });
    });
  }


  private bindRejectReasonModal(): void {
    const self = this;
    this.domElement.querySelector('#reject-reason-close-btn')?.addEventListener('click', () => {
      self.rejectReasonConfirmCallback = null;
      self.closeModal('rejectReasonModal');
    });
    this.domElement.querySelector('#reject-reason-confirm-btn')?.addEventListener('click', () => {
      const textarea = self.domElement.querySelector('#reject-reason-textarea') as HTMLTextAreaElement;
      const reason = textarea?.value?.trim() ?? '';
      const callback = self.rejectReasonConfirmCallback;
      self.rejectReasonConfirmCallback = null;
      self.closeModal('rejectReasonModal');
      if (callback) callback(reason);
    });
  }
  private openRejectReasonModal(onConfirm: (reason: string) => void, underlyingModalId?: string): void {
    const textarea = this.domElement.querySelector('#reject-reason-textarea') as HTMLTextAreaElement;
    if (textarea) textarea.value = '';
    this.rejectReasonConfirmCallback = onConfirm;
    if (underlyingModalId) {
      this.closeThenOpenModal(underlyingModalId, 'rejectReasonModal');
    } else {
      this.openModal('rejectReasonModal');
    }
  }

  private bindWithdrawReasonModal(): void {
    const self = this;
    this.domElement.querySelector('#withdraw-reason-close-btn')?.addEventListener('click', () => {
      self.withdrawReasonConfirmCallback = null;
      self.closeModal('withdrawReasonModal');
    });
    this.domElement.querySelector('#withdraw-reason-confirm-btn')?.addEventListener('click', () => {
      const textarea = self.domElement.querySelector('#withdraw-reason-textarea') as HTMLTextAreaElement;
      const reason = textarea?.value?.trim() ?? '';
      const callback = self.withdrawReasonConfirmCallback;
      self.withdrawReasonConfirmCallback = null;
      self.closeModal('withdrawReasonModal');
      if (callback) callback(reason);
    });
  }

  private openWithdrawReasonModal(onConfirm: (reason: string) => void, underlyingModalId?: string): void {
    const textarea = this.domElement.querySelector('#withdraw-reason-textarea') as HTMLTextAreaElement;
    if (textarea) textarea.value = '';
    this.withdrawReasonConfirmCallback = onConfirm;
    if (underlyingModalId) {
      this.closeThenOpenModal(underlyingModalId, 'withdrawReasonModal');
    } else {
      this.openModal('withdrawReasonModal');
    }
  }

  // ── Modal: Qualification Details ───────────────────────────────────────────
  private openQualificationDetailsModal(row: Element): void {
    const isPendingView = this.currentSubTab === 'pending';
    const offset = isPendingView ? 1 : 0;

    const cells = row.querySelectorAll('td');
    const employeeFallback = cells[0 + offset]?.textContent?.trim() ?? '';
    const authorizerFallback = cells[4 + offset]?.textContent?.trim() ?? '';

    const rowQualId = (row as HTMLElement).getAttribute('data-qual-id') ?? '';
    const found = this.currentMainTab === 'verification'
      ? (rowQualId
        ? this.findRow(this.verificationRows, function (r) { return r.QualificationId === rowQualId; })
        : this.findRow(this.verificationRows, function (r) { return r.Employee === employeeFallback; }))
      : (rowQualId
        ? this.findRow(this.authorizationRows, function (r) { return r.QualificationId === rowQualId; })
        : this.findRow(this.authorizationRows, function (r) { return r.Employee === employeeFallback; }));

    this.activeDetailsRowId = found ? found.Id : -1;
    const qualId = found ? found.QualificationId : rowQualId;

    this._populateQualificationDetailsModal({ qualId, isPendingView, found, authorizerFallback });
    this.openModal('qualificationDetailsModal');
  }

  private _populateQualificationDetailsModal(opts: {
    qualId: string;
    isPendingView: boolean;
    found: IVerificationRow | undefined;
    authorizerFallback: string;
  }): void {
    const { qualId, isPendingView, found, authorizerFallback } = opts;
    this.qualDetailsRequestId = (this.qualDetailsRequestId || 0) + 1;
    const requestId = this.qualDetailsRequestId;
    this.authorizerPickerQualId = Number(qualId) || 0;
    this.authorizerPickerQualificationReferenceId = 0;


    const limitationsTextarea = this.domElement.querySelector('#qd-limitations-textarea') as HTMLTextAreaElement;
    if (limitationsTextarea) { limitationsTextarea.value = ''; limitationsTextarea.readOnly = !isPendingView; }
    this.setToggleField('qd-limitations-textarea', 'qd-limitations-textarea-para', '', isPendingView, 'qd-limitations-textarea-row');

    // const targetDateInput = this.domElement.querySelector('#targetAchieveDate') as HTMLInputElement;
    // if (targetDateInput) { targetDateInput.value = ''; targetDateInput.readOnly = true; targetDateInput.style.pointerEvents = isPendingView ? '' : 'none'; }
    const targetDateInput = this.domElement.querySelector('#targetAchieveDate') as HTMLInputElement;
    if (targetDateInput) {
      targetDateInput.value = '';
      targetDateInput.readOnly = true;
      targetDateInput.style.pointerEvents = isPendingView ? '' : 'none';
      targetDateInput.style.backgroundColor = isPendingView ? '' : '#e9ecef';
      targetDateInput.style.cursor = isPendingView ? 'pointer' : 'default';
    }
    const targetDateIcon = this.domElement.querySelector('#targetAchieveDateIcon') as HTMLElement;
    if (targetDateIcon) targetDateIcon.style.display = isPendingView ? '' : 'none';

    const verifyBtn = this.domElement.querySelector('#qd-verify-btn') as HTMLElement;
    const rejectBtn = this.domElement.querySelector('#qd-reject-btn') as HTMLElement;
    const withdrawBtn = this.domElement.querySelector('#qd-withdraw-btn') as HTMLElement;
    const authorizerInput = this.domElement.querySelector('#qd-authorizer') as HTMLInputElement;
    const authorizerPickBtn = this.domElement.querySelector('#qd-authorizer-pick-btn') as HTMLElement;

    if (withdrawBtn) withdrawBtn.style.display = 'none';

    if (isPendingView) {
      if (verifyBtn) verifyBtn.style.display = '';
      if (rejectBtn) rejectBtn.style.display = '';
      // if (authorizerInput) { authorizerInput.value = ''; authorizerInput.readOnly = true; authorizerInput.style.display = ''; }
      if (authorizerInput) {
        authorizerInput.value = '';
        authorizerInput.readOnly = true;
        authorizerInput.style.display = '';
      }
      if (authorizerPickBtn) authorizerPickBtn.style.display = '';
      const wrapper = authorizerInput?.parentElement;
      if (wrapper) { const oldEl = wrapper.querySelector('.qd-authorizer-readonly') as HTMLElement; if (oldEl) oldEl.style.display = 'none'; }
      this.selectedAuthorizerTemps = [];
      const authSearchInput = this.domElement.querySelector('#authorizer-search-input') as HTMLInputElement;
      if (authSearchInput) authSearchInput.value = '';
    } else {
      if (verifyBtn) verifyBtn.style.display = 'none';
      if (rejectBtn) rejectBtn.style.display = 'none';
      // if (authorizerInput) { authorizerInput.value = ''; authorizerInput.readOnly = false; authorizerInput.style.display = ''; }
      if (authorizerInput) {
        authorizerInput.value = '';
        authorizerInput.readOnly = true;
        authorizerInput.style.display = '';
      }
      if (authorizerPickBtn) authorizerPickBtn.style.display = 'none';
    }

    this.setModalField('qd-qual-id', found?.ExternalId || 'Loading…');
    this.setModalField('qd-requested-by', 'Loading…');
    this.setModalField('qd-verifier', 'Loading…');
    this.setModalField('qd-qualification', 'Loading…');
    this.setModalField('qd-qualification-type', 'Loading…');
    this.setModalField('qd-qual-level', 'Loading…');
    this.setModalField('qd-conformity', '—');
    this.setModalField('qd-report-approver', '—');
    this.setModalField('qd-certification', '—');
    this.setModalField('qd-status', '—');
    this.setToggleField('qd-remarks', 'qd-remarks-para', '', isPendingView, 'qd-remarks-row');
    const remarksTextarea = this.domElement.querySelector('#qd-remarks') as HTMLTextAreaElement;
    if (remarksTextarea) remarksTextarea.readOnly = !isPendingView;
    this.setToggleField('qd-limitations-requester-textarea', 'qd-limitations-requester', '', false, 'qd-limitations-requester-row');
    this.setModalField('qd-local-unit', found?.LocalUnit || 'Loading…');
    this.setModalField('qd-email-address', found?.AppliedByEmail || 'Loading…');
    this.setRowVisibility('qd-qualified-date-row', !isPendingView);
    this.setRowVisibility('qd-withdrawn-date-row', !isPendingView);
    this.setRowVisibility('qd-withdrawn-reason-row', !isPendingView);
    this.setRowVisibility('qd-withdrawn-by-row', !isPendingView);

    this.fetchQualificationById(qualId).then((fresh: any) => {
      if (requestId !== this.qualDetailsRequestId) return; // stale response, a newer row is open now
      if (fresh?.__notFound) {
        this.handleDeletedQualification(qualId, 'qualificationDetailsModal');
        return;
      }
      const fmtDate = (d: string | null | undefined) => {
        if (!d) return '';
        return d.split('T')[0];
      };

      const appliedBy = fresh?.appliedBy ?? {};
      const employee = appliedBy.name ?? found?.Employee ?? '';
      const qualification = fresh?.qualificationReference?.name ?? '';
      const qualificationType = fresh?.qualificationTypeId?.name ?? fresh?.qualificationType?.name ?? '';
      const level = fresh?.qualificationLevel?.name ?? '';
      const targetDate = fmtDate(fresh?.targetAchieveDate);
      const conformity = fresh != null ? this.yesNo(fresh.confirmityStatement ?? fresh.conformityStatement) : '—';
      const reportApprover = fresh != null ? this.yesNo(fresh.reportApprover) : '—';
      const certificationDecision = fresh != null ? this.yesNo(fresh.certificationDecision) : '—';
      const status = fresh?.qualificationStatus?.name ?? found?.Status ?? fresh?.status ?? '—';
      const remarks = fresh?.remarks ?? '';
      const limitations = fresh?.limitations ?? '';
      const finalLimitation = fresh?.FinalLimitations ?? '';
      const qualifiedDate = fresh?.qualifiedDate ?? '';
      const withdrawnDate = fresh?.withdrawnDate ?? '';
      const withdrawnReason = fresh?.withdrawnReason ?? '';
      const withdrawnBy = fresh?.withdrawnBy?.name ?? '';
      const authorizer = fresh != null && Array.isArray(fresh.authorizer)
        ? fresh.authorizer.map((a: any) => a.name).join(', ')
        : authorizerFallback;

      const verifiedByName = Array.isArray(fresh?.verifier)
        ? fresh.verifier.map((v: any) => v.name).join(', ')
        : (found?.VerifiedBy ?? '');

      const qualTypeId = Number(
        fresh?.qualificationTypeId?.qualificationTypeId ??
        fresh?.qualificationType?.qualificationTypeId ??
        found?.QualificationTypeId ?? 0
      ) || 0;
      const qualLevel = Number(
        fresh?.qualificationLevel?.qualificationLevelId ??
        found?.QualificationLevel ?? 0
      ) || 0;
      const authorizerEmployeeIds: number[] = Array.isArray(fresh?.authorizer)
        ? fresh.authorizer.map((a: any) => Number(a.employeeId ?? 0)).filter((id: number) => id > 0)
        : (found as IVerificationRow)?.AuthorizerEmployeeIds ?? [];
      const externalId = fresh?.externalId ?? found?.ExternalId ?? '';
      const localUnit = fresh?.localUnit ?? found?.LocalUnit ?? '—';
      const emailAddress = appliedBy.email ?? found?.AppliedByEmail ?? '—';

      this.setModalField('qd-qual-id', externalId || '—');
      this.setModalField('qd-local-unit', localUnit);
      this.setModalField('qd-email-address', emailAddress);
      this.setModalField('qd-requested-by', employee);
      this.setModalField('qd-qualification', qualification);
      this.setModalField('qd-qualification-type', qualificationType || '—');
      this.setModalField('qd-qual-level', level);
      this.setModalField('qd-conformity', conformity);
      this.setModalField('qd-report-approver', reportApprover);
      this.setModalField('qd-certification', certificationDecision);
      // this.setModalField('qd-status', status);
      this.setModalField('qd-status', status);
      this.setModalField('qd-verifier', verifiedByName);
      this.setToggleField('qd-remarks', 'qd-remarks-para', remarks, isPendingView, 'qd-remarks-row');
      if (remarksTextarea) remarksTextarea.readOnly = !isPendingView;
      this.setToggleField('qd-limitations-requester-textarea', 'qd-limitations-requester', limitations, false, 'qd-limitations-requester-row');

      const qdWithdrawBtn = this.domElement.querySelector('#qd-withdraw-btn') as HTMLElement;
      if (qdWithdrawBtn) qdWithdrawBtn.style.display = (!isPendingView && status === 'Authorized') ? '' : 'none';

      // const statusNorm = String(status).trim().toLowerCase();
      // const isAuthorized = statusNorm === 'authorized';
      // const isWithdrawnStatus = statusNorm === 'withdrawn';
      // Withdrawn By / Withdrawn Reason / Withdrawn date: NEVER shown in
      // Pending verification. Always shown in "Verified by me", regardless
      // of status — empty values fall back to the same dash/underline
      // treatment used for Limitations and Remarks. Single source of
      // truth — no other branch below is allowed to override this.
      const showWithdrawnInfo = !isPendingView;
      this.setRowVisibility('qd-withdrawn-reason-row', showWithdrawnInfo);
      this.setRowVisibility('qd-withdrawn-by-row', showWithdrawnInfo);
      this.setRowVisibility('qd-withdrawn-date-row', showWithdrawnInfo);
      this.setToggleField('qd-withdrawn-reason-textarea', 'qd-withdrawn-reason-para', showWithdrawnInfo ? withdrawnReason : '', false, 'qd-withdrawn-reason-row');
      this.setModalField('qd-withdrawn-by', showWithdrawnInfo ? withdrawnBy : '—');
      const wDate = withdrawnDate ? withdrawnDate.split('T')[0] : '';
      this.setModalField('qd-withdrawn-date-readonly', showWithdrawnInfo ? wDate : '—');
      this.setRowVisibility('qd-qualified-date-row', showWithdrawnInfo);
      const qDate = qualifiedDate ? qualifiedDate.split('T')[0] : '';
      this.setModalField('qd-qualified-date-readonly', showWithdrawnInfo ? qDate : '—');
      if (limitationsTextarea) limitationsTextarea.value = finalLimitation;
      this.setToggleField('qd-limitations-textarea', 'qd-limitations-textarea-para', finalLimitation, isPendingView, 'qd-limitations-textarea-row');

      // if (limitationsTextarea) limitationsTextarea.value = finalLimitation;
      // if (targetDateInput) targetDateInput.value = targetDate;
      if (targetDateInput) targetDateInput.value = isPendingView ? targetDate : (targetDate || '—');

      if (isPendingView) {
        if (authorizerInput) authorizerInput.value = authorizer;
        this.authorizerOptions = [];
        this.authorizerOptions = [];
        this.authorizerPickerTypeId = qualTypeId;
        this.authorizerPickerLevel = qualLevel;
        const qualificationReferenceId = Number(fresh?.qualificationReference?.qualificationReferenceId) || 0;
        this.authorizerPickerQualificationReferenceId = qualificationReferenceId;
        this.loadAuthorizerOptionsFromApi(qualTypeId, qualLevel, '', Number(qualId), qualificationReferenceId)
          .then(() => {
            if (authorizerEmployeeIds.length > 0) {
              this.selectedAuthorizerTemps = this.authorizerOptions.filter(
                a => authorizerEmployeeIds.indexOf(a.id) !== -1
              );
            }
            this.renderAuthorizerList();
          });
      } else {
        if (authorizerInput) authorizerInput.value = authorizer;
      }
    }).catch((err: any) => {
      console.error('[NEMKO] _populateQualificationDetailsModal error:', err);
      this.setModalField('qd-requested-by', found?.Employee ?? '—');
    });
  }

  private verifyFromDetailsModal(): void {
    const self = this;
    const row = this.findRow(this.verificationRows, function (r) { return r.Id === self.activeDetailsRowId; });

    if (row) {

      const authorizerInput = this.domElement.querySelector('#qd-authorizer') as HTMLInputElement;
      const authorizerDisplayName = authorizerInput?.value?.trim() || '';

      let toBeAuthorizedByIds: number[];
      if (this.selectedAuthorizerTemps.length > 0) {
        toBeAuthorizedByIds = this.selectedAuthorizerTemps.map(a => a.id);
      } else {
        toBeAuthorizedByIds = row.AuthorizerEmployeeIds ?? [];
      }

      if (toBeAuthorizedByIds.length === 0 && !authorizerDisplayName) {
        alert('Please select an Authorizer before verifying.');
        return;
      }

      const limitationsTextarea = this.domElement.querySelector('#qualificationDetailsModal #qd-limitations-textarea') as HTMLTextAreaElement;
      const finalLimitation = limitationsTextarea?.value?.trim() ?? '';
      const targetDateInput = this.domElement.querySelector('#targetAchieveDate') as HTMLInputElement;
      const targetAchieveDate = targetDateInput?.value?.trim() || '';
      // this.apiVerifyQualification(Number(row.QualificationId), toBeAuthorizedByIds, finalLimitation, targetAchieveDate)
      const remarksTextarea = this.domElement.querySelector('#qualificationDetailsModal #qd-remarks') as HTMLTextAreaElement;
const remarks = remarksTextarea?.value?.trim() ?? '';
this.apiVerifyQualification(Number(row.QualificationId), toBeAuthorizedByIds, finalLimitation, targetAchieveDate, remarks)
        .then(() => {
          row.Status = 'Verified';
          row.VerifiedBy = this.currentUserEmail || 'Current User';
          this.addAudit('Verified', row.Employee, row.Qualification);
          this.closeModal('qualificationDetailsModal');
          alert(`Sent for authorization to ${authorizerDisplayName}.`);
          this.fetchAndRefresh();
        })
        .catch(err => {
          console.error('[NEMKO] Verify failed:', err);
          alert('Verification failed. Please try again.');
        });
    } else {
      this.closeModal('qualificationDetailsModal');
    }

  }

  private rejectFromDetailsModal(): void {

    const self = this;

    const row = this.findRow(
      this.verificationRows,
      function (r) {
        return r.Id === self.activeDetailsRowId;
      }
    );

    if (!row) return;

    this.openRejectReasonModal((reason: string) => {

      this.apiRejectQualification(
        Number(row.QualificationId),
        reason
      )
        .then(() => {

          row.Status = 'Rejected';

          this.addAudit(
            'Rejected',
            row.Employee,
            row.Qualification
          );

          this.closeModal('qualificationDetailsModal');

          alert(`Qualification for ${row.Employee} has been rejected.`);

          this.fetchAndRefresh();
        })
        .catch(err => {

          console.error(err);

          alert('Reject failed.');
        });
    }, 'qualificationDetailsModal');
  }


  // ── Modal: Authorization Details ───────────────────────────────────────────
  private openAuthorizationDetailsModal(row: Element): void {
    const cells = row.querySelectorAll('td');
    const employeeFallback = cells[1]?.textContent?.trim() ?? '';

    const rowQualId = (row as HTMLElement).getAttribute('data-qual-id') ?? '';
    const found = rowQualId
      ? this.findRow(this.authorizationRows, function (r) { return r.QualificationId === rowQualId; })
      : this.findRow(this.authorizationRows, function (r) { return r.Employee === employeeFallback; });
    this.activeDetailsRowId = found ? found.Id : -1;
    const qualId = found ? found.QualificationId : rowQualId;
    this.authorizerPickerQualId = Number(qualId) || 0;
    const authModal = this.domElement.querySelector('#authorizationDetailsModal') as HTMLElement;
    if (!authModal) return;

    const authorizeBtn = authModal.querySelector('.nemko-btn-success') as HTMLElement;
    if (authorizeBtn) {
      const nb = authorizeBtn.cloneNode(true) as HTMLElement;
      authorizeBtn.parentNode!.replaceChild(nb, authorizeBtn);
      nb.addEventListener('click', () => { this.authorizeFromDetailsModal(); });
    }
    const rejectBtn = authModal.querySelector('.nemko-btn-reject') as HTMLElement;
    if (rejectBtn) {
      const nb = rejectBtn.cloneNode(true) as HTMLElement;
      rejectBtn.parentNode!.replaceChild(nb, rejectBtn);
      nb.addEventListener('click', () => { this.rejectFromAuthorizationDetailsModal(); });
    }
    const closeBtn = authModal.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
    if (closeBtn) {
      const nb = closeBtn.cloneNode(true) as HTMLElement;
      closeBtn.parentNode!.replaceChild(nb, closeBtn);
      nb.addEventListener('click', () => { this.closeModal('authorizationDetailsModal'); });
    }

    const authEmailInput = authModal.querySelector('#auth-auth-email') as HTMLInputElement;
    if (authEmailInput) authEmailInput.value = '';

    const approvalDateInput = authModal.querySelector('#approvalDate') as HTMLInputElement;
    if (approvalDateInput) approvalDateInput.value = '';
    ['radioDefault3', 'radioDefault4'].forEach(name => {
      authModal.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`).forEach((radio, i) => {
        radio.checked = (i === 1);
        const icon = radio.closest('label')?.querySelector('.radio-icon');
        if (icon) { if (i === 1) { icon.classList.add('active'); } else { icon.classList.remove('active'); } }
      });
    });

    const qualIdEl = authModal.querySelector('#auth-qual-id') as HTMLInputElement;
    if (qualIdEl) qualIdEl.value = found?.ExternalId || 'Loading…';
    const requestedByEl = authModal.querySelector('#auth-requested-by') as HTMLInputElement;
    if (requestedByEl) requestedByEl.value = 'Loading…';
    const localUnitEl = authModal.querySelector('#auth-local-unit') as HTMLInputElement;
    if (localUnitEl) localUnitEl.value = found?.LocalUnit || 'Loading…';
    const emailAddressEl = authModal.querySelector('#auth-email-address') as HTMLInputElement;
    if (emailAddressEl) emailAddressEl.value = found?.AppliedByEmail || 'Loading…';
    const qualificationEl = authModal.querySelector('#auth-qualification') as HTMLInputElement;
    if (qualificationEl) qualificationEl.value = 'Loading…';
    const qualificationTypeEl = authModal.querySelector('#auth-qualification-type') as HTMLInputElement;
    if (qualificationTypeEl) qualificationTypeEl.value = 'Loading…';
    const qualLevelEl = authModal.querySelector('#auth-qual-level') as HTMLInputElement;
    if (qualLevelEl) qualLevelEl.value = 'Loading…';
    const conformityEl = authModal.querySelector('#auth-conformity') as HTMLInputElement;
    if (conformityEl) conformityEl.value = '—';
    const reportApproverEl = authModal.querySelector('#auth-report-approver') as HTMLInputElement;
    if (reportApproverEl) reportApproverEl.value = '—';
    const certificationEl = authModal.querySelector('#auth-certification') as HTMLInputElement;
    if (certificationEl) certificationEl.value = '—';
    const statusEl = authModal.querySelector('#auth-status') as HTMLInputElement;
    if (statusEl) statusEl.value = 'Loading…';

    const remarksEl = authModal.querySelector('#auth-remarks') as HTMLTextAreaElement;
if (remarksEl) remarksEl.value = '';
    this.setToggleField('auth-limitations-requester-textarea', 'auth-limitations-requester', '', false, 'auth-limitations-requester-row');
    const limitationsTextarea = authModal.querySelector('#limitationsTxtarea') as HTMLTextAreaElement;
    if (limitationsTextarea) limitationsTextarea.value = found?.FinalLimitation ?? '';
    const targetDateEl = authModal.querySelector('#auth-target-date') as HTMLInputElement;
    if (targetDateEl) targetDateEl.value = 'Loading…';
    const reqEmailInput = authModal.querySelector('#auth-req-email') as HTMLInputElement;
    if (reqEmailInput) reqEmailInput.value = '';
    const verEmailInput = authModal.querySelector('#auth-ver-email') as HTMLInputElement;
    if (verEmailInput) verEmailInput.value = '';

    this.openModal('authorizationDetailsModal');

    this.fetchQualificationById(qualId).then((fresh: any) => {
      if (fresh?.__notFound) {
        this.handleDeletedQualification(qualId, 'authorizationDetailsModal');
        return;
      }
      const appliedBy = fresh?.appliedBy ?? {};
      const employee = appliedBy.name ?? found?.Employee ?? '';
      const qualification = fresh?.qualificationReference?.name ?? '';
      const qualificationType = fresh?.qualificationTypeId?.name ?? fresh?.qualificationType?.name ?? '';
      const level = fresh?.qualificationLevel?.name ?? '';
      const conformity = fresh != null ? this.yesNo(fresh.confirmityStatement ?? fresh.conformityStatement) : '—';
      const reportApprover = fresh != null ? this.yesNo(fresh.reportApprover) : '—';
      const certificationDecision = fresh != null ? this.yesNo(fresh.certificationDecision) : '—';
      const status = fresh?.qualificationStatus?.name ?? fresh?.status ?? found?.Status ?? '—';
      const remarks = fresh?.remarks ?? '';
      const finalLimitation = fresh?.FinalLimitations ?? '';
      const applicantLimitations = fresh?.limitations ?? '';
      const externalId = fresh?.externalId ?? found?.ExternalId ?? '';

       const verifiedByName = Array.isArray(fresh?.verifier)
        ? fresh.verifier.map((v: any) => v.name).join(', ')
        : (found?.VerifiedBy ?? '');

      const authorizerName = Array.isArray(fresh?.authorizer) && fresh.authorizer.length > 0
        ? fresh.authorizer.map((a: any) => a.name).join(', ')
        : (found?.Authorizer ?? '');

      const requesterEmail = appliedBy.email ?? found?.AppliedByEmail ?? '';
      const localUnit = fresh?.localUnit ?? found?.LocalUnit ?? '—';
      const fmtDate = (d: string | null | undefined) => {
        if (!d) return '—';
        return d.split('T')[0];
      };
      const targetDate = fresh?.targetAchieveDate ?? found?.TargetDate ?? '';

      if (qualIdEl) qualIdEl.value = externalId || '—';
      if (requestedByEl) requestedByEl.value = employee || '—';
      if (qualificationEl) qualificationEl.value = qualification || '—';
      if (qualificationTypeEl) qualificationTypeEl.value = qualificationType || '—';
      if (qualLevelEl) qualLevelEl.value = level || '—';
      if (conformityEl) conformityEl.value = conformity;
      if (reportApproverEl) reportApproverEl.value = reportApprover;
      if (certificationEl) certificationEl.value = certificationDecision;
      if (statusEl) statusEl.value = status;
      if (localUnitEl) localUnitEl.value = localUnit;
      if (emailAddressEl) emailAddressEl.value = requesterEmail;

      // if (remarksEl) remarksEl.value = remarks || '—';
      if (remarksEl) remarksEl.value = remarks || '';
      this.setToggleField('auth-limitations-requester-textarea', 'auth-limitations-requester', applicantLimitations, false, 'auth-limitations-requester-row');
      if (limitationsTextarea) limitationsTextarea.value = finalLimitation || found?.FinalLimitation || '';
      if (targetDateEl) targetDateEl.value = fmtDate(targetDate);
      if (reqEmailInput) reqEmailInput.value = requesterEmail;
      if (verEmailInput) verEmailInput.value = verifiedByName;
      if (authEmailInput) authEmailInput.value = authorizerName;

      const qualTypeId = Number(
        fresh?.qualificationTypeId?.qualificationTypeId ??
        fresh?.qualificationType?.qualificationTypeId ??
        found?.QualificationTypeId ?? 0
      ) || 0;
      const qualLevel = Number(
        fresh?.qualificationLevel?.qualificationLevelId ??
        found?.QualificationLevel ?? 0
      ) || 0;
      this.authorizerPickerTypeId = qualTypeId;
      this.authorizerPickerLevel = qualLevel;
      if (this.authorizerOptions.length === 0) {
        this.loadAuthorizerOptionsFromApi(qualTypeId, qualLevel, '', this.authorizerPickerQualId).catch(() => {/* non-fatal */ });
      }
    }).catch((err: any) => {
      console.error('[NEMKO] openAuthorizationDetailsModal fetch error:', err);
      if (requestedByEl) requestedByEl.textContent = found?.Employee ?? '—';
      if (qualificationEl) qualificationEl.textContent = found?.Qualification ?? '—';
    });
  }

  private authorizeFromDetailsModal(): void {
    const self = this;
    const row = this.findRow(this.authorizationRows, function (r) { return r.Id === self.activeDetailsRowId; });
    if (row) {
      const authModal = this.domElement.querySelector('#authorizationDetailsModal') as HTMLElement;
      const authEmailInput = authModal?.querySelector('#auth-auth-email') as HTMLInputElement;
      const authorizerEmail = authEmailInput?.value?.trim() || this.currentUserEmail || '';

      if (!authorizerEmail) {
        alert('Authorizer email is required to authorize this qualification.');
        return;
      }

      const doAuthorize = () => {
        const toBeAuthorizedByEmployeeId = (row.AuthorizerEmployeeIds && row.AuthorizerEmployeeIds.length > 0)
          ? row.AuthorizerEmployeeIds[0]
          : this.getEmployeeIdByEmail(authorizerEmail);
        const limitationsTextarea = this.domElement.querySelector('#authorizationDetailsModal #limitationsTxtarea') as HTMLTextAreaElement;
        const finalLimitation = limitationsTextarea?.value?.trim() ?? '';
        // this.apiAuthorizeQualification(Number(row.QualificationId), toBeAuthorizedByEmployeeId, finalLimitation)
        const remarksTextarea = this.domElement.querySelector('#authorizationDetailsModal #auth-remarks') as HTMLTextAreaElement;
const remarks = remarksTextarea?.value?.trim() ?? '';
this.apiAuthorizeQualification(Number(row.QualificationId), toBeAuthorizedByEmployeeId, finalLimitation, remarks)
          .then(() => {
            row.Status = 'Authorized';
            this.addAudit('Authorized', row.Employee, row.Qualification);
            this.closeModal('authorizationDetailsModal');
            alert(`Qualification for ${row.Employee} has been authorized successfully.`);
            this.fetchAndRefresh();
          })
          .catch(err => {
            console.error('[NEMKO] Authorize failed:', err);
            alert('Authorization failed. Please try again.');
          });
      };

      if (this.authorizerOptions.length === 0) {
        const qualTypeId = row.QualificationTypeId ?? 0;
        const qualLevel = row.QualificationLevel ?? 0;
        this.authorizerPickerTypeId = qualTypeId;
        this.authorizerPickerLevel = qualLevel;
        this.loadAuthorizerOptionsFromApi(qualTypeId, qualLevel)
          .then(doAuthorize)
          .catch(doAuthorize);
        return;
      }

      doAuthorize();
    } else {
      this.closeModal('authorizationDetailsModal');
    }
  }

  private rejectFromAuthorizationDetailsModal(): void {

    const self = this;

    const row = this.findRow(
      this.authorizationRows,
      function (r) {
        return r.Id === self.activeDetailsRowId;
      }
    );

    if (!row) {
      this.closeModal('authorizationDetailsModal');
      return;
    }

    this.openRejectReasonModal((reason: string) => {

      this.apiRejectQualification(
        Number(row.QualificationId),
        reason
      )
        .then(() => {

          row.Status = 'Rejected';

          this.addAudit(
            'Rejected',
            row.Employee,
            row.Qualification
          );

          this.closeModal('authorizationDetailsModal');
          alert(`Qualification for ${row.Employee} has been rejected.`);
          this.fetchAndRefresh();

        })
        .catch(err => {

          console.error('[NEMKO] Reject failed:', err);

          alert('Reject failed. Please try again.');
        });
    }, 'authorizationDetailsModal');
  }

  // ── Modal: Withdraw Details ────────────────────────────────────────────────
  private openWithdrawDetailsModal(row: Element): void {
    this.withdrawDetailsRequestId = (this.withdrawDetailsRequestId || 0) + 1;
    const requestId = this.withdrawDetailsRequestId;
    const cells = row.querySelectorAll('td');
    const employeeFallback = cells[0]?.textContent?.trim() ?? '';

    const modal = this.domElement.querySelector('#withdrawDetailsModal') as HTMLElement;
    if (!modal) return;

    const rowQualId = (row as HTMLElement).getAttribute('data-qual-id') ?? '';
    const foundRow = rowQualId
      ? this.findRow(this.authorizationRows, function (r) { return r.QualificationId === rowQualId; })
      : this.findRow(this.authorizationRows, function (r) { return r.Employee === employeeFallback; });
    this.activeDetailsRowId = foundRow ? foundRow.Id : -1;
    const qualId = foundRow ? foundRow.QualificationId : rowQualId;

    modal.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach(radio => { radio.disabled = true; });

    const wdWithdrawBtn = modal.querySelector('#wd-withdraw-btn') as HTMLElement;
    if (wdWithdrawBtn) wdWithdrawBtn.style.display = 'none';

    const authEmailInput = modal.querySelector('#wd-auth-email') as HTMLInputElement;
    if (authEmailInput) { authEmailInput.value = ''; authEmailInput.readOnly = true; }

    const qualIdEl = modal.querySelector('#wd-qual-id') as HTMLInputElement;
    if (qualIdEl) qualIdEl.value = foundRow?.ExternalId || 'Loading…';

    this.setModalField('wd-requested-by', 'Loading…');
    this.setModalField('wd-qualification', 'Loading…');
    this.setModalField('wd-qualification-type', 'Loading…');
    this.setModalField('wd-level', 'Loading…');
        this.setModalField('wd-conformity', '—');
    this.setModalField('wd-report-approver', '—');
    this.setModalField('wd-status', '—');
    this.setModalField('wd-certification', '—');
    this.setModalField('wd-remarks', '—');

    this.setModalField('wd-limitations', '—');
    this.setModalField('wd-limitations-final', '—');
    this.setModalField('wd-target-date', '—');
    this.setModalField('wd-qualified-date-readonly', '—');
    this.setModalField('wd-withdrawn-date-readonly', '—');
    this.setModalField('wd-local-unit', foundRow?.LocalUnit || 'Loading…');
    this.setModalField('wd-email-address', foundRow?.AppliedByEmail || 'Loading…');
   this.setRowVisibility('wd-withdrawn-reason-row', true);
    this.setRowVisibility('wd-withdrawn-by-row', true);
    this.setModalField('wd-withdrawn-by', '—');


    const reqEmailInput = modal.querySelector('#wd-req-email') as HTMLInputElement;
    if (reqEmailInput) { reqEmailInput.value = ''; reqEmailInput.readOnly = true; }
    const verEmailInput = modal.querySelector('#wd-ver-email') as HTMLInputElement;
    if (verEmailInput) { verEmailInput.value = ''; verEmailInput.readOnly = true; }

    this.openModal('withdrawDetailsModal');

    this.fetchQualificationById(qualId).then((fresh: any) => {
      if (requestId !== this.withdrawDetailsRequestId) return; // stale response, a newer row is open now
      if (fresh?.__notFound) {
        this.handleDeletedQualification(qualId, 'withdrawDetailsModal');
        return;
      }
     const fmtDate = (d: string | null | undefined) => {
        if (!d) return '—';
        return d.split('T')[0];
      };

      const appliedBy = fresh?.appliedBy ?? {};
      const employee = appliedBy.name ?? foundRow?.Employee ?? '';
      const qualification = fresh?.qualificationReference?.name ?? foundRow?.Qualification ?? '';
      const qualificationType = fresh?.qualificationTypeId?.name ?? fresh?.qualificationType?.name ?? '';
      const level = fresh?.qualificationLevel?.name ?? foundRow?.Level ?? '';
      const conformity = fresh != null ? this.yesNo(fresh.confirmityStatement ?? fresh.conformityStatement) : '—';
      const reportApprover = fresh != null ? this.yesNo(fresh.reportApprover) : '—';
      const certificationDecision = fresh != null ? this.yesNo(fresh.certificationDecision) : '—';
      const remarks = fresh?.remarks ?? '';
      const limitations = fresh?.limitations ?? '';
      const finalLimitation = fresh?.FinalLimitations ?? '';
      const externalId = fresh?.externalId ?? foundRow?.ExternalId ?? '';

       const verifiedByName = Array.isArray(fresh?.verifier)
        ? fresh.verifier.map((v: any) => v.name).join(', ')
        : (foundRow?.VerifiedBy ?? '');
      const authorizerName = Array.isArray(fresh?.authorizer) && fresh.authorizer.length > 0
        ? fresh.authorizer.map((a: any) => a.name).join(', ')
        : (foundRow?.Authorizer ?? '');
     const qualifiedDate = fresh?.qualifiedDate ?? foundRow?.QualifiedDate ?? '';
      const withdrawnDate = fresh?.withdrawnDate ?? foundRow?.WithdrawnDate ?? '';
      const targetDate = fresh?.targetAchieveDate ?? foundRow?.TargetDate ?? '';
      const status = fresh?.qualificationStatus?.name ?? foundRow?.Status ?? fresh?.status ?? '—';
      const localUnit = fresh?.localUnit ?? foundRow?.LocalUnit ?? '—';
      const requesterEmail = appliedBy.email ?? foundRow?.AppliedByEmail ?? '—';
     // Withdrawn by / Withdrawn reason are always shown in "Authorized by
      // me", regardless of status — not just when Withdrawn.
      const withdrawnReason = String(fresh?.withdrawnReason ?? '').trim();
      const withdrawnBy = fresh?.withdrawnBy?.name ?? '';
      if (qualIdEl) qualIdEl.value = externalId || '—';
      this.setModalField('wd-requested-by', employee);
      this.setModalField('wd-qualification', qualification);
      this.setModalField('wd-qualification-type', qualificationType || '—');
      this.setModalField('wd-level', level);
      this.setModalField('wd-conformity', conformity);
      this.setModalField('wd-report-approver', reportApprover);
      this.setModalField('wd-status', status);
      this.setModalField('wd-certification', certificationDecision);
      // this.setModalField('wd-remarks', remarks || '—');
      this.setReadonlyTextBox('wd-remarks', remarks || '—');
      this.setModalField('wd-local-unit', localUnit);
      this.setModalField('wd-email-address', requesterEmail);
      // this.setModalField('wd-limitations', limitations || '—');
      this.setReadonlyTextBox('wd-limitations', limitations || '—');
      // this.setModalField('wd-limitations-final', finalLimitation || '—');
      this.setReadonlyTextBox('wd-limitations-final', finalLimitation || '—');
      this.setModalField('wd-target-date', fmtDate(targetDate));
      this.setModalField('wd-qualified-date-readonly', fmtDate(qualifiedDate));
      this.setModalField('wd-withdrawn-date-readonly', fmtDate(withdrawnDate));
      this.setRowVisibility('wd-withdrawn-reason-row', true);
      this.setRowVisibility('wd-withdrawn-by-row', true);
      // Visibility lives on the row only (setRowVisibility above) — the
      // paragraph must never carry its own separate display toggle, or the
      // two can fall out of sync (row shown, text still hidden).
      this.setReadonlyTextBox('wd-withdrawn-reason-para', withdrawnReason || '—');
      this.setModalField('wd-withdrawn-by', withdrawnBy || '—');

       if (reqEmailInput) reqEmailInput.value = requesterEmail;
      if (verEmailInput) verEmailInput.value = verifiedByName;
      if (authEmailInput) authEmailInput.value = authorizerName;


      const wdWithdrawBtnLive = modal.querySelector('#wd-withdraw-btn') as HTMLElement;
      if (wdWithdrawBtnLive) wdWithdrawBtnLive.style.display = (status === 'Authorized') ? '' : 'none';
    }).catch((err: any) => {
      console.error('[NEMKO] openWithdrawDetailsModal fetch error:', err);
      this.setModalField('wd-requested-by', foundRow?.Employee ?? '—');
    });
  }
  private showAuthorizerListLoadingMore(): void {
    const list = this.domElement.querySelector('#authorizer-list');
    if (!list || list.querySelector('.nemko-list-loading-more')) return;
    list.insertAdjacentHTML('beforeend',
      '<div class="nemko-list-loading-more w-100 text-center py-3">' +
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>' +
      '</div>');
  }
  private hideAuthorizerListLoadingMore(): void {
    const spinner = this.domElement.querySelector('#authorizer-list .nemko-list-loading-more');
    if (spinner) spinner.remove();
  }

  private renderAuthorizerList(append: boolean = false): void {
    const list = this.domElement.querySelector('#authorizer-list');
    if (!list) return;
    const self = this;
    if (append) this.hideAuthorizerListLoadingMore();

    if (this.authorizerOptions.length === 0) {
      list.innerHTML = '<p class="text-muted text-sm py-2">No results found.</p>';
      return;
    }

    const selectedIds = this.selectedAuthorizerTemps.map(a => a.id);
    const rowHtml = (a: { id: number; name: string; email: string }) => {
      const isSel = selectedIds.indexOf(a.id) !== -1;
      return (
        `<label class="nemko-frm-chkbox d-flex align-items-center gap-2" data-item-id="${a.id}">` +
        `<input class="form-check-input" type="checkbox" name="authorizerCheckbox" value="${a.id}" data-name="${a.name}" data-email="${a.email}"${isSel ? ' checked' : ''} />` +
        `<span class="chkbox-icon${isSel ? ' active' : ''}"></span>` +
        `<p class="form-check-label" style="text-transform:none;">${a.name}<span class="text-muted text-xs ms-2">${a.email}</span></p>` +
        `</label>`
      );
    };
    const bindRow = (label: Element) => {
      const cb = label.querySelector<HTMLInputElement>('input[name="authorizerCheckbox"]');
      if (!cb) return;
      cb.addEventListener('change', function () {
        const icon = cb.closest('label')?.querySelector('.chkbox-icon');
        if (cb.checked) {
          icon?.classList.add('active');
          const entry = { id: Number(cb.value), name: cb.getAttribute('data-name') || '', email: cb.getAttribute('data-email') || '' };
          if (self.selectedAuthorizerTemps.filter(a => a.id === entry.id).length === 0) {
            self.selectedAuthorizerTemps.push(entry);
          }
        } else {
          icon?.classList.remove('active');
          self.selectedAuthorizerTemps = self.selectedAuthorizerTemps.filter(a => a.id !== Number(cb.value));
        }
      });
    };

    if (append) {
      const renderedCount = list.querySelectorAll('[data-item-id]').length;
      const newItems = this.authorizerOptions.slice(renderedCount);
      if (newItems.length) {
        list.insertAdjacentHTML('beforeend', newItems.map(rowHtml).join(''));
        list.querySelectorAll('[data-item-id]').forEach((label, i) => { if (i >= renderedCount) bindRow(label); });
      }
    } else {
      list.innerHTML = this.authorizerOptions.map(rowHtml).join('');
      list.querySelectorAll('[data-item-id]').forEach(bindRow);
    }

    this.autoFillAuthorizerListIfNoScroll();
  }

  // ── Auto-fill guard for the authorizer picker's infinite scroll ────────────
  // On larger screens the whole authorizer list can fit inside the modal body
  // with no scrollbar at all, so the 'scroll' listener below never fires and
  // the next page is never requested even though hasMore is still true.
  // After every render we check whether the container actually overflows; if
  // it doesn't and more pages remain, we fetch the next page ourselves and
  // re-check once it lands — repeating until either a scrollbar appears or
  // the API reports hasMore === false. A depth cap guards against a runaway
  // loop if the backend never returns hasMore: false.
  private autoFillAuthorizerListIfNoScroll(depth: number = 0): void {
    if (this._authorizerListLoadingMore || depth > 25) return;

    const listEl = this.domElement.querySelector('#authorizer-list') as HTMLElement;
    if (!listEl) return;
    const scrollContainer = (listEl.closest('.modal-body') as HTMLElement) || listEl;

    const pag = this.authorizerListPagination;
    if (!pag || pag.hasMore === false || pag.loading) return;

    // +1px tolerance for sub-pixel layout rounding
    if (scrollContainer.scrollHeight > scrollContainer.clientHeight + 1) return; // already scrollable

    this._authorizerListLoadingMore = true;
    this.showAuthorizerListLoadingMore();
    this.loadAuthorizerOptionsNextPage()
      .then(() => {
        this.renderAuthorizerList(true);
        this._authorizerListLoadingMore = false;
        this.autoFillAuthorizerListIfNoScroll(depth + 1);
      })
      .catch(() => {
        this.hideAuthorizerListLoadingMore();
        this._authorizerListLoadingMore = false;
      });
  }

  // ── Bind Qualification Details Modal ───────────────────────────────────────
  private bindQualificationDetailsModal(): void {
    const self = this;

    this.domElement.querySelector('#qd-close-btn')?.addEventListener('click', () => self.closeModal('qualificationDetailsModal'));

    this.domElement.querySelector('#qd-authorizer-pick-btn')?.addEventListener('click', () => {
      self.loadAuthorizerOptionsFromApi(self.authorizerPickerTypeId, self.authorizerPickerLevel, '', self.authorizerPickerQualId, self.authorizerPickerQualificationReferenceId)
        .then(() => self.renderAuthorizerList());
      self.closeThenOpenModal('qualificationDetailsModal', 'selectAuthorizerModal');
    });
    const authSearchInput = this.domElement.querySelector('#authorizer-search-input') as HTMLInputElement;
    authSearchInput?.addEventListener('input', () => {
      const q = authSearchInput.value;
      if (self._authorizerSearchTimer) clearTimeout(self._authorizerSearchTimer);
      self._authorizerSearchTimer = setTimeout(() => {
        self.loadAuthorizerOptionsFromApi(self.authorizerPickerTypeId, self.authorizerPickerLevel, q, self.authorizerPickerQualId, self.authorizerPickerQualificationReferenceId)
          .then(() => self.renderAuthorizerList());
      }, 300);
    });
    this.domElement.querySelector('#authorizer-search-clear-btn')?.addEventListener('click', () => {
      if (authSearchInput) {
        authSearchInput.value = '';
        self.loadAuthorizerOptionsFromApi(self.authorizerPickerTypeId, self.authorizerPickerLevel, '', self.authorizerPickerQualId, self.authorizerPickerQualificationReferenceId)
          .then(() => self.renderAuthorizerList());
      }
    });

    this.domElement.querySelector('#authorizer-save-btn')?.addEventListener('click', () => {
      const ai = self.domElement.querySelector('#qd-authorizer') as HTMLInputElement;
      if (ai) {
        ai.value = self.selectedAuthorizerTemps.map(a => a.name).join(', ');
      }
      self.closeThenOpenModal('selectAuthorizerModal', 'qualificationDetailsModal');
    });

    this.domElement.querySelector('#authorizer-cancel-btn')?.addEventListener('click', () => {
      self.closeThenOpenModal('selectAuthorizerModal', 'qualificationDetailsModal');
    });

    this.domElement.querySelector('#select-authorizer-close-btn')?.addEventListener('click', () => {
      self.closeThenOpenModal('selectAuthorizerModal', 'qualificationDetailsModal');
    });

    this.domElement.querySelectorAll('.withdraw-back-btn').forEach(btn =>
      btn.addEventListener('click', () => this.closeModal('withdrawDetailsModal'))
    );
    const authorizerListEl = this.domElement.querySelector('#authorizer-list') as HTMLElement;
    const authScrollContainer = authorizerListEl
      ? ((authorizerListEl.closest('.modal-body') as HTMLElement) || authorizerListEl)
      : null;
    if (authScrollContainer) {
      authScrollContainer.addEventListener('scroll', () => {
        const pag = self.authorizerListPagination;
        if (!pag || pag.loading || pag.hasMore === false || self._authorizerListLoadingMore) return;
        const nearBottom = (authScrollContainer.scrollTop + authScrollContainer.clientHeight)
          >= (authScrollContainer.scrollHeight - 80);
        if (!nearBottom) return;

        self._authorizerListLoadingMore = true;
        self.showAuthorizerListLoadingMore();
        self.loadAuthorizerOptionsNextPage()
          .then(() => self.renderAuthorizerList(true))
          .catch(() => self.hideAuthorizerListLoadingMore())
          .then(() => { self._authorizerListLoadingMore = false; });
      });

    }
  }

  // ── Calendar (jQuery UI Datepicker — same as My Qualifications) ──────────
  // jquery-ui.js is loaded in onInit(); wait for $.fn.datepicker before binding.
  private initDatepickers(): void {
    const $ = (window as any).$;
    if (!$ || typeof $.fn.datepicker === 'undefined') {
      let retries = 0;
      const iv = setInterval(() => {
        retries++;
        const jq = (window as any).$;
        if (jq && typeof jq.fn.datepicker !== 'undefined') {
          clearInterval(iv);
          this.bindDatepickers();
        } else if (retries >= 10) {
          clearInterval(iv);
        }
      }, 200);
      return;
    }
    this.bindDatepickers();
  }

  private bindDatepickers(): void {
    const $ = (window as any).$;
    const self = this;
    const $target = $(this.domElement).find('#targetAchieveDate');
    if (!$target.length) return;
    if ($target.hasClass('hasDatepicker')) $target.datepicker('destroy');
    $target.datepicker({
      dateFormat: 'yy-mm-dd',
      minDate: 0,
      beforeShow: function (input: HTMLInputElement, inst: any) {
        // Field is locked (pointer-events:none) outside the pending view — don't open on keyboard focus
        if (input.style.pointerEvents === 'none') return false;
        $(inst.dpDiv).addClass('nemko-input-datepicker');
        self.repositionDatepicker(input);
        return {};
      },
    });
  }

  // Mirrors nemkoRepositionDatepicker() in my-qualifications.js: jQuery UI's
  // built-in positioning miscalculates inside scrollable modal bodies.
  private repositionDatepicker(input: HTMLInputElement): void {
    const $ = (window as any).$;
    setTimeout(() => {
      const $picker = $('#ui-datepicker-div');
      if (!$picker.length || !$picker.is(':visible')) return;

      const rect = input.getBoundingClientRect();
      const pickerHeight = $picker.outerHeight();
      const pickerWidth = $picker.outerWidth();
      const gap = 4;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openAbove = spaceBelow < pickerHeight + gap && spaceAbove > spaceBelow;

      let top = openAbove ? rect.top - pickerHeight - gap : rect.bottom + gap;
      top = Math.max(0, Math.min(top, window.innerHeight - pickerHeight));
      const left = Math.max(0, Math.min(rect.left, window.innerWidth - pickerWidth));

      $picker.css({ position: 'fixed', top: top + 'px', left: left + 'px', zIndex: 20000 });
    }, 0);
  }

  // ── Utility ────────────────────────────────────────────────────────────────
  // Shows/hides an entire row (e.g. Withdrawn by) — separate from
  // setToggleField because this field is a plain readonly input, not a
  // textarea/paragraph pair, and setModalField already falls back to '—'
  // when the value is empty.
  private setRowVisibility(rowId: string, show: boolean): void {
    const row = this.domElement.querySelector('#' + rowId) as HTMLElement;
    if (row) row.style.setProperty('display', show ? 'flex' : 'none', 'important');
  }

  // Toggles a field between its textarea and its readonly "—" paragraph —
  // mirrors nemkoSetToggleField() in my-qualifications.js.
  // - Editable fields: always show the textarea.
  // - Non-editable (readonly) fields: empty value -> show the <p> ("—"),
  //   non-empty value -> show the textarea (so long content stays scrollable).
  private setToggleField(
    textareaId: string,
    paraId: string,
    val: string,
    isEditable: boolean,
    rowId?: string
  ): void {
    const textarea = this.domElement.querySelector('#' + textareaId) as HTMLTextAreaElement | null;
    const para = this.domElement.querySelector('#' + paraId) as HTMLElement | null;
    const row = rowId ? (this.domElement.querySelector('#' + rowId) as HTMLElement | null) : null;
    const value = val || '';

    if (textarea) textarea.value = value;
    if (row) row.style.setProperty('border-bottom', 'none', 'important');
    if (!para) return;

    if (isEditable) {
      if (textarea) textarea.style.display = '';
      para.style.display = 'none';
      row?.classList.remove('frm-readonly-row');
      return;
    }

    const isEmpty = !String(value).trim();
    if (isEmpty) {
      para.textContent = '—';
      para.style.display = '';
      para.classList.remove('form-control', 'h-px-98', 'overflow-auto', 'custom-scroll-view');
      para.style.border = 'none';
      para.style.borderRadius = '0';
      para.style.setProperty('border-bottom', '1px solid #ced4da', 'important');
      para.style.background = 'transparent';
      para.style.padding = '2px 0';
      para.style.height = 'auto';
      if (textarea) textarea.style.display = 'none';
      row?.classList.add('frm-readonly-row');
    } else {
      para.classList.add('form-control', 'h-px-98', 'overflow-auto', 'custom-scroll-view');
      para.removeAttribute('style');
      para.style.display = 'none';
      if (textarea) textarea.style.display = '';
      // row?.classList.remove('frm-readonly-row');
    }
  }

private setModalField(fieldId: string, value: string): void {
  const el = this.domElement.querySelector('#' + fieldId) as HTMLElement;
  if (!el) return;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') {
    (el as HTMLInputElement | HTMLTextAreaElement).value = value || '—';
  } else {
    el.textContent = value || '—';
  }
}
// New: for the readonly "box" paragraphs (Remarks, Limitations, Final
// Limitations, Withdrawn reason). Collapses to a plain dash + underline
// when empty, instead of showing the full-height empty box.
private setReadonlyTextBox(fieldId: string, value: string): void {
  const el = this.domElement.querySelector('#' + fieldId) as HTMLElement;
  if (!el) return;
  const trimmed = (value || '').trim();
  const isEmpty = !trimmed || trimmed === '-' || trimmed === '—';

  el.textContent = isEmpty ? '—' : trimmed;

  if (isEmpty) {
    el.classList.remove('form-control', 'h-px-98', 'overflow-auto', 'custom-scroll-view');
    el.setAttribute('style', 'border:none;border-radius:0;border-bottom:1px solid #ced4da;background:transparent;padding:2px 0;height:auto;');
  } else {
    el.classList.add('form-control', 'h-px-98', 'overflow-auto', 'custom-scroll-view');
    el.removeAttribute('style');
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
    el.classList.remove('show');
    el.style.display = 'none';
    document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
    document.body.classList.remove('modal-open');
  }

  // Close one modal and only open the next once the first has fully finished
  // its hide transition (waits for hidden.bs.modal) — same handoff pattern
  // my-qualifications.js uses when moving between modals, so two backdrops
  // never end up stacked on top of each other.
  private closeThenOpenModal(closeId: string, openId: string): void {
    const current = this.domElement.querySelector('#' + closeId) as HTMLElement;
    if (!current) { this.openModal(openId); return; }
    current.addEventListener('hidden.bs.modal', () => this.openModal(openId), { once: true });
    this.closeModal(closeId);
  }

  private findRow<T>(rows: T[], predicate: (row: T) => boolean): T | undefined {
    for (let i = 0; i < rows.length; i++) {
      if (predicate(rows[i])) { return rows[i]; }
    }
    return undefined;
  }

  private readonly _authorizerCache = new Map<string, Array<{ id: number; name: string; email: string }>>();
  /** typeId/level of whichever authorizer picker is currently open, so a keystroke
   *  in the search box knows what to re-query. */
  private authorizerPickerTypeId: number = 0;
  private authorizerPickerLevel: number = 0;
  private authorizerPickerQualId: number = 0;
  private authorizerPickerQualificationReferenceId: number = 0;
  private authorizerListPagination: { page: number; hasMore: boolean; loading: boolean } = { page: 1, hasMore: true, loading: false };
  private _authorizerListLoadingMore: boolean = false;
  private _authorizerSearchTimer: any = null;

  /** Standard dynamic-loading pattern (mirrors WpMyQualificationsWebPart.fetchAuthorizers):
   *  fetches ONE page from /api/reference-data/authorizer-list, optionally filtered
   *  server-side via `search`. No longer loops every page up front. */
  private async loadAuthorizerOptionsFromApi(
    qualificationTypeId: number,
    qualificationLevel: number,
    search: string = '',
    qualificationId?: number,
    qualificationReferenceId?: number,
    page: number = 1
  ): Promise<void> {
    if (!this.apiClient) return;
    const cacheKey = `${qualificationTypeId}_${qualificationLevel}_${qualificationReferenceId ?? 0}`;
    const append = page > 1;

    if (!append && !search && this._authorizerCache.has(cacheKey)) {
      this.authorizerOptions = this._authorizerCache.get(cacheKey) || [];
      this.authorizerListPagination = { page: 1, hasMore: false, loading: false };
      return;
    }

    this.authorizerListPagination = { page, hasMore: true, loading: true };

    try {
      const qs = new URLSearchParams();
      qs.set('qualificationType', String(qualificationTypeId));
      qs.set('qualificationLevel', String(qualificationLevel));
      if (qualificationReferenceId && qualificationReferenceId > 0) qs.set('qualificationReference', String(qualificationReferenceId));
      qs.set('isVerifier', 'true');
      qs.set('page', String(page));
      if (search) qs.set('search', search);
      if (qualificationId && qualificationId > 0) qs.set('qualificationId', String(qualificationId));
      else console.warn('[NEMKO] loadAuthorizerOptionsFromApi called without a qualificationId');

      const url = `${API_BASE_URL}/api/reference-data/authorizer-list?${qs.toString()}`;
      console.log('[NEMKO] Loading authorizer list:', url);
      const response = await this.apiClient.get(url, AadHttpClient.configurations.v1);

      if (!response.ok) {
        console.warn('[NEMKO] authorizer-list endpoint returned', response.status);
        if (!append) this.authorizerOptions = [];
        this.authorizerListPagination = { page, hasMore: false, loading: false };
        return;
      }

      const raw = await response.json();
      const obj = raw as any;
      const items: any[] = Array.isArray(raw)
        ? raw
        : Array.isArray(obj?.items) ? obj.items
          : Array.isArray(obj?.data?.items) ? obj.data.items
            : Array.isArray(obj?.data) ? obj.data
              : [];

      const newOptions = items.map((e: any) => ({
        id: e.id ?? e.employeeId ?? 0,
        name: e.name ?? e.employeeName ?? e.fullName ?? '',
        email: e.email ?? e.emailAddress ?? ''
      })).filter(e => e.name);

      // ← key difference vs. the old version: concat instead of replace on page > 1
      this.authorizerOptions = append ? this.authorizerOptions.concat(newOptions) : newOptions;

      const hasMore = (obj?.data?.pagination?.hasMore === true) || (obj?.pagination?.hasMore === true);
      this.authorizerListPagination = { page, hasMore, loading: false };

      if (!search && !hasMore) {
        this._authorizerCache.set(cacheKey, this.authorizerOptions);
      }
    } catch (err) {
      console.warn('[NEMKO] Could not load authorizer options:', err);
      if (!append) this.authorizerOptions = [];
      this.authorizerListPagination = { page, hasMore: false, loading: false };
    }
  }

  private async loadAuthorizerOptionsNextPage(): Promise<void> {
    const pag = this.authorizerListPagination;
    if (!pag || pag.loading || pag.hasMore === false) return;
    const nextPage = (pag.page ?? 1) + 1;
    const searchInput = this.domElement.querySelector('#authorizer-search-input') as HTMLInputElement;
    await this.loadAuthorizerOptionsFromApi(
      this.authorizerPickerTypeId,
      this.authorizerPickerLevel,
      searchInput ? searchInput.value : '',
      this.authorizerPickerQualId,
      this.authorizerPickerQualificationReferenceId,
      nextPage
    );
  }

  private addAudit(action: string, employee: string, qualification: string): void {
    const entry: IAuditEntry = {
      timestamp: new Date().toLocaleString(),
      userId: this.currentUserEmail || 'Current User',
      action,
      targets: qualification ? `${employee} — ${qualification}` : employee
    };
    this.auditLog.unshift(entry);
    const el = this.domElement.querySelector('#audit-trail') as HTMLElement;
    if (el && this.auditLog[0]) {
      const l = this.auditLog[0];
      el.textContent = `Last action: [${l.timestamp}] ${l.userId} — ${l.action}: ${l.targets}`;
    }
  }

  private getCheckedRowIndexes(tbody: Element): number[] {
    const indexes: number[] = [];
    tbody.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((cb, i) => {
      if (cb.checked) indexes.push(i);
    });
    return indexes;
  }

  // ── SPFx Boilerplate ───────────────────────────────────────────────────────
  protected get dataVersion(): Version { return Version.parse('1.0'); }

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
