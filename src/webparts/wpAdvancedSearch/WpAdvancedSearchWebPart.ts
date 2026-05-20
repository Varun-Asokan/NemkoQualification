import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import AdvancedSearch from './AdvancedSearchUi';
import { SPComponentLoader } from '@microsoft/sp-loader';
import SharedSidebar from '../../SharedSidebar';
import * as strings from 'WpAdvancedSearchWebPartStrings';
import { AadHttpClient, IHttpClientOptions } from '@microsoft/sp-http';


export interface IWpAdvancedSearchWebPartProps {
  description: string;
}

export default class WpAdvancedSearchWebPart extends BaseClientSideWebPart<IWpAdvancedSearchWebPartProps> {
  private siteUrl: string = '';
  private apiClient!: AadHttpClient;


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
    this.bindImportModal()
    this.loadHomeScripts();
  }

  protected onInit(): Promise<void> {
    this.siteUrl = this.context.pageContext.web.absoluteUrl;
    this.loadCSS();

    window.onpopstate = () => {
      this.render();
    };

    return this.context.aadHttpClientFactory
      .getClient('api://66eda48a-d5f9-4db0-a911-0d936f8ce92b')
      .then(client => {
        this.apiClient = client;
        return this.context.aadTokenProviderFactory.getTokenProvider();
      })
      .then(tokenProvider => {
        return tokenProvider.getToken('api://66eda48a-d5f9-4db0-a911-0d936f8ce92b/access_as_user')
      })
      .then(token => {
        console.log('[NEMKO] Bearer token:', token);
      })
      .catch(err => {
        console.error('[NEMKO] AAD client init failed:', err);
      });

  }

  // ── Advanced Search: MyQualifications ────────────────────────────────────────
  private async fetchQualifications(): Promise<void> {
    const apiUrl = 'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/qualifications/search';

    const stubRows = [
      {
        id: '1', employee: 'Kevin', office: 'TVPM', qualifications: 'ISO/IEC 27001',
        level: 'Employee', status: 'Active', report: 'Yes', certification: 'Yes',
        conformity: 'Yes', limitations: '', remarks: '', verifiedBy: '', authorizedBy: '', withdrawnDate: ''
      },
    ];

    if (!this.apiClient) {
      (window as any).nemkoTableRows = stubRows;
      return;
    }

    try {
      const response = await this.apiClient.get(apiUrl, AadHttpClient.configurations.v1);
      if (!response.ok) {
        (window as any).nemkoTableRows = stubRows;
        return;
      }
      const json = await response.json();
      const items = json?.data?.items ?? (Array.isArray(json) ? json : []);
      (window as any).nemkoTableRows = items.length
        ? items.map((item: any) => ({
          id: String(item.id ?? ''),
          employee: item.employee?.value ?? '',
          office: item.office?.value ?? '',
          qualifications: Array.isArray(item.standard)
            ? item.standard.map((s: any) => s.value).join(', ')
            : (item.standard?.value ?? ''),
          level: item.level?.value ?? '',
          status: item.status?.value ?? '',
          report: item.reportApprover?.value ?? '',
          certification: item.certificationDecision?.value ?? '',
          conformity: item.conformityStatement?.value ?? '',
          limitations: item.limitations ?? '',
          remarks: item.remarks ?? '',
          verifiedBy: item.verifiedBy ?? '',
          authorizedBy: item.authorizedBy ?? '',
          withdrawnDate: item.withdrawnDate ?? '',
        }))
        : stubRows;
    } catch (err) {
      console.error('fetchQualifications error:', err);
      (window as any).nemkoTableRows = stubRows;
    }
  }


  private async fetchQualificationDetails(id: string): Promise<void> {
    const apiUrl = `https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/qualifications/${id}`;

    const dummyDetails: Record<string, any> = {
      '1': {
        qualificationId: 'QID-001',
        qualificationStatus: { value: 'Approved' },
        toBeVerifiedBy: { name: 'Kevin', email: 'kevin@nemko.com' },
        verifiedBy: { name: 'Kevin', email: 'kevin@nemko.com' },
        authorizedBy: { name: 'John', email: 'john@nemko.com' },
        authorizedDate: '2025-04-10',
        qualificationReference: { value: 'ISO/IEC 27001' },
        level: { value: 'Employee' },
        conformityStatement: 'Yes',
        reportApprover: 'Yes',
        remarks: 'Verified with full scope.',
        limitations: 'None',
      },
      '2': {
        qualificationId: 'QID-002',
        qualificationStatus: { value: 'Approved' },
        toBeVerifiedBy: { name: 'John', email: 'john@nemko.com' },
        verifiedBy: { name: 'John', email: 'john@nemko.com' },
        authorizedBy: { name: 'Kevin', email: 'kevin@nemko.com' },
        authorizedDate: '2025-06-01',
        qualificationReference: { value: 'Energy Scheme' },
        level: { value: 'Employee' },
        conformityStatement: 'No',
        reportApprover: 'No',
        remarks: '',
        limitations: '',
      },
    };

    const fallback = dummyDetails[id] ?? dummyDetails['1'];

    if (!this.apiClient) {
      (window as any).nemkoQualificationDetail = fallback;
      return;
    }

    try {
      const response = await this.apiClient.get(apiUrl, AadHttpClient.configurations.v1);
      if (!response.ok) {
        (window as any).nemkoQualificationDetail = fallback;
        return;
      }
      const json = await response.json();
      (window as any).nemkoQualificationDetail = json?.data ?? fallback;
    } catch (err) {
      console.error('fetchQualificationDetails error:', err);
      (window as any).nemkoQualificationDetail = fallback;
    }
  }



  // ── Product Category Fetch ────────────────────────────────────────────────────
  private async fetchProductCategories(): Promise<void> {
    const apiUrl = 'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/reference-data/product-categories';

    const hardcodedCategories = [
      { id: '1', name: 'EMC' },
      { id: '2', name: 'Safety' },
      { id: '3', name: 'RF' },
    ];

    if (!this.apiClient) {
      (window as any).nemkoProductCategories = hardcodedCategories;
      return;
    }

    try {
      const response = await this.apiClient.get(apiUrl, AadHttpClient.configurations.v1);
      if (!response.ok) {
        (window as any).nemkoProductCategories = hardcodedCategories;
        return;
      }
      const json = await response.json();
      const items = json?.data?.items ?? [];
      (window as any).nemkoProductCategories = items.length
        ? items.map((item: any) => ({
          id: Number(item.id),
          name: item.name ?? '',
        }))
        : hardcodedCategories;
    } catch (err) {
      console.error('fetchProductCategories error:', err);
      (window as any).nemkoProductCategories = hardcodedCategories;
    }
  }

  private populateCategoryDropdowns(): void {
    const categories: { id: string; name: string }[] = (window as any).nemkoProductCategories ?? [];
    const optionsHtml = categories
      .map(c => `<option value="${c.id}">${c.name}</option>`)
      .join('');

    const selectors = [
      '#pdctCategoryStd',
      '#editPdctCategoryStd',
      '#pdctCategoryTm',
      '#editPdctCategoryTm',
    ];

    selectors.forEach(sel => {
      const el = this.domElement.querySelector(sel) as HTMLSelectElement;
      if (!el) return;
      const placeholder = el.options[0];
      el.innerHTML = '';
      if (placeholder) el.appendChild(placeholder);
      el.insertAdjacentHTML('beforeend', optionsHtml);
    });

    // Test method filter dropdown
    const filterSel = this.domElement.querySelector(
      '[data-filter-key="pdctCategory"]'
    ) as HTMLSelectElement;
    if (filterSel) {
      filterSel.innerHTML = `<option value="">All</option>${categories
        .map(c => `<option value="${c.id}">${c.name}</option>`)
        .join('')}`;
    }
  }

  // ── DB Tab: Standards ────────────────────────────────────────────────────────
  private async fetchStandards(): Promise<void> {
    const apiUrl = 'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/database/standards';

    const stubItems = [
      { id: '1', title: 'IEC 60065' },
      { id: '2', title: 'EN 55032' },
    ];
    const stubRows = [
      { id: '1', title: 'IEC 60065', category: 'Safety' },
      { id: '2', title: 'EN 55032', category: 'EMC' },
    ];

    try {
      const response = await this.apiClient.get(apiUrl, AadHttpClient.configurations.v1);
      if (!response.ok) {
        (window as any).nemkoStandardItems = stubItems;
        (window as any).nemkoDbStandardRows = stubRows;
        return;
      }
      const json = await response.json();
      const items = json?.data?.items ?? [];
      (window as any).nemkoStandardItems = items.map((item: any) => ({
        id: item.id,
        title: item.title ?? '',
       
      }));
      (window as any).nemkoDbStandardRows = items.map((item: any) => ({
        id: item.id,
        title: item.Title ?? item.title ?? '',
        productCategory: item.productCategory ?? '',
      }));
    } catch (err) {
      console.error('fetchStandards error:', err);
      (window as any).nemkoStandardItems = stubItems;
      (window as any).nemkoDbStandardRows = stubRows;
    }
  }

  private async fetchStandardDetails(id: string): Promise<void> {
    const apiUrl = `https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/database/standards/${id}`;
    const fallback = { title: '', productCategory: '', icsCode: '', iaf: '', nace: '', accreditedStandard: false, linkToWorkbench: '' };
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
  private async fetchSchemes(): Promise<void> {
    const apiUrl = 'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/database/scheme';

    const stubItems = [
      { id: '1', title: 'CB Scheme' },
      { id: '2', title: 'IECEE Scheme' },
    ];
    const stubRows = [
      { id: '1', name: 'CB Scheme', refStandared: 'IEC 60065\nIEC 62368' },
      { id: '2', name: 'IECEE Scheme', refStandared: 'IEC 60950' },
    ];

    try {
      const response = await this.apiClient.get(apiUrl, AadHttpClient.configurations.v1);
      if (!response.ok) {
        (window as any).nemkoSchemeItems = stubItems;
        (window as any).nemkoDbSchemeRows = stubRows;
        return;
      }
      const json = await response.json();
      const items = json?.data?.items ?? [];
      (window as any).nemkoSchemeItems = items.map((item: any) => ({
        id: String(item.id),
        title: item.name ?? '',
      }));
      (window as any).nemkoDbSchemeRows = items.map((item: any) => ({
        id: String(item.id),
        name: item.name ?? '',
        refStandared: item.referenceStandard ?? '',
      }));
    } catch (err) {
      console.error('fetchSchemes error:', err);
      (window as any).nemkoSchemeItems = stubItems;
      (window as any).nemkoDbSchemeRows = stubRows;
    }
  }

  private async fetchSchemeDetails(id: string): Promise<void> {
  const apiUrl = `https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/database/scheme/${id}`;
  const fallback = { name: '', referenceStandard: '' };
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
    const apiUrl = 'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/database/scheme';
    const nameEl = this.domElement.querySelector('#schemeNameIp') as HTMLInputElement;
    const refEl = this.domElement.querySelector('#refStandaredTxtarea') as HTMLTextAreaElement;
    try {
      const response = await this.apiClient.post(
        apiUrl,
        AadHttpClient.configurations.v1,
        {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nameEl?.value?.trim() ?? '',
            referenceStandard: refEl?.value?.trim() ?? '',
          }),
        });
      const json = await response.json();
      if (response.ok) {
        this.closeModal('createSchemeModal');
        this.resetSchemeModal();
        await this.fetchSchemes();
        (window as any)._nemkoAdvSearch?.renderSchemes();
      } else {
        alert('Failed: ' + (json?.message ?? 'Unknown error'));
      }
    } catch (err) {
      console.error('createScheme error:', err);
      alert('Network error while creating scheme.');
    }
  }

  // ── DB Tab: Test Methods ─────────────────────────────────────────────────────
  private async fetchTestMethods(): Promise<void> {
    const apiUrl = 'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/database/test-methods';

    const stubItems = [
      { id: '1', title: 'Radiated Emission Test' },
      { id: '2', title: 'Conducted Emission Test' },
      { id: '3', title: 'RF Immunity Test' },
    ];
    const stubRows = [
      { id: '1', name: 'Radiated Emission Test', pdctCategory: '1', refStandared: 'EN 55032' },
      { id: '2', name: 'Conducted Emission Test', pdctCategory: '2', refStandared: 'IEC 60065' },
      { id: '3', name: 'RF Immunity Test', pdctCategory: '3', refStandared: 'EN 55035' },
    ];

    if (!this.apiClient) {
      (window as any).nemkoTestMethodItems = stubItems;
      (window as any).nemkoDbTestMethodRows = stubRows;
      return;
    }

    try {
      const response = await this.apiClient.get(apiUrl, AadHttpClient.configurations.v1);
      if (!response.ok) {
        (window as any).nemkoTestMethodItems = stubItems;
        (window as any).nemkoDbTestMethodRows = stubRows;
        return;
      }
      const json = await response.json();
      const items = json?.data?.items ?? [];
      (window as any).nemkoTestMethodItems = items.map((item: any) => ({
        id: String(item.id),
        title: item.name ?? '',
      }));
      (window as any).nemkoDbTestMethodRows = items.map((item: any) => ({
        id: String(item.id),
        name: item.name ?? '',
        pdctCategory: String(item.productCategory ?? ''),
        refStandared: item.referenceStandard ?? '',
      }));
    } catch (err) {
      console.error('fetchTestMethods error:', err);
      (window as any).nemkoTestMethodItems = stubItems;
      (window as any).nemkoDbTestMethodRows = stubRows;
    }
  }

  private async fetchTestMethodDetails(id: string): Promise<void> {
  const apiUrl = `https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/database/test-methods/${id}`;
  const fallback = { name: '', productCategory: '', referenceStandard: '' };
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
    const apiUrl = 'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/database/test-methods';
    const nameEl = this.domElement.querySelector('#methodNameIp') as HTMLInputElement;
    const catEl = this.domElement.querySelector('#pdctCategoryTm') as HTMLSelectElement;
    const refEl = this.domElement.querySelector('#refStandaredTmTxtarea') as HTMLTextAreaElement;
    try {
      const response = await this.apiClient.post(
        apiUrl,
        AadHttpClient.configurations.v1,
        {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nameEl?.value?.trim() ?? '',
            productCategory: Number(catEl?.value) || 0,
            referenceStandard: refEl?.value?.trim() ?? '',
          }),
        });
      const json = await response.json();
      if (response.ok) {
        this.closeModal('createTestmethodModal');
        this.resetTestMethodModal();
        await this.fetchTestMethods();
        (window as any)._nemkoAdvSearch?.renderTestMethods();
      } else {
        alert('Failed: ' + (json?.message ?? 'Unknown error'));
      }
    } catch (err) {
      console.error('createTestMethod error:', err);
      alert('Network error while creating test method.');
    }
  }

  // ── DB Tab: Offices ──────────────────────────────────────────────────────────
  private async fetchOffices(): Promise<void> {
    const apiUrl = 'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/reference-data/office';

    const stubRows = [
      { id: '1', name: 'Oslo HQ' },
      { id: '2', name: 'Nemko GmbH' },
    ];

    if (!this.apiClient) {
      (window as any).nemkoOfficeItems = stubRows.map(o => ({ id: o.id, title: o.name }));
      (window as any).nemkoDbOfficeRows = stubRows;
      return;
    }

    try {
      const response = await this.apiClient.get(apiUrl, AadHttpClient.configurations.v1);
      if (!response.ok) {
        (window as any).nemkoOfficeItems = stubRows.map(o => ({ id: o.id, title: o.name }));
        (window as any).nemkoDbOfficeRows = stubRows;
        return;
      }
      const json = await response.json();
      const items = json?.data?.items ?? [];
      (window as any).nemkoOfficeItems = items.map((item: any) => ({
        id: String(item.id),
        title: item.name ?? '',
      }));
      (window as any).nemkoDbOfficeRows = items.map((item: any) => ({
        id: String(item.id),
        name: item.name ?? '',
      }));
    } catch (err) {
      console.error('fetchOffices error:', err);
      (window as any).nemkoOfficeItems = stubRows.map(o => ({ id: o.id, title: o.name }));
      (window as any).nemkoDbOfficeRows = stubRows;
    }
  }

  // ── DB Tab: Employees ────────────────────────────────────────────────────────
  private async fetchEmployees(): Promise<void> {
    const apiUrl = 'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/database/employees';

    const stubRows = [
      { id: '1', name: 'Erik Andersen', job_title: 'Senior Test Engineer', subsidiary: 'Nemko AS', manager: 'Lars Eriksen', personal_status: 'Active' },
      { id: '2', name: 'Lars Eriksen', job_title: 'Lab Manager', subsidiary: 'Nemko AS', manager: 'Hans Olsen', personal_status: 'Active' },
      { id: '3', name: 'Ingrid Halvorsen', job_title: 'Project Handler', subsidiary: 'Nemko GmbH', manager: 'Klaus Müller', personal_status: 'Active' },
      { id: '4', name: 'Klaus Müller', job_title: 'Regional Director', subsidiary: 'Nemko GmbH', manager: 'Hans Olsen', personal_status: 'Inactive' },
      { id: '5', name: 'Sofia Lindqvist', job_title: 'Test Associate', subsidiary: 'Nemko AB', manager: 'Erik Andersen', personal_status: 'Active' },
      { id: '6', name: 'Hans Olsen', job_title: 'Chief Technical Officer', subsidiary: 'Nemko AS', manager: '', personal_status: 'Active' },
      { id: '7', name: 'Anna Bergström', job_title: 'Verifier', subsidiary: 'Nemko AB', manager: 'Sofia Lindqvist', personal_status: 'Inactive' },

    ];
    const stubItems = stubRows.map(emp => ({ id: emp.id, title: emp.name }));

    if (!this.apiClient) {
      (window as any).nemkoEmployeeItems = stubItems;
      (window as any).nemkoDbEmployeeRows = stubRows;
      return;
    }

    try {
      const response = await this.apiClient.get(apiUrl, AadHttpClient.configurations.v1);
      if (!response.ok) {
        (window as any).nemkoEmployeeItems = stubItems;
        (window as any).nemkoDbEmployeeRows = stubRows;
        return;
      }
      const json = await response.json();
      const items = json?.data?.items ?? [];
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
      (window as any).nemkoEmployeeItems = stubItems;
      (window as any).nemkoDbEmployeeRows = stubRows;
    }
  }

  // ── Create Standard ──────────────────────────────────────────────────────────
  private async createStandard(): Promise<void> {
    const apiUrl = 'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/database/standards';
    const titleEl = this.domElement.querySelector('#standaredTitle') as HTMLInputElement;
    const icsEl = this.domElement.querySelector('#icsCode') as HTMLInputElement;
    const iafEl = this.domElement.querySelector('#IAF') as HTMLInputElement;
    const naceEl = this.domElement.querySelector('#NACE') as HTMLInputElement;
    const catEl = this.domElement.querySelector('#pdctCategoryStd') as HTMLSelectElement;
    const linkEl = this.domElement.querySelector('#linkToWorkBench') as HTMLInputElement;
    const yesRadio = this.domElement.querySelector('input[name="accreditedRadio"]') as HTMLInputElement;

    try {
      const options: IHttpClientOptions = {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          standardTitle: titleEl?.value?.trim() ?? '',
          icsCode: Number(icsEl?.value) || 0,
          iaf: Number(iafEl?.value) || 0,
          nace: Number(naceEl?.value) || 0,
          productCategoryId: Number(catEl?.value) || 0,
          accreditedStandard: yesRadio?.checked ?? false,
          linkToWorkbench: linkEl?.value?.trim() || null,
        }),
      };
      const response = await this.apiClient.post(apiUrl, AadHttpClient.configurations.v1, options);
      const json = await response.json();
      if (response.ok) {
        this.closeModal('createStandaredModal');
        this.resetStandardModal();
        await this.fetchStandards();
        (window as any)._nemkoAdvSearch?.renderStandards();
      } else {
        alert('Failed: ' + (json?.message ?? 'Unknown error'));
      }
    } catch (err) {
      console.error('createStandard error:', err);
      alert('Network error while creating standard.');
    }
  }

  private resetStandardModal(): void {
    const titleEl = this.domElement.querySelector('#standaredTitle') as HTMLInputElement;
    const icsEl = this.domElement.querySelector('#icsCode') as HTMLInputElement;
    const iafEl = this.domElement.querySelector('#IAF') as HTMLInputElement;
    const naceEl = this.domElement.querySelector('#NACE') as HTMLInputElement;
    const catEl = this.domElement.querySelector('#pdctCategoryStd') as HTMLSelectElement;
    const linkEl = this.domElement.querySelector('#linkToWorkBench') as HTMLInputElement;
    if (titleEl) titleEl.value = '';
    if (icsEl) icsEl.value = '';
    if (iafEl) iafEl.value = '';
    if (naceEl) naceEl.value = '';
    if (catEl) (catEl as HTMLSelectElement).selectedIndex = 0;
    if (linkEl) linkEl.value = '';
    const radios = this.domElement.querySelectorAll('input[name="accreditedRadio"]');
    if (radios[0]) (radios[0] as HTMLInputElement).checked = false;
    if (radios[1]) (radios[1] as HTMLInputElement).checked = true;
  }

  private resetSchemeModal(): void {
    const nameEl = this.domElement.querySelector('#schemeNameIp') as HTMLInputElement;
    const refEl = this.domElement.querySelector('#refStandaredTxtarea') as HTMLTextAreaElement;
    if (nameEl) nameEl.value = '';
    if (refEl) refEl.value = '';
  }

  private resetTestMethodModal(): void {
    const nameEl = this.domElement.querySelector('#methodNameIp') as HTMLInputElement;
    const catEl = this.domElement.querySelector('#pdctCategoryTm') as HTMLSelectElement;
    const refEl = this.domElement.querySelector('#refStandaredTmTxtarea') as HTMLTextAreaElement;
    if (nameEl) nameEl.value = '';
    if (catEl) catEl.selectedIndex = 0;
    if (refEl) refEl.value = '';
  }

  // ── Update Standard ──────────────────────────────────────────────────────────
  private async updateStandard(): Promise<void> {
    const idEl = this.domElement.querySelector('#editStandaredId') as HTMLInputElement;
    const id = idEl?.value;
    if (!id) return;
    const apiUrl = `https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/database/standards/${id}`;
    const titleEl = this.domElement.querySelector('#editStandaredTitle') as HTMLInputElement;
    const icsEl = this.domElement.querySelector('#editIcsCode') as HTMLInputElement;
    const iafEl = this.domElement.querySelector('#editIAF') as HTMLInputElement;
    const naceEl = this.domElement.querySelector('#editNACE') as HTMLInputElement;
    const catEl = this.domElement.querySelector('#editPdctCategoryStd') as HTMLSelectElement;
    const linkEl = this.domElement.querySelector('#editLinkToWorkBench') as HTMLInputElement;
    const yesRadio = this.domElement.querySelector('input[name="editAccreditedRadio"]') as HTMLInputElement;
    try {
      const response = await this.apiClient.fetch(apiUrl, AadHttpClient.configurations.v1, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          standardTitle: titleEl?.value?.trim() ?? '',
          icsCode: Number(icsEl?.value) || 0,
          iaf: Number(iafEl?.value) || 0,
          nace: Number(naceEl?.value) || 0,
          productCategoryId: Number(catEl?.value) || 0,
          accreditedStandard: yesRadio?.checked ?? false,
          linkToWorkbench: linkEl?.value?.trim() || null,
        }),
      });
      const json = await response.json();
      if (response.ok) {
        this.closeModal('editStandaredModal');
        await this.fetchStandards();
        (window as any)._nemkoAdvSearch?.renderStandards();
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
    const apiUrl = `https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/database/scheme/${id}`;
    const nameEl = this.domElement.querySelector('#editSchemeNameIp') as HTMLInputElement;
    const refEl = this.domElement.querySelector('#editRefStandaredTxtarea') as HTMLTextAreaElement;
    try {
      const response = await this.apiClient.fetch(apiUrl, AadHttpClient.configurations.v1, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameEl?.value?.trim() ?? '',
          referenceStandard: refEl?.value?.trim() ?? '',
        }),
      });
      const json = await response.json();
      if (response.ok) {
        this.closeModal('editSchemeModal');
        await this.fetchSchemes();
        (window as any)._nemkoAdvSearch?.renderSchemes();
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
    const apiUrl = `https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/database/test-methods/${id}`;
    const nameEl = this.domElement.querySelector('#editMethodNameIp') as HTMLInputElement;
    const catEl = this.domElement.querySelector('#editPdctCategoryTm') as HTMLSelectElement;
    const refEl = this.domElement.querySelector('#editRefStandaredTmTxtarea') as HTMLTextAreaElement;
    try {
      const response = await this.apiClient.fetch(apiUrl, AadHttpClient.configurations.v1, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameEl?.value?.trim() ?? '',
          productCategory: Number(catEl?.value) || 0,
          referenceStandard: refEl?.value?.trim() ?? '',
        }),
      });
      const json = await response.json();
      if (response.ok) {
        this.closeModal('editTestmethodModal');
        await this.fetchTestMethods();
        (window as any)._nemkoAdvSearch?.renderTestMethods();
      } else {
        alert('Failed: ' + (json?.message ?? 'Unknown error'));
      }
    } catch (err) {
      console.error('updateTestMethod error:', err);
      alert('Network error while updating test method.');
    }
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
    (window as any).nemkoFetchSchemeDetails     = (id: string): Promise<void> => this.fetchSchemeDetails(id);
    (window as any).nemkoFetchTestMethodDetails = (id: string): Promise<void> => this.fetchTestMethodDetails(id);

    const createStdBtn = this.domElement.querySelector('#createStandaredModal .nemko-btn-save');
    if (createStdBtn) createStdBtn.addEventListener('click', () => this.createStandard());

    const createSchemeBtn = this.domElement.querySelector('#createSchemeModal .nemko-btn-save');
    if (createSchemeBtn) createSchemeBtn.addEventListener('click', () => this.createScheme());

    const createTmBtn = this.domElement.querySelector('#createTestmethodModal .nemko-btn-save');
    if (createTmBtn) createTmBtn.addEventListener('click', () => this.createTestMethod());

    const createStdModal = this.domElement.querySelector('#createStandaredModal');
    if (createStdModal) createStdModal.addEventListener('show.bs.modal', () => this.resetStandardModal());

    const createSchemeModal = this.domElement.querySelector('#createSchemeModal');
    if (createSchemeModal) createSchemeModal.addEventListener('show.bs.modal', () => this.resetSchemeModal());

    const createTmModal = this.domElement.querySelector('#createTestmethodModal');
    if (createTmModal) createTmModal.addEventListener('show.bs.modal', () => this.resetTestMethodModal());

    const editStdSaveBtn = this.domElement.querySelector('#editStandaredSaveBtn');
    if (editStdSaveBtn) editStdSaveBtn.addEventListener('click', () => this.updateStandard());

    const editSchemeSaveBtn = this.domElement.querySelector('#editSchemeSaveBtn');
    if (editSchemeSaveBtn) editSchemeSaveBtn.addEventListener('click', () => this.updateScheme());

    const editTmSaveBtn = this.domElement.querySelector('#editTestmethodSaveBtn');
    if (editTmSaveBtn) editTmSaveBtn.addEventListener('click', () => this.updateTestMethod());

    this.domElement.addEventListener('click', function (e: Event) {
      const target = e.target as HTMLElement;
      if (!target.closest('.import-trigger-btn')) return;
      e.preventDefault();
      self.resetImportModal();
      self.openModal('editTempDocModal');
    });

    const templateSelect = this.domElement.querySelector('#import-template-select') as HTMLSelectElement;
    if (templateSelect) {
      templateSelect.addEventListener('change', function () {
        if (!templateSelect.value) return;
        self.closeModal('editTempDocModal');
        self.openModal('informationModal');
      });
    }

    const infoOkBtn = this.domElement.querySelector('#info-modal-ok-btn');
    if (infoOkBtn) {
      infoOkBtn.addEventListener('click', function () {
        self.closeModal('informationModal');
        self.openModal('editTempDocModal');
      });
    }

    this.domElement.addEventListener('click', function (e: Event) {
      const target = e.target as HTMLElement;
      if (!target.closest('.info-modal-dismiss-btn')) return;
      self.closeModal('informationModal');
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
    const sel = this.domElement.querySelector('#import-template-select') as HTMLSelectElement;
    if (sel) sel.selectedIndex = 0;
    const nameInput = this.domElement.querySelector('#tempNameIp') as HTMLInputElement;
    if (nameInput) nameInput.value = '';
    const fileNameDisplay = this.domElement.querySelector('#editTempDocModal .form-control[disabled]') as HTMLInputElement;
    if (fileNameDisplay) fileNameDisplay.value = '';
    const fileInput = this.domElement.querySelector('#editTempDocModal input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
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



  private loadCSS(): void {
    SPComponentLoader.loadCss(`${this.siteUrl}/SiteAssets/resources/css/jquery-ui.css`);
    SPComponentLoader.loadCss(`${this.siteUrl}/SiteAssets/resources/css/qualification-db.css`);
    SPComponentLoader.loadCss(`${this.siteUrl}/SiteAssets/resources/css/nemko-modal.css`);
  }

  private loadHomeScripts(): void {
    const siteAssetsUrl = `${this.siteUrl}/SiteAssets`;
    const cacheBust = `?v=${Date.now()}`;

    this.fetchQualifications()
      .then(() => this.fetchStandards())
      .then(() => this.fetchSchemes())
      .then(() => this.fetchTestMethods())
      .then(() => this.fetchProductCategories())
      .then(() => { this.populateCategoryDropdowns(); })
      .then(() => this.fetchOffices())
      .then(() => this.fetchEmployees())
      .then(() => SPComponentLoader.loadScript(`${siteAssetsUrl}/resources/js/jquery-ui.js`))
      .then(() => SPComponentLoader.loadScript(
        `${siteAssetsUrl}/resources/js/advanced-search.js${cacheBust}`
      ))
      .then(() => {
        if (typeof (window as any).initAdvancedSearch === 'function') {
          console.log('[NEMKO] calling initAdvancedSearch');
          (window as any).initAdvancedSearch();
        } else {
          console.error('[NEMKO] initAdvancedSearch not found on window');
        }
      })
      .catch(err => console.error('JS Load Error:', err));
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