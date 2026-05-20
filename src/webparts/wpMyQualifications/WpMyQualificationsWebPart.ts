import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import {  AadHttpClient } from '@microsoft/sp-http';
import MyQualifications from './MyQualificationsUi';
import * as strings from 'WpMyQualificationsWebPartStrings';
import { SPComponentLoader } from '@microsoft/sp-loader';
import SharedSidebar from '../../SharedSidebar';

export interface IWpMyQualificationsWebPartProps {
  description: string;
}

export default class WpMyQualificationsWebPart extends BaseClientSideWebPart<IWpMyQualificationsWebPartProps> {
  private siteUrl: string = '';
  private apiClient!: AadHttpClient;

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

    setTimeout(() => {
      SharedSidebar.initBehavior(this.domElement, this.siteUrl);
    }, 300);

    this.bindQualificationEvents();
  }

  protected onInit(): Promise<void> {
    this.siteUrl = this.context.pageContext.web.absoluteUrl;
    this.loadCSS();

    window.onpopstate = () => {
      this.render();
    };

    return this.context.aadHttpClientFactory
      .getClient('api://66eda48a-d5f9-4db0-a911-0d936f8ce92b')
      .then(client => { this.apiClient = client; })
      .catch(err => console.error('[NEMKO] AAD client init failed:', err));
  }

  private async fetchQualifications(): Promise<void> {
    const apiUrl = 'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/qualifications/authorized';

    const dummyRows = [
      { id: '1', qualifications: 'IEC 60065',       level: '3 - Verifier',          verifiedBy: 'John Smith',   active: 'Yes', limitations: 'None',    report: 'Yes', certification: 'No',  conformity: 'Yes', remarks: '', targetDate: '', qualifiedDate: '', authorizedBy: '', actions: 'Edit' },
      { id: '2', qualifications: 'EN 55032',         level: '2 - Project Handler',   verifiedBy: 'Maria Garcia', active: 'Yes', limitations: 'Lab only', report: 'No',  certification: 'Yes', conformity: 'No',  remarks: '', targetDate: '', qualifiedDate: '', authorizedBy: '', actions: 'View Details' },
      { id: '3', qualifications: 'ISO 9001:2015',    level: '4 - Verifier Assessor', verifiedBy: 'Abel Curup',   active: 'No',  limitations: 'Scope A', report: 'Yes', certification: 'Yes', conformity: 'Yes', remarks: '', targetDate: '', qualifiedDate: '', authorizedBy: '', actions:  'Withdraw' },
    ];

    if (!this.apiClient) {
      (window as any).nemkoTableRows = dummyRows;
      return;
    }

    try {
      const response = await this.apiClient.get(apiUrl, AadHttpClient.configurations.v1);
      if (!response.ok) {
        (window as any).nemkoTableRows = dummyRows;
        return;
      }
      const json = await response.json();
      const items = json?.data?.items ?? [];
      (window as any).nemkoTableRows = items.length
        ? items.map((item: any) => ({
            id: String(item.id),
            qualifications: item.title ?? '',
            level: item.level ?? '',
            verifiedBy: item.verifiedBy ?? '',
            active: item.active ?? '',
            limitations: item.limitations ?? '',
            report: item.reportApprover ?? '',
            certification: item.certificationDecision ?? '',
            conformity: item.conformityStatement ?? '',
            remarks: item.remarks ?? '',
            targetDate: item.targetAchieveDate ?? '',
            qualifiedDate: item.qualifiedDate ?? '',
            authorizedBy: item.authorizedBy ?? '',
            actions: item.actions ?? ['View Details', 'Edit'],
          }))
        : dummyRows;
    } catch (err) {
      console.error('fetchQualifications error:', err);
      (window as any).nemkoTableRows = dummyRows;
    }
  }

  private async fetchRequestedQualifications(): Promise<void> {
    const apiUrl = 'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/qualifications/requested';

    const dummyRows = [
      { id: '4', qualifications: 'AECTP 500:2016', level: '1 - Test Associate', verifiedBy: 'Sohana Khan', rejectedDate: '',           remarks: '', limitations: '', targetDate: '', qualifiedDate: '', authorizedBy: '', actions: 'Edit' },
      { id: '5', qualifications: 'EN 71-1',         level: 'Employee',           verifiedBy: 'Abyss Lu',    rejectedDate: '15-03-2026', remarks: '', limitations: '', targetDate: '', qualifiedDate: '', authorizedBy: '', actions: 'View Details' },
    ];

    if (!this.apiClient) {
      (window as any).nemkoRequestedRows = dummyRows;
      return;
    }

    try {
      const response = await this.apiClient.get(apiUrl, AadHttpClient.configurations.v1);
      if (!response.ok) {
        (window as any).nemkoRequestedRows = dummyRows;
        return;
      }
      const json = await response.json();
      const items = json?.data?.items ?? [];
      (window as any).nemkoRequestedRows = items.length
        ? items.map((item: any) => ({
            id: String(item.id),
            qualifications: item.title ?? '',
            level: item.level ?? '',
            verifiedBy: item.verifiedBy ?? '',
            rejectedDate: item.rejectedDate ?? '',
            remarks: item.remarks ?? '',
            limitations: item.limitations ?? '',
            targetDate: item.targetAchieveDate ?? '',
            qualifiedDate: item.qualifiedDate ?? '',
            authorizedBy: item.authorizedBy ?? '',
            actions: item.actions ?? ['View Details', 'Edit'],
          }))
        : dummyRows;
    } catch (err) {
      console.error('fetchRequestedQualifications error:', err);
      (window as any).nemkoRequestedRows = dummyRows;
    }
  }

  private async fetchQualificationDetails(id: string): Promise<void> {
  const apiUrl = `https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/qualifications/${id}`;

  const dummyDetails: Record<string, any> = {
    '1': {
      qualificationId: 'QID-001',
      qualificationStatus: { value: 'Approved' },
      toBeVerifiedBy:  { name: 'John Smith',   email: 'john.smith@nemko.com' },
      verifiedBy:      { name: 'John Smith',   email: 'john.smith@nemko.com' },
      authorizedBy:    { name: 'Abel Curup',   email: 'abel.curup@nemko.com' },
      authorizedDate:  '2025-03-10',
      qualificationReference: { value: 'IEC 60065' },
      level:           { value: '3 - Verifier' },
      conformityStatement: 'Yes',
      reportApprover:  'Yes',
      remarks:         'Verified with full scope.',
      limitations:     'None',
    },
    '2': {
      qualificationId: 'QID-002',
      qualificationStatus: { value: 'Approved' },
      toBeVerifiedBy:  { name: 'Maria Garcia', email: 'maria.garcia@nemko.com' },
      verifiedBy:      { name: 'Maria Garcia', email: 'maria.garcia@nemko.com' },
      authorizedBy:    { name: 'John Smith',   email: 'john.smith@nemko.com' },
      authorizedDate:  '2025-06-01',
      qualificationReference: { value: 'EN 55032' },
      level:           { value: '2 - Project Handler' },
      conformityStatement: 'No',
      reportApprover:  'No',
      remarks:         'Lab access only.',
      limitations:     'Lab only',
    },
    '3': {
      qualificationId: 'QID-003',
      qualificationStatus: { value: 'Rejected' },
      toBeVerifiedBy:  { name: 'Abel Curup',   email: 'abel.curup@nemko.com' },
      verifiedBy:      { name: 'Abel Curup',   email: 'abel.curup@nemko.com' },
      authorizedBy:    { name: 'Sohana Khan',  email: 'sohana.khan@nemko.com' },
      authorizedDate:  '2025-01-15',
      qualificationReference: { value: 'ISO 9001:2015' },
      level:           { value: '4 - Verifier Assessor' },
      conformityStatement: 'Yes',
      reportApprover:  'Yes',
      remarks:         'Scope A only.',
      limitations:     'Scope A',
    },
    '4': {
      qualificationId: 'QID-004',
      qualificationStatus: { value: 'Pending' },
      toBeVerifiedBy:  { name: 'Sohana Khan',  email: 'sohana.khan@nemko.com' },
      verifiedBy:      { name: 'Sohana Khan',  email: 'sohana.khan@nemko.com' },
      authorizedBy:    { name: 'John Smith',   email: 'john.smith@nemko.com' },
      authorizedDate:  '',
      qualificationReference: { value: 'AECTP 500:2016' },
      level:           { value: '1 - Test Associate' },
      conformityStatement: 'No',
      reportApprover:  'No',
      remarks:         '',
      limitations:     '',
    },
    '5': {
      qualificationId: 'QID-005',
      qualificationStatus: { value: 'Rejected' },
      toBeVerifiedBy:  { name: 'Abyss Lu',     email: 'abyss.lu@nemko.com' },
      verifiedBy:      { name: 'Abyss Lu',     email: 'abyss.lu@nemko.com' },
      authorizedBy:    { name: 'Maria Garcia', email: 'maria.garcia@nemko.com' },
      authorizedDate:  '2026-03-15',
      qualificationReference: { value: 'EN 71-1' },
      level:           { value: 'Employee' },
      conformityStatement: 'No',
      reportApprover:  'No',
      remarks:         '',
      limitations:     '',
    },
  };

  if (!this.apiClient) {
    (window as any).nemkoQualificationDetail = dummyDetails[id] ?? null;
    return;
  }

  try {
    const response = await this.apiClient.get(apiUrl, AadHttpClient.configurations.v1);
    if (!response.ok) {
      (window as any).nemkoQualificationDetail = dummyDetails[id] ?? null;
      return;
    }
    const json = await response.json();
    (window as any).nemkoQualificationDetail = json?.data ?? null;
  } catch (err) {
    console.error('fetchQualificationDetails error:', err);
    (window as any).nemkoQualificationDetail = dummyDetails[id] ?? null;
  }
}

  private async updateQualification(): Promise<void> {
    const modal = this.domElement.querySelector('#editQualificationModal') as HTMLElement;
    if (!modal) return;
    const id = (modal as any)._editItemId;
    if (!id) return;

    const apiUrl = `https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/qualifications/${id}`;

    const remarksEl     = modal.querySelector('#editRemarksTxtarea')     as HTMLTextAreaElement;
    const limitationsEl = modal.querySelector('#editLimitationsTxtarea') as HTMLTextAreaElement;
    const targetDateEl  = modal.querySelector('#editTargetAchieveDate')  as HTMLInputElement;
    const qualifiedEl   = modal.querySelector('#editQualifiedDate')      as HTMLInputElement;
    const verifiedEl    = modal.querySelector('#editToBeVerifiedByIp')   as HTMLInputElement;
    const authorizedEl  = modal.querySelector('#editToBeAuthorizedByIp') as HTMLInputElement;
    // Use the UPDATED level radio for the API payload
    const levelRadio    = modal.querySelector('input[name="editQualificationLevelUpdated"]:checked') as HTMLInputElement;

    try {
      const response = await this.apiClient.fetch(apiUrl, AadHttpClient.configurations.v1, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remarks:            remarksEl?.value?.trim()     ?? '',
          limitations:        limitationsEl?.value?.trim() ?? '',
          targetAchieveDate:  targetDateEl?.value          ?? '',
          qualifiedDate:      qualifiedEl?.value           ?? '',
          toBeVerifiedBy:     verifiedEl?.value?.trim()    ?? '',
          toBeAuthorizedBy:   authorizedEl?.value?.trim()  ?? '',
          qualificationLevel: levelRadio?.value            ?? '',
        }),
      });
      const json = await response.json();
      if (response.ok) {
        this.closeModal('editQualificationModal');
        await this.fetchQualifications();
        await this.fetchRequestedQualifications();
        if (typeof (window as any).initMyQualifications === 'function') {
          (window as any).initMyQualifications();
        }
      } else {
        alert('Failed: ' + (json?.message ?? 'Unknown error'));
      }
    } catch (err) {
      console.error('updateQualification error:', err);
      alert('Network error while updating qualification.');
    }
  }

private bindQualificationEvents(): void {
  const updateBtn = this.domElement.querySelector('#editQualificationModal .nemko-btn-save');
  if (updateBtn) {
    updateBtn.addEventListener('click', () => this.updateQualification());
  }

  (window as any).nemkoOpenModal  = (id: string) => this.openModal(id);
  (window as any).nemkoCloseModal = (id: string) => this.closeModal(id);

  (window as any).nemkoGetModalElement = (id: string): HTMLElement | null =>
    this.domElement.querySelector('#' + id) as HTMLElement | null;

  (window as any).nemkoFetchQualificationDetails = (id: string): Promise<void> =>
    this.fetchQualificationDetails(id);
}


  private async fetchStandards(): Promise<void> {
    (window as any).nemkoStandardItems = [
      { id: 1, title: '16 CFR Part 1263' },
      { id: 2, title: 'ASTM F963' },
      { id: 3, title: 'EN 71-1' },
      { id: 4, title: 'IEC 60065' },
      { id: 5, title: 'ISO 9001:2015' },
    ];
  }

  private async fetchEmployees(): Promise<void> {
    (window as any).nemkoEmployeeItems = [
      { id: 1, title: 'Abel Curup' },
      { id: 2, title: 'Abyss Lu' },
      { id: 3, title: 'John Smith' },
      { id: 4, title: 'Maria Garcia' },
      { id: 5, title: 'Sohana Khan' },
    ];
  }

  private loadCSS(): void {
    SPComponentLoader.loadCss(`${this.siteUrl}/SiteAssets/resources/css/jquery-ui.css`);
    SPComponentLoader.loadCss(`${this.siteUrl}/SiteAssets/resources/css/nemko-modal.css`);

    setTimeout(() => this.loadHomeScripts(), 800);
  }

  private loadHomeScripts(): void {
    const siteAssetsUrl = `${this.siteUrl}/SiteAssets`;

    this.fetchQualifications()
      .then(() => this.fetchRequestedQualifications())
      .then(() => this.fetchStandards())
      .then(() => this.fetchEmployees())
      .then(() => SPComponentLoader.loadScript(`${siteAssetsUrl}/resources/js/jquery-ui.js`))
      .then(() => SPComponentLoader.loadScript(`${siteAssetsUrl}/resources/js/my-qualifications.js`))
      .then(() => {
        if (typeof (window as any).initMyQualifications === 'function') {
          console.log('[NEMKO] calling initMyQualifications directly');
          (window as any).initMyQualifications();
        } else {
          setTimeout(() => {
            if (typeof (window as any).initMyQualifications === 'function') {
              console.log('[NEMKO] calling initMyQualifications (delayed)');
              (window as any).initMyQualifications();
            } else {
              console.error('[NEMKO] initMyQualifications still not found after delay');
            }
          }, 100);
        }
        const params = new URLSearchParams(window.location.search);
        if (params.get('modal') === 'addQualification') {
          const btn = this.domElement.querySelector('[data-bs-target="#addQualificationModal"]') as HTMLElement;
          if (btn) {
            setTimeout(() => {
              btn.click();
              const url = new URL(window.location.href);
              url.searchParams.delete('modal');
              window.history.replaceState({}, '', url.toString());
            }, 300);
          }
        }
      })
      .catch(err => console.error('JS Load Error:', err));
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