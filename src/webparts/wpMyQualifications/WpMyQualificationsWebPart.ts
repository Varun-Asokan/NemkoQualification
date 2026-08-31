import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { AadHttpClient } from '@microsoft/sp-http';
import MyQualifications from './MyQualificationsUi';
import * as strings from 'WpMyQualificationsWebPartStrings';
import { SPComponentLoader } from '@microsoft/sp-loader';
import SharedSidebar from '../../SharedSidebar';

export interface IWpMyQualificationsWebPartProps {
  description: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert boolean (or 'true'/'yes' strings) → 'Yes' / 'No' */
function boolToYesNo(val: any): string {
  if (val === true || String(val).toLowerCase() === 'true' || String(val).toLowerCase() === 'yes') return 'Yes';
  return 'No';
}

/** Format an ISO date string → 'dd-mm-yyyy', or return '' */
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = dateStr.split('T')[0].split('-');
  return d.length === 3 ? `${d[2]}-${d[1]}-${d[0]}` : dateStr;
}

/**
 * Reads the first non-empty value found under any of the given key names.
 * Used defensively for fields whose exact casing/name coming back from the
 * API has been inconsistent (e.g. verifier/authorizer limitations), so a
 * naming mismatch doesn't silently leave the field blank in the UI.
 */
function pickField(item: any, keys: string[]): string {
  if (!item) return '';
  for (const key of keys) {
    const val = item[key];
    if (val !== undefined && val !== null && val !== '') return val;
  }
  return '';
}

/**
 * Defensive server-side-of-the-client safety net matching the 500-word cap
 * already enforced live on the Remarks/Limitations textareas in
 * my-qualifications.js — guards against the payload exceeding the limit if
 * that live enforcement is ever bypassed (e.g. pasted text before JS runs).
 */
function truncateToWordLimit(text: string, maxWords: number = 500): string {
  if (!text) return text;
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ');
}

/**
 * Map the API's qualificationTypeId.name → the internal type key used by the UI.
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
 * Map a qualification level name from the API → the internal radio value key used by the UI.
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

// ─── WebPart ──────────────────────────────────────────────────────────────────

export default class WpMyQualificationsWebPart extends BaseClientSideWebPart<IWpMyQualificationsWebPartProps> {
  private siteUrl: string = '';
  private apiClient!: AadHttpClient;
  private _popstateHandler: (() => void) | null = null;
  private _initFailed = false;
  private readonly _fetchVersions = new Map<string, number>();

  // Last successful payload for each table, kept in memory for the life of
  // this webpart instance. Used to paint the tables instantly on a
  // soft-navigation re-render (SharePoint popstate, tab-away-and-back) while
  // the real fetch runs silently in the background, instead of blanking the
  // table back to a loading state every single time.
  private _lastAuthorizedRows: any[] | null = null;
  private _lastAuthorizedPagination: any = null;
  private _lastRequestedRows: any[] | null = null;
  private _lastRequestedPagination: any = null;

  public render(): void {
    const resourceUrl = `${this.siteUrl}/SiteAssets`;

    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const activeTabId = tabParam === 'requested' ? 'requested-table' : 'authorized-table';

    this.domElement.innerHTML =
      SharedSidebar.getHtml({
        resourceUrl,
        siteUrl: this.siteUrl,
        activeNavItem: 'my-qualifications',
        activeTabId,
      }) +
      MyQualifications.allElementsHtml.replace(/__KEY_URL_RESOURCE__/g, resourceUrl);

    SharedSidebar.initBehavior(this.domElement, this.siteUrl);
    this.bindQualificationEvents();

    // The toolbar (tab buttons, Add Qualification) and filter controls are
    // painted here immediately, but nothing behind them works until
    // my-qualifications.js has finished loading AND (for tab-switching
    // specifically) the qualification data has arrived — initTabSwitch()/
    // initAuthorizedServerFilters()/initRequestedServerFilters() only run
    // inside initMyQualifications(), at the end of loadHomeScripts() below.
    // On a hard refresh / slow connection there's a real window where a click
    // here does nothing (or, for the Add Qualification modal, opens it with
    // nothing populated). Disabling now and re-enabling once everything is
    // ready closes that window instead of leaving broken-looking controls
    // clickable.
    this.setControlsBusy(true);

    this.loadHomeScripts();
  }

  protected async onInit(): Promise<void> {
    this.siteUrl = this.context.pageContext.web.absoluteUrl;
    this.loadCSS();
    this.preconnectToApi();

    this._popstateHandler = () => {
      // popstate fires on SharePoint's client-side "soft" back/forward
      // navigation, which re-renders this webpart WITHOUT onInit() running
      // again — so this.apiClient would otherwise just be whatever was
      // acquired when the page was first loaded, however long ago that was.
      // AadHttpClient is supposed to silently refresh its own token per
      // request, but after a long idle period that silent refresh can be
      // slow or fail quietly (stale session cookies, third-party-cookie
      // restrictions, etc.) — so re-acquire the client here rather than
      // trust one that may have been sitting idle. initApiClient() has its
      // own retry/backoff and always resolves (never rejects), so this is
      // safe to await before rendering.
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

  // ── Shared GET-with-retry helper ─────────────────────────────────────────────
  // A non-2xx response or thrown error is retried with a linearly increasing
  // delay before giving up, instead of silently surfacing as "no records" on
  // the first attempt. The previous fixed 2-retry/800ms window (~1.6s of
  // buffer) was only really enough for a brief network blip — it wasn't
  // enough to cover a genuinely slow silent AAD token refresh (common after
  // a long idle period / SPA back-navigation) or a cold Mendix API instance
  // waking up, both of which can easily take several seconds. This widens
  // the buffer to ~7s across 3 retries so those slower-but-still-legitimate
  // cases have a real chance to succeed before giving up. Throws once
  // retries are exhausted so callers can tell a genuine failure apart from
  // a legitimately empty result set.
  private async getJsonWithRetry(
    url: string,
    retries: number = 3,
    baseDelayMs: number = 1200,
    perAttemptTimeoutMs: number = 8000
  ): Promise<any> {
    let lastErr: any = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Raced against a timer rather than relying on AadHttpClient/fetch
        // to forward an AbortSignal (not guaranteed across SPFx versions).
        // Without this, a request into a cold-starting App Service instance
        // or a silently-stalled AAD token refresh can hang well past what
        // any reasonable retry budget should allow. Racing guarantees every
        // attempt — success, failure, or hang — resolves within a bounded
        // time, so the retry loop's own backoff schedule is the only thing
        // controlling total wait time. Note: this does NOT cancel the
        // underlying network request (the browser will still complete it),
        // it just stops waiting on it so the retry loop can move on.
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
        // Linear backoff: 1.2s, 2.4s, 3.6s — gives a slow token refresh or
        // cold-starting API progressively more room on each retry.
        await new Promise(resolve => setTimeout(resolve, baseDelayMs * (attempt + 1)));
      }
    }
    throw lastErr;
  }

  // ── Authorized Table ────────────────────────────────────────────────────────
  /**
   * GET /api/qualifications/authorized
   * Response: { data: [ QualificationItem ] }  ← plain array, NO .items wrapper
   */
  private async fetchQualifications(page: number = 1, filters?: {
    status?: boolean | null;
    conformityStatement?: boolean | null;
    certificationDecision?: boolean | null;
    qualificationLevel?: number | null;
    reportApprover?: boolean | null;
    qualificationType?: string | null;
    search?: string;
    operator?: string;
    sortBy?: string | null;
    sortOrder?: string | null;
  }): Promise<void> {
    const qs = new URLSearchParams();
    qs.set('page', String(page));
    if (filters) {
      if (filters.status !== null && filters.status !== undefined)               qs.set('status',               String(filters.status));
      if (filters.conformityStatement !== null && filters.conformityStatement !== undefined) qs.set('conformityStatement', String(filters.conformityStatement));
      if (filters.certificationDecision !== null && filters.certificationDecision !== undefined) qs.set('certificationDecision', String(filters.certificationDecision));
      if (filters.qualificationLevel !== null && filters.qualificationLevel !== undefined) qs.set('qualificationLevel', String(filters.qualificationLevel));
      if (filters.reportApprover !== null && filters.reportApprover !== undefined) qs.set('reportApprover',       String(filters.reportApprover));
      if (filters.qualificationType)                                             qs.set('qualificationType',    filters.qualificationType);
      if (filters.search)                                                        qs.set('search',               filters.search);
      if (filters.operator)                                                      qs.set('operator',             filters.operator);
      if (filters.sortBy)                                                        qs.set('sortBy',               filters.sortBy);
      if (filters.sortOrder)                                                     qs.set('sortOrder',            filters.sortOrder);
    }
    const apiUrl = `${API_BASE}/api/qualification/authorized?${qs.toString()}`;
    const isDefaultView = page === 1 && !filters;

    if (!this.apiClient) {
      // No cached data to fall back on if the client itself never initialised.
      (window as any).nemkoTableRows       = this._lastAuthorizedRows ?? [];
      (window as any).nemkoTablePagination = this._lastAuthorizedPagination ?? null;
      (window as any).nemkoTableLoadError  = this._lastAuthorizedRows === null;
      return;
    }

    // Stale-while-revalidate: only applies to the default (page 1,
    // no filters) view, since that's the one shown immediately on
    // render() before the user has interacted with anything. Paint the
    // last good rows right away so a soft-nav re-render doesn't blank the
    // table while the network call below re-validates in the background.
    if (isDefaultView && this._lastAuthorizedRows) {
      (window as any).nemkoTableRows       = this._lastAuthorizedRows;
      (window as any).nemkoTablePagination = this._lastAuthorizedPagination;
      (window as any).nemkoTableLoadError  = false;
    }

    try {
      const json = await this.getJsonWithRetry(apiUrl);

      const data  = json?.data;
      const items: any[] = Array.isArray(data) ? data : (data?.items ?? []);
      const pagination = Array.isArray(data) ? (json?.pagination ?? null) : (data?.pagination ?? null);
      const rows = items.map((item: any) => this.mapAuthorizedRow(item));

      (window as any).nemkoTablePagination = pagination;
      (window as any).nemkoTableRows = rows;
      (window as any).nemkoTableLoadError = false;

      if (isDefaultView) {
        this._lastAuthorizedRows = rows;
        this._lastAuthorizedPagination = pagination;
      }
    } catch (err) {
      console.error('[NEMKO] fetchQualifications failed after retries:', err);
      // If we already painted stale-but-good data above, leave it on screen
      // rather than clearing the table out from under the user on a
      // transient failure — only show the hard error state when we truly
      // have nothing to show.
      if (!(isDefaultView && this._lastAuthorizedRows)) {
        (window as any).nemkoTableRows       = [];
        (window as any).nemkoTablePagination = null;
        (window as any).nemkoTableLoadError  = true;
      }
    }
  }

  /** Map a raw authorized-API item → the row object the JS table expects */
  private mapAuthorizedRow(item: any): object {
    const verifierNames   = Array.isArray(item.verifier)   ? item.verifier.map((v: any) => v.name).join(', ')           : '';
    const authorizerNames = Array.isArray(item.authorizer) ? item.authorizer.map((a: any) => a.name).join(', ')         : '';
    const verifierIds     = Array.isArray(item.verifier)   ? item.verifier.map((v: any) => v.employeeId).join(',')      : '';
    const authorizerIds   = Array.isArray(item.authorizer) ? item.authorizer.map((a: any) => a.employeeId).join(',')    : '';

    return {
      id:               String(item.qualificationId ?? ''),
      qualifications:   item.qualificationReference?.name ?? '',
      qualificationTypeName: item.qualificationTypeId?.name ?? '',
      level:            item.qualificationLevel?.name      ?? '',
      verifiedBy:       verifierNames,
      
      active:           boolToYesNo(item.qualificationStatus.isActive),
      limitations:      item.limitations  ?? '',
      report:           boolToYesNo(item.reportApprover),
      certification:    boolToYesNo(item.certificationDecision),
      
      conformity:       boolToYesNo(item.confirmityStatement ?? item.conformityStatement),
      remarks:          item.remarks      ?? '',
      targetDate:       formatDate(item.targetAchieveDate),
      qualifiedDate:    item.qualifiedDate ?? "",   
      authorizedBy:     authorizerNames,
      verifierIds,
      authorizerIds,
      qualificationType:    mapTypeName(item.qualificationTypeId?.name),
      qualificationTypeIdNum: item.qualificationTypeId?.qualificationTypeId ?? '',
      qualificationReferenceId: item.qualificationReference?.qualificationReferenceId ?? '',
      qualificationLevelId: item.qualificationLevel?.qualificationLevelId ?? '',
      withdrawn:        item.withdrawn ?? false,
      qualificationStatusName: item.qualificationStatus?.name ?? '',
      actions:          'Update'
    };
  }

  // ── Requested Table ─────────────────────────────────────────────────────────
  /**
   * GET /api/qualifications/requested
   * Response: { data: { items: [ QualificationItem ], pagination: {...} } }
   */
  private async fetchRequestedQualifications(page: number = 1, filters?: {
    status?: boolean | null;
    conformityStatement?: boolean | null;
    certificationDecision?: boolean | null;
    qualificationLevel?: number | null;
    reportApprover?: boolean | null;
    qualificationType?: string | null;
    search?: string;
    operator?: string;
    sortBy?: string | null;
    sortOrder?: string | null;
  }): Promise<void> {
    const qs = new URLSearchParams();
    qs.set('page', String(page));
    if (filters) {
      if (filters.status !== null && filters.status !== undefined)               qs.set('status',               String(filters.status));
      if (filters.conformityStatement !== null && filters.conformityStatement !== undefined) qs.set('conformityStatement', String(filters.conformityStatement));
      if (filters.certificationDecision !== null && filters.certificationDecision !== undefined) qs.set('certificationDecision', String(filters.certificationDecision));
      if (filters.qualificationLevel !== null && filters.qualificationLevel !== undefined) qs.set('qualificationLevel', String(filters.qualificationLevel));
      if (filters.reportApprover !== null && filters.reportApprover !== undefined) qs.set('reportApprover',       String(filters.reportApprover));
      if (filters.qualificationType)                                             qs.set('qualificationType',    filters.qualificationType);
      if (filters.search)                                                        qs.set('search',               filters.search);
      if (filters.operator)                                                      qs.set('operator',             filters.operator);
      if (filters.sortBy)                                                        qs.set('sortBy',               filters.sortBy);
      if (filters.sortOrder)                                                     qs.set('sortOrder',            filters.sortOrder);
    }
    const apiUrl = `${API_BASE}/api/qualification/requested?${qs.toString()}`;
    const isDefaultView = page === 1 && !filters;

    if (!this.apiClient) {
      (window as any).nemkoRequestedRows       = this._lastRequestedRows ?? [];
      (window as any).nemkoRequestedPagination = this._lastRequestedPagination ?? null;
      (window as any).nemkoRequestedLoadError  = this._lastRequestedRows === null;
      return;
    }

    // Same stale-while-revalidate treatment as fetchQualifications() above.
    if (isDefaultView && this._lastRequestedRows) {
      (window as any).nemkoRequestedRows       = this._lastRequestedRows;
      (window as any).nemkoRequestedPagination = this._lastRequestedPagination;
      (window as any).nemkoRequestedLoadError  = false;
    }

    try {
      const json = await this.getJsonWithRetry(apiUrl);

      const items: any[] = json?.data?.items ?? [];
      const pagination = json?.data?.pagination ?? null;
      const rows = items.map((item: any) => this.mapRequestedRow(item));

      (window as any).nemkoRequestedPagination = pagination;
      (window as any).nemkoRequestedRows = rows;
      (window as any).nemkoRequestedLoadError = false;

      if (isDefaultView) {
        this._lastRequestedRows = rows;
        this._lastRequestedPagination = pagination;
      }
    } catch (err) {
      console.error('[NEMKO] fetchRequestedQualifications failed after retries:', err);
      if (!(isDefaultView && this._lastRequestedRows)) {
        (window as any).nemkoRequestedRows       = [];
        (window as any).nemkoRequestedPagination = null;
        (window as any).nemkoRequestedLoadError  = true;
      }
    }
  }

  /** Map a raw requested-API item → the row object the JS table expects */
  private mapRequestedRow(item: any): object {
    const verifierNames   = Array.isArray(item.verifier)   ? item.verifier.map((v: any) => v.name).join(', ')        : '';
    const authorizerNames = Array.isArray(item.authorizer) ? item.authorizer.map((a: any) => a.name).join(', ')      : '';
    const verifierIds     = Array.isArray(item.verifier)   ? item.verifier.map((v: any) => v.employeeId).join(',')   : '';
    const authorizerIds   = Array.isArray(item.authorizer) ? item.authorizer.map((a: any) => a.employeeId).join(',') : '';

    return {
      id:               String(item.qualificationId ?? ''),
      qualifications:   item.qualificationReference?.name ?? '',
      qualificationTypeName: item.qualificationTypeId?.name ?? '',
      level:            item.qualificationLevel?.name      ?? '',
      verifiedBy:       verifierNames,
      rejectedDate:     item.rejectedDate,
      active:           boolToYesNo(item.qualificationStatus?.isActive),
      report:           boolToYesNo(item.reportApprover),
      certification:    boolToYesNo(item.certificationDecision),
      conformity:       boolToYesNo(item.confirmityStatement ?? item.conformityStatement),
      remarks:          item.remarks     ?? '',
      limitations:      item.limitations ?? '',
      verifierLimitations:   pickField(item, ['verifierLimitations', 'VerifierLimitations', 'verifierLimitation']),
      authorizerLimitations: pickField(item, ['authorizerLimitations', 'AuthorizerLimitations', 'authorizerLimitation']),
      rejectionComment: item.rejectReason ?? '',
      targetDate:       formatDate(item.targetAchieveDate),
      qualifiedDate:    item.qualifiedDate ?? "",
      authorizedBy:     authorizerNames,
      verifierIds,
      authorizerIds,
      qualificationType:    mapTypeName(item.qualificationTypeId?.name),
      qualificationTypeIdNum: item.qualificationTypeId?.qualificationTypeId ?? '',
      qualificationReferenceId: item.qualificationReference?.qualificationReferenceId ?? '',
      qualificationLevelId: item.qualificationLevel?.qualificationLevelId ?? '',
      withdrawn:        item.withdrawn ?? false,
      qualificationStatusName: item.qualificationStatus?.name ?? '',
      actions:          'Edit',
    };
  }

  // ── Details Modal ───────────────────────────────────────────────────────────
  /**
   * GET /api/qualification/{id}   ← NOTE: singular "qualification", not plural
   *
   * Called on demand when "View Details" is clicked.
   * Normalises the raw API response into the shape the JS populate() function expects.
   */
  private async fetchQualificationDetails(id: string): Promise<void> {
    const apiUrl = `${API_BASE}/api/qualification/${id}`;



    if (!this.apiClient) {
      (window as any).nemkoQualificationDetail = null;
      return;
    }

    try {
      const response = await this.apiClient.get(apiUrl, AadHttpClient.configurations.v1);
      if (!response.ok) {
        console.warn('[NEMKO] fetchQualificationDetails non-ok:', response.status, 'id:', id);
        (window as any).nemkoQualificationDetail = null;
        return;
      }
      const json = await response.json();
      const raw = json?.data ?? null;
      (window as any).nemkoQualificationDetail = raw ? this.normaliseDetailShape(raw) : null;
    } catch (err) {
      console.error('[NEMKO] fetchQualificationDetails error:', err);
      (window as any).nemkoQualificationDetail = null;
    }
  }

  // ── Edit Modal (populated from GET /api/qualification/{id}, same as Details) ─
  /**
   * GET /api/qualification/{id}
   * Called on demand when "Edit/Update" is clicked, so the edit modal is always
   * populated with fresh data instead of the (possibly stale) cached table row.
   */
  private async fetchQualificationForEdit(id: string): Promise<void> {
    const apiUrl = `${API_BASE}/api/qualification/${id}`;

    if (!this.apiClient) {
      (window as any).nemkoQualificationEditDetail = null;
      return;
    }

    try {
      const response = await this.apiClient.get(apiUrl, AadHttpClient.configurations.v1);
      if (!response.ok) {
        console.warn('[NEMKO] fetchQualificationForEdit non-ok:', response.status, 'id:', id);
        (window as any).nemkoQualificationEditDetail = null;
        return;
      }
      const json = await response.json();
      const raw = json?.data ?? null;
      (window as any).nemkoQualificationEditDetail = raw ? this.mapQualificationToEditRow(raw) : null;
    } catch (err) {
      console.error('[NEMKO] fetchQualificationForEdit error:', err);
      (window as any).nemkoQualificationEditDetail = null;
    }
  }

  /** Map a raw /api/qualification/{id} item → the same row shape populateEditModal() expects */
  private mapQualificationToEditRow(item: any): object {
    const verifierNames   = Array.isArray(item.verifier)   ? item.verifier.map((v: any) => v.name).join(', ')        : '';
    const authorizerNames = Array.isArray(item.authorizer) ? item.authorizer.map((a: any) => a.name).join(', ')      : '';
    const verifierIds     = Array.isArray(item.verifier)   ? item.verifier.map((v: any) => v.employeeId).join(',')   : '';
    const authorizerIds   = Array.isArray(item.authorizer) ? item.authorizer.map((a: any) => a.employeeId).join(',') : '';

    return {
      id:               String(item.qualificationId ?? ''),
      qualifications:   item.qualificationReference?.name ?? '',
      level:            item.qualificationLevel?.name      ?? '',
      verifiedBy:       verifierNames,
      report:           boolToYesNo(item.reportApprover),
      certification:    boolToYesNo(item.certificationDecision),
      conformity:       boolToYesNo(item.confirmityStatement ?? item.conformityStatement),
      remarks:          item.remarks      ?? '',
      limitations:      item.limitations  ?? '',
      verifierLimitations:   pickField(item, ['verifierLimitations', 'VerifierLimitations', 'verifierLimitation']),
      authorizerLimitations: pickField(item, ['authorizerLimitations', 'AuthorizerLimitations', 'authorizerLimitation']),
      rejectionComment: item.rejectReason ?? '',
      targetDate:       formatDate(item.targetAchieveDate),
      qualifiedDate:    item.qualifiedDate ?? '',
      authorizedBy:     authorizerNames,
      verifierIds,
      authorizerIds,
      qualificationType:        mapTypeName(item.qualificationTypeId?.name),
      qualificationTypeIdNum:   item.qualificationTypeId?.qualificationTypeId ?? '',
      qualificationReferenceId: item.qualificationReference?.qualificationReferenceId ?? '',
      qualificationLevelId:     item.qualificationLevel?.qualificationLevelId ?? '',
      withdrawn:                item.withdrawn ?? false,
      qualificationStatusName:  item.qualificationStatus?.name ?? '',
    };
  }

  private normaliseDetailShape(item: any): object {
    const appliedBy  = item.appliedBy ?? {};
    const statusName: string = item.qualificationStatus?.name ?? '';
    const isActive   = item.qualificationStatus?.isActive;

    const verifierNames   = Array.isArray(item.verifier)   ? item.verifier.map((v: any) => v.name).join(', ')   : '';
    const authorizerNames = Array.isArray(item.authorizer) ? item.authorizer.map((v: any) => v.name).join(', ') : '';
    const verifierEmail   = Array.isArray(item.verifier)   ? (item.verifier[0]?.email   ?? '') : '';
    const authorizerEmail = Array.isArray(item.authorizer) ? (item.authorizer[0]?.email ?? '') : '';

    return {
      qualificationId:        item.qualificationId ?? '',
      requestedBy:            appliedBy.name  ?? '',
      requestedByEmail:       appliedBy.email ?? '',
      localUnit:              item.localUnit ?? '',
      qualificationStatus:    { value: statusName },
      activeStatus:           { value: isActive === true ? 'Yes' : isActive === false ? 'No' : '' },
      verifiedBy:             { name: verifierNames,   email: verifierEmail },
      authorizedBy:           { name: authorizerNames, email: authorizerEmail },
      authorizedDate:         item.qualifiedDate ?? '',
      targetAchieveDate:      item.targetAchieveDate ?? '',
      qualificationReference: { value: item.qualificationReference?.name ?? '' },
      level:                  { value: item.qualificationLevel?.name      ?? '' },
      conformityStatement:    (item.confirmityStatement ?? item.conformityStatement) === true ? 'Yes' : 'No',
      certificationDecision:  item.certificationDecision === true ? 'Yes' : 'No',
      reportApprover:         item.reportApprover === true ? 'Yes' : 'No',
      remarks:                item.remarks     ?? '',
      limitations:            item.limitations ?? '',
      verifierLimitations:    pickField(item, ['verifierLimitations', 'VerifierLimitations', 'verifierLimitation']),
      authorizerLimitations:  pickField(item, ['authorizerLimitations', 'AuthorizerLimitations', 'authorizerLimitation']),
      rejectionComment:       item.rejectReason ?? '',
      type:                   item.qualificationTypeId?.name ?? '',
      withdrawn:              item.withdrawn ?? false,
    };
  }



  // ── Add (Add Qualification Modal submit) ───────────────────────────────────
  /**
   * POST /api/qualification
   * Reads the Add Qualification modal form, resolves employee IDs from
   * window.nemkoEmployeeItems, and posts the full payload the API expects.
   */
  private async addQualification(): Promise<void> {
    const apiUrl = `${API_BASE}/api/qualification`;

    if (!this.apiClient) {
      alert('error invalid api');
      return;
    }

    const qualTypeEl     = this.domElement.querySelector('#qualifcationTypeList')                    as HTMLSelectElement;
    const standardEl     = this.domElement.querySelector('#Standared')                               as HTMLInputElement;
    const verifiedByEl   = this.domElement.querySelector('#toBeVerifiedByIp')                        as HTMLInputElement;
    const authorizedByEl = this.domElement.querySelector('#toBeAuthorizedByIp')                      as HTMLInputElement;
    const levelRadioEl   = this.domElement.querySelector('input[name="qualificationLevel"]:checked') as HTMLInputElement;
    const levelContainer = this.domElement.querySelector('#qualificationLevelRadios')                as HTMLElement;

    // ── Validation: collect all errors, show all at once ──────────────────────
    let isValid = true;
    const validationErrors: string[] = [];

    if (!qualTypeEl?.value) {
      qualTypeEl?.classList.add('is-invalid');
      validationErrors.push('Qualification Type');
      isValid = false;
    } else {
      qualTypeEl?.classList.remove('is-invalid');
    }

    const qualificationReferenceId = parseInt(standardEl?.getAttribute('data-ref-id') ?? '0') || 0;
    if (!qualificationReferenceId) {
      standardEl?.classList.add('is-invalid');
      validationErrors.push('Qualification Reference');
      isValid = false;
    } else {
      standardEl?.classList.remove('is-invalid');
    }

    const levelValue = levelRadioEl?.value ?? '';
    const levelErrorEl = this.domElement.querySelector('#qualificationLevelError') as HTMLElement;
    if (!levelValue) {
      if (levelContainer) levelContainer.classList.add('is-invalid');
      if (levelErrorEl) { levelErrorEl.style.display = 'block'; levelErrorEl.style.color = '#dc3545'; }
      validationErrors.push('Qualification Level');
      isValid = false;
    } else {
      if (levelContainer) levelContainer.classList.remove('is-invalid');
      if (levelErrorEl) levelErrorEl.style.display = 'none';
    }

    if (!verifiedByEl?.value?.trim()) {
      verifiedByEl?.classList.add('is-invalid');
      validationErrors.push('To Be Verified By');
      isValid = false;
    } else {
      verifiedByEl?.classList.remove('is-invalid');
    }

    authorizedByEl?.classList.remove('is-invalid');

    if (!isValid) {
      alert('Please fill in the following required field(s):\n' + validationErrors.map(e => '- ' + e).join('\n'));
      return;
    }

    // ── Read remaining values ──────────────────────────────────────────────────
    const remarksEl      = this.domElement.querySelector('#remarksTxtarea')                                     as HTMLTextAreaElement;
    const limitationsEl  = this.domElement.querySelector('#limitationsTxtarea')                                 as HTMLTextAreaElement;
    const targetDateEl   = this.domElement.querySelector('#targetAchieveDate')                                  as HTMLInputElement;
    const levelSubInputs = this.domElement.querySelectorAll('input[name="qualificationLevelSub"]:checked')      as NodeListOf<HTMLInputElement>;

    const remarks     = truncateToWordLimit(remarksEl?.value?.trim()    ?? '');
    const limitations = truncateToWordLimit(limitationsEl?.value?.trim() ?? '');

    const levelSubs: string[] = [];
    for (let i = 0; i < levelSubInputs.length; i++) {
      levelSubs.push(levelSubInputs[i].value);
    }

    let targetAchieveDate = '';
    const rawDate = targetDateEl?.value ?? '';
    if (rawDate) {
      const parts = rawDate.split('-');
      if (parts.length === 3) {
        const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
        targetAchieveDate = `${year}-${parts[1]}-${parts[0]}T00:00:00.000Z`;
      }
    }

    const selectedTypeOption    = qualTypeEl.options[qualTypeEl.selectedIndex];
    const qualificationTypeId   = parseInt(selectedTypeOption?.getAttribute('data-type-id') ?? '0') || 0;
    const qualificationTypeName = selectedTypeOption?.text?.trim() ?? qualTypeEl.value;

    const standardName         = standardEl.value.trim();
    const qualificationLevelId = parseInt(levelRadioEl.getAttribute('data-level-id') ?? '0') || 0;
    const levelName            = levelRadioEl.parentElement?.querySelector('p.form-check-label')?.textContent?.trim() ?? levelValue;

    const toBeVerifiedBy   = this.resolveEmployeesByIds(verifiedByEl?.getAttribute('data-emp-ids') ?? '');
    const toBeAuthorizedBy = this.resolveEmployeesByIds(authorizedByEl?.getAttribute('data-emp-ids') ?? '');

    const payload = {
      qualificationType:      { qualificationTypeId,      name: qualificationTypeName },
      qualificationReference: { qualificationReferenceId, name: standardName },
      qualificationLevel:     { qualificationLevelId,     name: levelName },
      reportApprover:        levelSubs.indexOf('report-approver')        !== -1,
      conformityStatement:   levelSubs.indexOf('conformity-conformity')  !== -1,
      certificationDecision: levelSubs.indexOf('certification-decision') !== -1,
      remarks,
      limitations,
      targetAchieveDate: targetAchieveDate || null,
      toBeVerifiedBy,
      toBeAuthorizedBy,
    };

    const submitBtn = this.domElement.querySelector('#submitQualificationBtn') as HTMLButtonElement;
    if (submitBtn) { submitBtn.disabled = true; }

    try {
      const response = await this.apiClient.fetch(apiUrl, AadHttpClient.configurations.v1, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      const json = await response.json().catch(() => ({}));

      if (response.ok) {
        const verifierName = verifiedByEl?.value?.trim() || '';
        this.closeModal('addQualificationModal');
        // Refresh both tables so the new qualification appears
        await Promise.all([this.fetchQualifications(), this.fetchRequestedQualifications()]);
        if (typeof (window as any).initMyQualifications === 'function') {
          (window as any).initMyQualifications();
        }
        alert('Your request has been submitted for review to - ' + verifierName);
      } else {
        const errMsg = json?.message ?? json?.title ?? `Server error ${response.status}`;
        alert('Failed to add qualification: ' + errMsg);
      }
    } catch (err) {
      console.error('[NEMKO] addQualification error:', err);
      alert('Network error while adding qualification.');
    } finally {
      if (submitBtn) { submitBtn.disabled = false; }
    }
  }

  private resolveEmployeesByIds(idsStr: string): { employeeId: number }[] {
    if (!idsStr.trim()) return [];
    return idsStr.split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(id => ({ employeeId: parseInt(id, 10) || 0 }));
  }

  // ── Update (Edit Modal save) ────────────────────────────────────────────────
  /**
   * PUT /api/qualification
   * qualificationId is passed in the request BODY (not in the URL path).
   * Payload shape matches the API spec exactly.
   */
  private async updateQualification(modalSelector: string): Promise<void> {
    const modal = this.domElement.querySelector(modalSelector) as HTMLElement;
    if (!modal) return;
    const id = (modal as any)._editItemId;
    if (!id) { console.warn('[NEMKO] updateQualification: no _editItemId on modal'); return; }

    // No id in the URL — base endpoint only; id goes in the body
    const apiUrl = `${API_BASE}/api/qualification`;

    // ── Read modal form fields ─────────────────────────────────────────────────
    const remarksEl      = modal.querySelector('#editRemarksTxtarea')    as HTMLTextAreaElement;
    const limitationsEl  = modal.querySelector('#editLimitationsTxtarea') as HTMLTextAreaElement;
    const targetDateEl   = modal.querySelector('.edit-target-achieve-date-input') as HTMLInputElement;
    const verifiedEl     = modal.querySelector('#editToBeVerifiedByIp')   as HTMLInputElement;
    const authorizedEl   = modal.querySelector('#editToBeAuthorizedByIp') as HTMLInputElement;
    const levelRadioUpdated = modal.querySelector('input[name="editQualificationLevelUpdated"]:checked') as HTMLInputElement;
    const levelRadio = levelRadioUpdated
      || (modal.querySelector('input[name="editQualificationLevel"]:checked') as HTMLInputElement);
    const levelSubInputs = levelRadioUpdated
      ? modal.querySelectorAll('input[name="editQualificationLevelSub"]:checked') as NodeListOf<HTMLInputElement>
      : modal.querySelectorAll('input[name="currentLevelSub"]:checked') as NodeListOf<HTMLInputElement>;

    const levelSubs: string[] = [];
    for (let i = 0; i < levelSubInputs.length; i++) {
      levelSubs.push(levelSubInputs[i].value);
    }

    let isValid = true;
    const validationErrors: string[] = [];
    if (!verifiedEl?.value?.trim()) {
      verifiedEl?.classList.add('is-invalid');
      validationErrors.push('To Be Verified By');
      isValid = false;
    }
    else {
      verifiedEl?.classList.remove('is-invalid');
    }
    authorizedEl?.classList.remove('is-invalid');
    if (!isValid) {
      alert('Please fill in the following required field(s):\n' + validationErrors.map(e => '- ' + e).join('\n'));
      return;
    }

    // ── Resolve qualificationLevelId from the selected radio's data attribute ──
    const qualificationLevelId = parseInt(levelRadio?.getAttribute('data-level-id') ?? '0') || 0;

    // ── Resolve employee arrays from comma-separated data-emp-ids attributes ───
    const toBeVerifiedBy   = this.resolveEmployeesByIds(verifiedEl?.getAttribute('data-emp-ids')   ?? '');
    const toBeAuthorizedBy = this.resolveEmployeesByIds(authorizedEl?.getAttribute('data-emp-ids') ?? '');

    // ── Normalise target date: dd-mm-yyyy → ISO string ────────────────────────
    let targetAchieveDate: string | null = null;
    const rawDate = targetDateEl?.value ?? '';
    if (rawDate) {
      const parts = rawDate.split('-');
      if (parts.length === 3) {
        const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
        targetAchieveDate = `${year}-${parts[1]}-${parts[0]}T00:00:00.000Z`;
      }
    }

    // ── Build payload — qualificationId in body, not URL ──────────────────────
    const payload = {
      qualificationId:       parseInt(id, 10) || 0,
      qualificationLevel:    { qualificationLevelId },
      reportApprover:        levelSubs.indexOf('report-approver')        !== -1,
      conformityStatement:   levelSubs.indexOf('conformity-conformity')  !== -1,
      certificationDecision: levelSubs.indexOf('certification-decision') !== -1,
      remarks:               truncateToWordLimit(remarksEl?.value?.trim() ?? ''),
      limitations:           truncateToWordLimit(limitationsEl?.value?.trim() ?? ''),
      targetAchieveDate,
      toBeVerifiedBy,
      toBeAuthorizedBy,
    };

    const saveBtn = modal.querySelector('.nemko-btn-save') as HTMLButtonElement;
    if (saveBtn) saveBtn.disabled = true;

    try {
      const response = await this.apiClient.fetch(apiUrl, AadHttpClient.configurations.v1, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const json = await response.json().catch(() => ({}));
      if (response.ok) {
        const verifierName = verifiedEl?.value?.trim() || '';
        this.closeModal(modal.id);
        await Promise.all([this.fetchQualifications(), this.fetchRequestedQualifications()]);
        if (typeof (window as any).initMyQualifications === 'function') {
          (window as any).initMyQualifications();
        }
        alert('Your request has been submitted for review to - ' + verifierName);
      } else {
        const errMsg = json?.message ?? json?.title ?? `Server error ${response.status}`;
        alert('Failed to update qualification: ' + errMsg);
      }
    } catch (err) {
      console.error('[NEMKO] updateQualification error:', err);
      alert('Network error while updating qualification.');
    } finally {
      if (saveBtn) saveBtn.disabled = false;
    }
  }

  // ── Event binding ───────────────────────────────────────────────────────────
  private bindQualificationEvents(): void {
    // ── Add Qualification submit ──────────────────────────────────────────────
    const submitBtn = this.domElement.querySelector('#submitQualificationBtn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.addQualification());
    }

    // ── Clear validation errors when the add modal is dismissed ──────────────
    const addModal = this.domElement.querySelector('#addQualificationModal');
    if (addModal) {
      addModal.addEventListener('hidden.bs.modal', () => {
        addModal.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        const levelErr = addModal.querySelector('#qualificationLevelError') as HTMLElement;
        if (levelErr) levelErr.style.display = 'none';
      });
    }

    // ── Edit Qualification save (both Authorized and Requested edit modals) ──
    ['#editQualificationModal', '#editQualificationModalRequested'].forEach((modalSelector) => {
      const updateBtn = this.domElement.querySelector(`${modalSelector} .nemko-btn-save`);
      if (updateBtn) {
        updateBtn.addEventListener('click', () => {
          const modal = this.domElement.querySelector(modalSelector) as any;
          const qualName = modal?._editItemName || 'this qualification';
          const isRequestedTab = modal?._editTabId === 'requested-table';
          const actionWord = isRequestedTab ? 'edit' : 'update';
          if (confirm(`Do you want to ${actionWord} the qualification - ${qualName}?`)) {
            this.updateQualification(modalSelector);
          }
        });
      }
    });

    // ── Delete Qualification (Requested edit modal only) ─────────────────────
    const deleteBtn = this.domElement.querySelector('#editQualificationModalRequested .nemko-btn-delete');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        const modal = this.domElement.querySelector('#editQualificationModalRequested') as any;
        const id = modal?._editItemId;
        if (!id) return;
        const qualName = modal?._editItemName || 'this qualification';
        if (confirm(`Do you want to delete the qualification - ${qualName}?`)) {
          this.deleteQualification(id);
        }
      });
    }

    (window as any).nemkoOpenModal  = (id: string) => this.openModal(id);
    (window as any).nemkoCloseModal = (id: string) => this.closeModal(id);

    (window as any).nemkoGetModalElement = (id: string): HTMLElement | null =>
      this.domElement.querySelector('#' + id) as HTMLElement | null;

    // Called by the JS details modal when View Details is clicked
    (window as any).nemkoFetchQualificationDetails = (id: string): Promise<void> =>
      this.fetchQualificationDetails(id);

    // Called by the JS edit modal when Edit/Update is clicked — same GET /api/qualification/{id}
    // endpoint as the details modal, so the edit form is populated with fresh data.
    (window as any).nemkoFetchQualificationForEdit = (id: string): Promise<void> =>
      this.fetchQualificationForEdit(id);

    // Called by JS when the user selects a qualification type, to load matching references
    (window as any).nemkoFetchQualificationReferences = (typeKey: string): Promise<void> =>
      this.fetchQualificationReferences(typeKey);

    // Called by JS modal search inputs for server-side filtering
    (window as any).nemkoFetchQualificationReferencesBySearch = (typeKey: string, search: string): Promise<void> =>
      this.fetchQualificationReferencesBySearch(typeKey, search);

    // Verifier / authorizer lists — keyed by qualificationType ID + qualificationLevel ID
    // (+ optional qualificationReference ID for the selected standard/scheme/test method)
    (window as any).nemkoFetchVerifiers   = (typeId: string, levelId: string, search?: string, referenceId?: string): Promise<void> =>
      this.fetchVerifiers(typeId, levelId, search, referenceId);
    (window as any).nemkoFetchAuthorizers = (typeId: string, levelId: string, search?: string, referenceId?: string): Promise<void> =>
      this.fetchAuthorizers(typeId, levelId, search, referenceId);

    // Infinite-scroll "next page" fetchers for the qualification reference / verifier /
    // authorizer select modals. Called by the JS layer when the modal list is scrolled
    // near the bottom; each is a no-op if already loading or there is no more data.
    (window as any).nemkoFetchQualificationReferencesNextPage = (): Promise<void> =>
      this.fetchQualificationReferencesNextPage();
    (window as any).nemkoFetchVerifiersNextPage = (): Promise<void> =>
      this.fetchVerifiersNextPage();
    (window as any).nemkoFetchAuthorizersNextPage = (): Promise<void> =>
      this.fetchAuthorizersNextPage();

    // Called by JS pagination controls / server-side filters to load a specific page
    (window as any).nemkoFetchQualificationsPage  = (page: number, filters?: any): Promise<void> =>
      this.fetchQualifications(page, filters);
    (window as any).nemkoFetchRequestedPage = (page: number, filters?: any): Promise<void> =>
      this.fetchRequestedQualifications(page, filters);

    (window as any).nemkoWithdrawQualification = (id: string): Promise<void> =>
      this.withdrawQualification(id);

    // Called by the Add/Edit qualification modals (show.bs.modal handlers) to
    // guarantee the qualification level/type ref-data has loaded before the
    // type dropdown / level radios are populated. Safe to call any number of
    // times — returns the same cached promise once the fetch has started.
    (window as any).nemkoEnsureQualificationRefData = (): Promise<void> =>
      this.ensureQualificationRefData();
  }

  // ── Shared reference-data fetcher (single page) ────────────────────────────
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

  // ── Paginated (infinite-scroll) reference-data fetcher — fetches ONE page at a time ─
  // windowItemsKey  -> window[...] array of items accumulated so far (replaced on page 1, appended after)
  // windowPagKey    -> window[...] pagination/state object: { page, hasMore, loading, ...meta }
  // The JS layer reads windowPagKey to decide whether/when to request the next page
  // (triggered by scrolling near the bottom of the modal list), and shows/hides a
  // loading spinner based on `loading`.
  private async fetchPaginated(
    buildUrl: (page: number) => string,
    windowItemsKey: string,
    windowPagKey: string,
    mapFn: (item: any) => any,
    page: number,
    meta: any,
    append: boolean
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
      const newItems = extractItems(json).map(mapFn);
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

  // ── Qualification level/type ref-data: single shared in-flight promise ──────
  // Both fetchQualificationLevels() and fetchQualificationTypes() populate the
  // add/edit-modal dropdowns and level radios. Fetched once (cached here) and
  // exposed to my-qualifications.js as nemkoEnsureQualificationRefData() so the
  // Add/Edit modals can await it before populating — this is what avoids the
  // "modal opened before the data arrived" race on a slow connection, since
  // resetForm()/populateEditModal() no longer assume the arrays are already
  // populated by the time they run.
  private _qualificationRefDataPromise: Promise<void> | null = null;

  private ensureQualificationRefData(): Promise<void> {
    if (!this._qualificationRefDataPromise) {
      this._qualificationRefDataPromise = Promise.all([
        this.fetchQualificationLevels(),
        this.fetchQualificationTypes(),
      ])
        .then(() => undefined)
        .catch((err) => {
          console.error('[NEMKO] Failed to load qualification levels/types:', err);
          // Allow a retry the next time the modal opens instead of caching a permanent failure.
          this._qualificationRefDataPromise = null;
          throw err;
        });
    }
    return this._qualificationRefDataPromise;
  }

  private readonly _refCache = new Map<string, any[]>();
  private readonly _verifierCache = new Map<string, any[]>();
  private readonly _authorizerCache = new Map<string, any[]>();

  private async fetchQualificationReferences(typeKey: string): Promise<void> {
    if (this._refCache.has(typeKey)) {
      (window as any).nemkoStandardItems = this._refCache.get(typeKey);
      (window as any).nemkoStandardPagination = { typeKey, search: '', page: 1, hasMore: false, loading: false };
      return;
    }
    const types: any[] = (window as any).nemkoQualificationTypes ?? [];
    let apiTypeParam = typeKey;
    for (let i = 0; i < types.length; i++) {
      if (types[i].key === typeKey) { apiTypeParam = (types[i].name || typeKey).replace(/\s+/g, ''); break; }
    }
    const base = API_BASE;
    await this.fetchPaginated(
      (page) => `${base}/api/reference-data/qualification-reference?qualificationType=${encodeURIComponent(apiTypeParam + 'Id')}&page=${page}`,
      'nemkoStandardItems',
      'nemkoStandardPagination',
      (item: any) => ({ id: item.id, title: item.name ?? '' }),
      1,
      { typeKey, search: '' },
      false
    );
    if ((window as any).nemkoStandardPagination?.hasMore === false) {
      this._refCache.set(typeKey, (window as any).nemkoStandardItems ?? []);
    }
  }

  // Fetches the next page of the currently-open qualification reference list
  // (driven by scroll position in the JS layer). No-ops if already loading or exhausted.
  private async fetchQualificationReferencesNextPage(): Promise<void> {
    const pag = (window as any).nemkoStandardPagination;
    if (!pag || pag.loading || pag.hasMore === false) return;
    const types: any[] = (window as any).nemkoQualificationTypes ?? [];
    let apiTypeParam = pag.typeKey;
    for (let i = 0; i < types.length; i++) {
      if (types[i].key === pag.typeKey) { apiTypeParam = (types[i].name || pag.typeKey).replace(/\s+/g, ''); break; }
    }
    const base = API_BASE;
    const nextPage = (pag.page ?? 1) + 1;
    const search = pag.search;
    await this.fetchPaginated(
      (page) => {
        const qs = new URLSearchParams();
        qs.set('qualificationType', apiTypeParam + 'Id');
        qs.set('page', String(page));
        if (search) qs.set('search', search);
        return `${base}/api/reference-data/qualification-reference?${qs.toString()}`;
      },
      'nemkoStandardItems',
      'nemkoStandardPagination',
      (item: any) => ({ id: item.id, title: item.name ?? '' }),
      nextPage,
      { typeKey: pag.typeKey, search },
      true
    );
    if (!search && (window as any).nemkoStandardPagination?.hasMore === false) {
      this._refCache.set(pag.typeKey, (window as any).nemkoStandardItems ?? []);
    }
  }



  private async fetchVerifiers(typeId: string, levelId: string, search?: string, referenceId?: string): Promise<void> {
    const cacheKey = `${typeId}_${levelId}_${referenceId || ''}`;
    if (!search && this._verifierCache.has(cacheKey)) {
      (window as any).nemkoVerifierItems = this._verifierCache.get(cacheKey);
      (window as any).nemkoVerifierPagination = { typeId, levelId, referenceId: referenceId || '', search: '', page: 1, hasMore: false, loading: false };
      return;
    }
    const base = API_BASE;
    await this.fetchPaginated(
      (page) => {
        const qs = new URLSearchParams();
        qs.set('qualificationType', typeId);
        qs.set('qualificationLevel', levelId);
        if (referenceId) qs.set('qualificationReference', referenceId);
        qs.set('page', String(page));
        if (search) qs.set('search', search);
        return `${base}/api/reference-data/verifier-list?${qs.toString()}`;
      },
      'nemkoVerifierItems',
      'nemkoVerifierPagination',
      (item: any) => ({ id: item.id, title: item.name ?? '', email: item.email ?? '' }),
      1,
      { typeId, levelId, referenceId: referenceId || '', search: search || '' },
      false
    );
    if (!search && (window as any).nemkoVerifierPagination?.hasMore === false) {
      this._verifierCache.set(cacheKey, (window as any).nemkoVerifierItems ?? []);
    }
  }

  // Fetches the next page of the currently-open verifier list (driven by scroll).
  private async fetchVerifiersNextPage(): Promise<void> {
    const pag = (window as any).nemkoVerifierPagination;
    if (!pag || pag.loading || pag.hasMore === false) return;
    const base = API_BASE;
    const nextPage = (pag.page ?? 1) + 1;
    await this.fetchPaginated(
      (page) => {
        const qs = new URLSearchParams();
        qs.set('qualificationType', pag.typeId);
        qs.set('qualificationLevel', pag.levelId);
        if (pag.referenceId) qs.set('qualificationReference', pag.referenceId);
        qs.set('page', String(page));
        if (pag.search) qs.set('search', pag.search);
        return `${base}/api/reference-data/verifier-list?${qs.toString()}`;
      },
      'nemkoVerifierItems',
      'nemkoVerifierPagination',
      (item: any) => ({ id: item.id, title: item.name ?? '', email: item.email ?? '' }),
      nextPage,
      { typeId: pag.typeId, levelId: pag.levelId, referenceId: pag.referenceId || '', search: pag.search },
      true
    );
    const cacheKey = `${pag.typeId}_${pag.levelId}_${pag.referenceId || ''}`;
    if (!pag.search && (window as any).nemkoVerifierPagination?.hasMore === false) {
      this._verifierCache.set(cacheKey, (window as any).nemkoVerifierItems ?? []);
    }
  }

  private async fetchAuthorizers(typeId: string, levelId: string, search?: string, referenceId?: string): Promise<void> {
    const cacheKey = `${typeId}_${levelId}_${referenceId || ''}`;
    if (!search && this._authorizerCache.has(cacheKey)) {
      (window as any).nemkoAuthorizerItems = this._authorizerCache.get(cacheKey);
      (window as any).nemkoAuthorizerPagination = { typeId, levelId, referenceId: referenceId || '', search: '', page: 1, hasMore: false, loading: false };
      return;
    }
    const base = API_BASE;
    await this.fetchPaginated(
      (page) => {
        const qs = new URLSearchParams();
        qs.set('qualificationType', typeId);
        qs.set('qualificationLevel', levelId);
        if (referenceId) qs.set('qualificationReference', referenceId);
        qs.set('page', String(page));
        if (search) qs.set('search', search);
        return `${base}/api/reference-data/authorizer-list?${qs.toString()}`;
      },
      'nemkoAuthorizerItems',
      'nemkoAuthorizerPagination',
      (item: any) => ({ id: item.id, title: item.name ?? '', email: item.email ?? '' }),
      1,
      { typeId, levelId, referenceId: referenceId || '', search: search || '' },
      false
    );
    if (!search && (window as any).nemkoAuthorizerPagination?.hasMore === false) {
      this._authorizerCache.set(cacheKey, (window as any).nemkoAuthorizerItems ?? []);
    }
  }

  // Fetches the next page of the currently-open authorizer list (driven by scroll).
  private async fetchAuthorizersNextPage(): Promise<void> {
    const pag = (window as any).nemkoAuthorizerPagination;
    if (!pag || pag.loading || pag.hasMore === false) return;
    const base = API_BASE;
    const nextPage = (pag.page ?? 1) + 1;
    await this.fetchPaginated(
      (page) => {
        const qs = new URLSearchParams();
        qs.set('qualificationType', pag.typeId);
        qs.set('qualificationLevel', pag.levelId);
        if (pag.referenceId) qs.set('qualificationReference', pag.referenceId);
        qs.set('page', String(page));
        if (pag.search) qs.set('search', pag.search);
        return `${base}/api/reference-data/authorizer-list?${qs.toString()}`;
      },
      'nemkoAuthorizerItems',
      'nemkoAuthorizerPagination',
      (item: any) => ({ id: item.id, title: item.name ?? '', email: item.email ?? '' }),
      nextPage,
      { typeId: pag.typeId, levelId: pag.levelId, referenceId: pag.referenceId || '', search: pag.search },
      true
    );
    const cacheKey = `${pag.typeId}_${pag.levelId}_${pag.referenceId || ''}`;
    if (!pag.search && (window as any).nemkoAuthorizerPagination?.hasMore === false) {
      this._authorizerCache.set(cacheKey, (window as any).nemkoAuthorizerItems ?? []);
    }
  }

  private async fetchQualificationReferencesBySearch(typeKey: string, search: string): Promise<void> {
    const types: any[] = (window as any).nemkoQualificationTypes ?? [];
    let apiTypeParam = typeKey;
    for (let i = 0; i < types.length; i++) {
      if (types[i].key === typeKey) { apiTypeParam = (types[i].name || typeKey).replace(/\s+/g, ''); break; }
    }
    const base = API_BASE;
    await this.fetchPaginated(
      (page) => {
        const qs = new URLSearchParams();
        qs.set('qualificationType', apiTypeParam + 'Id');
        qs.set('page', String(page));
        if (search) qs.set('search', search);
        return `${base}/api/reference-data/qualification-reference?${qs.toString()}`;
      },
      'nemkoStandardItems',
      'nemkoStandardPagination',
      (item: any) => ({ id: item.id, title: item.name ?? '' }),
      1,
      { typeKey, search },
      false
    );
  }

  // ── CSS / Script loading ────────────────────────────────────────────────────
  private loadCSS(): void {
    SPComponentLoader.loadCss(`${this.siteUrl}/SiteAssets/resources/css/jquery-ui.css`);
    SPComponentLoader.loadCss(`${this.siteUrl}/SiteAssets/resources/css/qualification-db.css`);
    SPComponentLoader.loadCss(`${this.siteUrl}/SiteAssets/resources/css/nemko-modal.css`);
  }

  // Hints the browser to start DNS lookup + TLS handshake with the API's
  // origin (a different host than the SharePoint site) before the first
  // actual request is made, so that round trip isn't paid on the critical
  // path of the first data fetch. Safe to call multiple times — the browser
  // dedupes identical <link> hints. Only added once per page life.
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
      // Non-critical — ignore if URL parsing/DOM insertion fails for any reason.
    }
  }

  private showTableError(): void {
    const tbodies = this.domElement.querySelectorAll('.nemko-table-container tbody');
    tbodies.forEach(tbody => {
      tbody.innerHTML =
        '<tr><td colspan="20" style="text-align:center;padding:2rem;color:#696A6E;">Failed to load data. Please refresh the page.</td></tr>';
    });
  }

  /**
   * Disables (busy = true) or re-enables (busy = false) the tab-switch/Add
   * Qualification toolbar and both tables' filter controls. These render
   * immediately from static HTML, well before my-qualifications.js has
   * loaded and initMyQualifications() has wired up their click/change
   * handlers — this keeps them inert during that gap instead of letting a
   * click do nothing (tabs/filters) or open a modal with nothing populated
   * (Add Qualification).
   *
   * Deliberately does NOT use opacity or the native `disabled` attribute —
   * both make controls look faded/broken, which reads as "something's
   * wrong" rather than "still loading" and doesn't match the fully-loaded
   * page at all. Blocking clicks via pointer-events (mouse) and tabIndex/
   * aria-disabled (keyboard + assistive tech) keeps the exact same visual
   * appearance as the ready state throughout.
   */
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

    const toolbar = this.domElement.querySelector('#qualificationsToolbar') as HTMLElement;
    if (toolbar) {
      toolbar.setAttribute('aria-busy', busy ? 'true' : 'false');
      applyToControls(toolbar);
    }

    this.domElement.querySelectorAll('.nemko-table-top-filter-wrapper').forEach((wrapper) => {
      applyToControls(wrapper as HTMLElement);
    });
  }

  private loadHomeScripts(): void {
    const siteAssetsUrl = `${this.siteUrl}/SiteAssets`;

    // Loaded in parallel rather than chained: my-qualifications.js only
    // *uses* jQuery UI (the datepicker) once initMyQualifications() runs
    // below, and initDatepickers() already polls/waits for $.fn.datepicker
    // to exist before binding — so there's no load-order dependency between
    // the two files, only a "both must be present before init() runs" one,
    // which Promise.all still guarantees. This turns two sequential network
    // round trips into one, roughly halving script-load time on a cold cache.
    const scriptsPromise = Promise.all([
      SPComponentLoader.loadScript(`${siteAssetsUrl}/resources/js/jquery-ui.js`),
      SPComponentLoader.loadScript(`${siteAssetsUrl}/resources/js/my-qualifications.js`),
    ]);

    // Guarantees the toolbar/filters are re-enabled exactly once no matter
    // which path finishes first — success, an error, or (as a last resort)
    // the timeout below. Without this, any failure/hang left the page
    // looking permanently frozen, since setControlsBusy(true) in render()
    // was only ever undone inside the success branch.
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

    // Warm the qualification level/type cache in the background. This is
    // deliberately NOT part of dataPromise below — the Add/Edit Qualification
    // modals await this exact same cached promise (via
    // nemkoEnsureQualificationRefData) before populating their dropdowns/radios,
    // so correctness doesn't depend on it finishing before first paint; this
    // just makes the common case (modal opened after a normal page load) feel
    // instant since the data is usually already cached by then.
    this.ensureQualificationRefData().catch(() => { /* modal-open path will retry */ });

    const dataPromise = Promise.all([
      this.fetchQualifications(),
      this.fetchRequestedQualifications(),
    ]);

    Promise.all([scriptsPromise, dataPromise])
      .then(() => {
        if (typeof (window as any).initMyQualifications === 'function') {
          (window as any).initMyQualifications();
        } else {
          console.error('[NEMKO] initMyQualifications not found after load');
        }

        const params = new URLSearchParams(window.location.search);
        if (params.get('modal') === 'addQualification') {
          const btn = this.domElement.querySelector('[data-bs-target="#addQualificationModal"]') as HTMLElement;
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

    // Safety net: some environments (e.g. a restricted webview/card
    // rendering) may cause the script load or data fetch to hang without
    // ever resolving or rejecting. If that happens, don't leave the page
    // looking frozen forever — release the controls after a generous
    // timeout regardless. If the real load does eventually finish after
    // this fires, the .then()/.catch() above still runs normally (they're
    // independent of this timer), so nothing is lost — the page just also
    // becomes clickable sooner as a fallback.
    setTimeout(() => {
      if (!controlsReleased) {
        console.error('[NEMKO] Qualifications page took too long to load — releasing controls so the page is not stuck.');
        releaseControls();
      }
    }, 20000);
  }

  private async deleteQualification(id: string): Promise<void> {
    const apiUrl = `${API_BASE}/api/qualification/${id}`;
    if (!this.apiClient) return;

    try {
      const response = await this.apiClient.fetch(apiUrl, AadHttpClient.configurations.v1, {
        method: 'DELETE',
        headers: { 'Accept': 'text/plain' },
      });
      if (response.ok) {
        this.closeModal('editQualificationModalRequested');
        await Promise.all([this.fetchQualifications(), this.fetchRequestedQualifications()]);
        if (typeof (window as any).initMyQualifications === 'function') {
          (window as any).initMyQualifications();
        }
        alert('Request has been deleted.');
      } else {
        const text = await response.text().catch(() => '');
        alert('Failed to delete request: ' + (text || `Server error ${response.status}`));
      }
    } catch (err) {
      console.error('[NEMKO] deleteQualification error:', err);
      alert('Network error while deleting request.');
    }
  }

  private async withdrawQualification(id: string): Promise<void> {
    const apiUrl = `${API_BASE}/api/qualification/Operation`;
    if (!this.apiClient) return;

    const payload = {
      qualificationId: [parseInt(id, 10)],
      status: 'withdraw',
    };

    try {
      const response = await this.apiClient.fetch(apiUrl, AadHttpClient.configurations.v1, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const json = await response.json().catch(() => ({}));
      if (response.ok) {
        await Promise.all([this.fetchQualifications(), this.fetchRequestedQualifications()]);
        if (typeof (window as any).initMyQualifications === 'function') {
          (window as any).initMyQualifications();
        }
        alert('Qualification has been withdrawn successfully.');
      } else {
        const errMsg = json?.message ?? json?.title ?? `Server error ${response.status}`;
        alert('Failed to withdraw qualification: ' + errMsg);
      }
    } catch (err) {
      console.error('[NEMKO] withdrawQualification error:', err);
      alert('Network error while withdrawing qualification.');
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
