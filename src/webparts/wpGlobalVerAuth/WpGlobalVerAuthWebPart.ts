import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import GlobalVerAuth from './GlobalVerAuthUi';
import { SPComponentLoader } from '@microsoft/sp-loader';
import * as strings from 'WpGlobalVerAuthWebPartStrings';
import SharedSidebar from '../../SharedSidebar';
import { AadHttpClient, HttpClientResponse } from '@microsoft/sp-http';

export interface IWpGlobalVerAuthWebPartProps {
  description: string;
}

const API_BASE = 'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net';
const GVA_URL = `${API_BASE}/api/admin/DefaultAuthorizerVerifier`;
const EMPLOYEE_REF_URL = `${API_BASE}/api/reference-data/Employee`;

export default class WpGlobalVerAuthWebPart extends BaseClientSideWebPart<IWpGlobalVerAuthWebPartProps> {

  private siteUrl: string = '';
  private apiClient!: AadHttpClient;
  private _initFailed = false;

  public render(): void {
    const resourceUrl = `${this.siteUrl}/SiteAssets`;

    this.domElement.innerHTML =
      SharedSidebar.getHtml({
        resourceUrl,
        siteUrl: this.siteUrl,
        activeNavItem: '',
        activeTabId: '',
      }) +
      GlobalVerAuth.allElementsHtml;
    // ── Sidebar init — no timeout needed ─────────────────────────────────
    SharedSidebar.initBehavior(this.domElement, this.siteUrl);
    this.initWhenReady();
    this.bindGlobalVerAuth();
    this.loadHomeScripts();
  }

  private initWhenReady(): void {
    if ((window as any).bootstrap) {
      SharedSidebar.initBehavior(this.domElement, this.siteUrl);
      return;
    }
    // Bootstrap not ready yet — poll until it is
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if ((window as any).bootstrap) {
        clearInterval(interval);
        SharedSidebar.initBehavior(this.domElement, this.siteUrl);
      } else if (attempts > 20) {
        clearInterval(interval);
        // Bootstrap never loaded — init anyway so rest of sidebar works
        SharedSidebar.initBehavior(this.domElement, this.siteUrl);
        console.warn('[NEMKO] Bootstrap not found after waiting');
      }
    }, 100);
  }

  protected async onInit(): Promise<void> {
    this.siteUrl = this.context.pageContext.web.absoluteUrl;
    this.loadCSS();

    window.onpopstate = () => {
      this.render();
    };

    await this.initApiClient();
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

  private loadCSS(): void {
    SPComponentLoader.loadCss(`${this.siteUrl}/SiteAssets/resources/css/jquery-ui.css`);
    SPComponentLoader.loadCss(`${this.siteUrl}/SiteAssets/resources/css/nemko-modal.css`);
    SPComponentLoader.loadCss(`${this.siteUrl}/SiteAssets/resources/css/global-employee.css`);

    // The employee search-select's suggestion list (.nemko-email-suggestions)
    // has no styling of its own in any of the shared stylesheets above — same
    // gap exists in WpAdvancedSearchWebPart, which works around it with this
    // same runtime-injected <style> block. Without it the <ul> renders with
    // no background/border/shadow/positioning and just falls into normal
    // document flow instead of floating over the fields below it.
    if (!document.getElementById('nemko-gva-search-select-css')) {
      const style = document.createElement('style');
      style.id = 'nemko-gva-search-select-css';
      style.textContent =
        '.nemko-email-suggestions{z-index:1060;max-height:200px;overflow-y:auto;' +
        'background:#fff;border:1px solid #ddd;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.15);margin-top:2px;}' +
        '.nemko-email-suggestions li{padding:8px 12px;cursor:pointer;}' +
        '.nemko-email-suggestions li:hover{background:#f0f0f0;}';
      document.head.appendChild(style);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // API LAYER — Global Verifier / Authorizer list + CRUD
  // ═══════════════════════════════════════════════════════════════════════════

  private async fetchGvaPage(
    page: number = 1,
    sortBy?: string | null,
    sortOrder?: string | null
  ): Promise<void> {
    if (!this.apiClient) {
      (window as any).nemkoGvaRows = [];
      (window as any).nemkoGvaPagination = null;
      return;
    }

    const qs = new URLSearchParams();
    qs.set('page', String(page));
    if (sortBy) qs.set('sortBy', sortBy);
    if (sortOrder) qs.set('sortOrder', sortOrder);
    const apiUrl = `${GVA_URL}?${qs.toString()}`;

    try {
      const response: HttpClientResponse = await this.apiClient.get(apiUrl, AadHttpClient.configurations.v1);
      if (!response.ok) {
        (window as any).nemkoGvaRows = [];
        (window as any).nemkoGvaPagination = null;
        return;
      }
      const json = await response.json();
      const items = json?.data?.items ?? [];
      (window as any).nemkoGvaRows = items.map((item: any) => ({
        id: item.id,
        name: item.name ?? '',
        email: item.email ?? '',
        isVerifier: !!item.isVerifier,
        isAuthorizer: !!item.isAuthorizer,
      }));
      (window as any).nemkoGvaPagination = json?.data?.pagination ?? null;
    } catch (err) {
      console.error('[NEMKO] fetchGvaPage error:', err);
      (window as any).nemkoGvaRows = [];
      (window as any).nemkoGvaPagination = null;
    }
  }

  private async addGvaEmployee(payload: {
    employeeId: number; isVerifier: boolean; isAuthorizer: boolean;
  }): Promise<void> {
    if (!this.apiClient) throw new Error('API client not ready');
    const response: HttpClientResponse = await this.apiClient.fetch(
      GVA_URL, AadHttpClient.configurations.v1,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    );
    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      const errors = (json as any)?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        throw new Error(errors.map((e: any) => e.error ?? e.message ?? JSON.stringify(e)).join('\n'));
      }
      throw new Error((json as any)?.message ?? `Add failed (${response.status})`);
    }
  }

  private async updateGvaEmployee(
    id: number,
    payload: { isVerifier: boolean; isAuthorizer: boolean }
  ): Promise<void> {
    if (!this.apiClient) throw new Error('API client not ready');
    const response: HttpClientResponse = await this.apiClient.fetch(
      `${GVA_URL}/${id}`, AadHttpClient.configurations.v1,
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

  private async deleteGvaEmployee(id: number): Promise<void> {
    if (!this.apiClient) throw new Error('API client not ready');
    const response: HttpClientResponse = await this.apiClient.fetch(
      `${GVA_URL}/${id}`, AadHttpClient.configurations.v1,
      { method: 'DELETE' }
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

  // ═══════════════════════════════════════════════════════════════════════════
  // API LAYER — Employee reference-data (paginated search-select source)
  // ═══════════════════════════════════════════════════════════════════════════

  private async fetchEmployeeRefPage(
    page: number,
    search?: string
  ): Promise<{ items: Array<{ id: number; name: string }>; hasMore: boolean }> {
    if (!this.apiClient) return { items: [], hasMore: false };
    try {
      const qs = new URLSearchParams();
      qs.set('page', String(page));
      if (search) qs.set('search', search);
      const response: HttpClientResponse = await this.apiClient.get(
        `${EMPLOYEE_REF_URL}?${qs.toString()}`, AadHttpClient.configurations.v1
      );
      if (!response.ok) return { items: [], hasMore: false };
      const json = await response.json();
      const items = (json?.data?.items ?? []).map((item: any) => ({ id: Number(item.id), name: item.name ?? '' }));
      return { items, hasMore: json?.data?.pagination?.hasMore === true };
    } catch (err) {
      console.error('[NEMKO] fetchEmployeeRefPage error:', err);
      return { items: [], hasMore: false };
    }
  }

  // Same first-page/next-page pattern as WpAdvancedSearchWebPart's
  // fetchProductCategoriesFirstPage/NextPage — powers the scroll-to-load
  // employee search-select on the "Add Employee" row. `search` drives a
  // fresh page-1 fetch whenever the typed term changes (including back to
  // ''); re-invoking with the same term already loaded is a no-op.
  private async fetchGvaEmployeesFirstPage(search?: string): Promise<void> {
    const term = search || '';
    const pag = (window as any).nemkoGvaEmployeesPagination;
    if (pag && pag.search === term) return;
    (window as any).nemkoGvaEmployeesPagination = { page: 1, hasMore: true, loading: true, search: term };
    const { items, hasMore } = await this.fetchEmployeeRefPage(1, term);
    (window as any).nemkoGvaEmployees = items;
    (window as any).nemkoGvaEmployeesPagination = { page: 1, hasMore, loading: false, search: term };
  }

  private async fetchGvaEmployeesNextPage(): Promise<void> {
    const pag = (window as any).nemkoGvaEmployeesPagination;
    if (!pag || pag.loading || pag.hasMore === false) return;
    const nextPage = pag.page + 1;
    (window as any).nemkoGvaEmployeesPagination = { ...pag, loading: true };
    const { items, hasMore } = await this.fetchEmployeeRefPage(nextPage, pag.search);
    const existing: Array<{ id: number; name: string }> = (window as any).nemkoGvaEmployees || [];
    (window as any).nemkoGvaEmployees = existing.concat(items);
    (window as any).nemkoGvaEmployeesPagination = { page: nextPage, hasMore, loading: false, search: pag.search };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Bindings exposed to global-ver-auth.js
  // ═══════════════════════════════════════════════════════════════════════════

  private bindGlobalVerAuth(): void {
    (window as any).nemkoFetchGvaPage = (page: number, sortBy?: string | null, sortOrder?: string | null): Promise<void> =>
      this.fetchGvaPage(page, sortBy, sortOrder);
    (window as any).nemkoAddGvaEmployee = (payload: { employeeId: number; isVerifier: boolean; isAuthorizer: boolean }): Promise<void> =>
      this.addGvaEmployee(payload);
    (window as any).nemkoUpdateGvaEmployee = (id: number, payload: { isVerifier: boolean; isAuthorizer: boolean }): Promise<void> =>
      this.updateGvaEmployee(id, payload);
    (window as any).nemkoDeleteGvaEmployee = (id: number): Promise<void> =>
      this.deleteGvaEmployee(id);
    (window as any).nemkoFetchGvaEmployeesFirstPage = (search?: string): Promise<void> =>
      this.fetchGvaEmployeesFirstPage(search);
    (window as any).nemkoFetchGvaEmployeesNextPage = (): Promise<void> =>
      this.fetchGvaEmployeesNextPage();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Script + initial data load
  // ═══════════════════════════════════════════════════════════════════════════

  private showTableError(): void {
    const tbodies = this.domElement.querySelectorAll('.nemko-table-container tbody');
    tbodies.forEach(tbody => {
      tbody.innerHTML =
        '<tr><td colspan="20" style="text-align:center;padding:2rem;color:#696A6E;">Failed to load data. Please refresh the page.</td></tr>';
    });
  }

  private loadHomeScripts(): void {
    const siteAssetsUrl = `${this.siteUrl}/SiteAssets`;

    const scriptPromise = SPComponentLoader.loadScript(`${siteAssetsUrl}/resources/js/global-ver-auth.js`);

    if (this._initFailed) {
      scriptPromise
        .then(() => this.showTableError())
        .catch(err => console.error('[NEMKO] JS Load Error:', err));
      return;
    }

    const dataPromise = this.fetchGvaPage(1).catch(err => {
      console.error('[NEMKO] initial GVA fetch failed:', err);
      (window as any).nemkoGvaRows = [];
      (window as any).nemkoGvaPagination = null;
    });

    Promise.all([scriptPromise, dataPromise])
      .then(() => {
        if (typeof (window as any).initGlobalVerAuth === 'function') {
          (window as any).initGlobalVerAuth();
        } else {
          console.error('[NEMKO] initGlobalVerAuth not found on window');
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
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
