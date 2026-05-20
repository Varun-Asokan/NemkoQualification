import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPComponentLoader } from '@microsoft/sp-loader';
// import { AadHttpClient, HttpClientResponse } from '@microsoft/sp-http';

import * as strings from 'WpEmployeesWebPartStrings';
import employees from './Employees';
import SharedSidebar from '../../SharedSidebar';

export interface IWpEmployeesWebPartProps {
  description: string;
}

// ─── API shape ────────────────────────────────────────────────────────────────

// interface IEmployeeApiItem {
//   id: number;
//   name: string;
//   personalStatus: string;
//   office: string;
//   approvalManager: string;
//   directManager: string;
//   localGM: string;
//   qualityManager: string;
//   hrContact: string;
//   email: string;
//   directManagerEmail: string;
//   location: string;
//   employeeType: string;
// }

// interface IEmployeeApiResponse {
//   statusCode: number;
//   status: string;
//   message: string;
//   data: {
//     items: IEmployeeApiItem[];
//   };
// }

// ─── Internal row shape  ───────────────────

interface IEmployeeRow {
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
}

// ─── Table config shape (mirrors Employees.js `tables` object) ───────────────

interface IColumnDef {
  key: string;
  label: string;
  sortable: boolean;
  visible: boolean;
  dropdown: boolean;
}

interface ITableConfig {
  tableSelector: string;
  dropdownId: string;
  sortState: { key: string | null; direction: string };
  columns: IColumnDef[];
  filterKeys: string[];
  rows: IEmployeeRow[];
  _allRows?: IEmployeeRow[];
  editingIndex: number;
}

// ─── Dummy rows — edit here to change what shows while the API is wired up ───

const DUMMY_ROWS: IEmployeeRow[] = [
  {
    name: 'John Doe',
    personal_status: 'Active',
    office: 'Oslo',
    approval_manager: 'Jane Smith',
    direct_manager: 'Bob Johnson',
    localGM: 'Alice Brown',
    quality_manager: 'Charlie Wilson',
    HR_contact: 'Diana Prince',
    email: 'john.doe@nemko.com',
    direct_manager_email: 'bob.johnson@nemko.com',
    location: 'Norway',
    employee_type: 'Permanent',
  },
  {
    name: 'Sara Lee',
    personal_status: 'Active',
    office: 'Stockholm',
    approval_manager: 'Tom Hardy',
    direct_manager: 'Jane Smith',
    localGM: 'Alice Brown',
    quality_manager: 'Charlie Wilson',
    HR_contact: 'Diana Prince',
    email: 'sara.lee@nemko.com',
    direct_manager_email: 'jane.smith@nemko.com',
    location: 'Sweden',
    employee_type: 'Permanent',
  },
  {
    name: 'Erik Hansen',
    personal_status: 'Retired',
    office: 'Copenhagen',
    approval_manager: 'Tom Hardy',
    direct_manager: 'Bob Johnson',
    localGM: 'Alice Brown',
    quality_manager: 'Charlie Wilson',
    HR_contact: 'Diana Prince',
    email: 'erik.hansen@nemko.com',
    direct_manager_email: 'bob.johnson@nemko.com',
    location: 'Denmark',
    employee_type: 'Non-Employee',
  },
];

// ─── Table config — edit columns/filterKeys here if the schema changes ────────

const TABLE_CONFIG: Record<string, ITableConfig> = {
  'employees-table': {
    tableSelector: '.nemko-table-container .table',
    dropdownId: 'employees-col-visibility',
    sortState: { key: null, direction: 'default' },
    columns: [
      { key: 'name', label: 'Name', sortable: false, visible: true, dropdown: false },
      { key: 'personal_status', label: 'Personal Status', sortable: false, visible: true, dropdown: false },
      { key: 'office', label: 'Office', sortable: false, visible: true, dropdown: false },
      { key: 'approval_manager', label: 'Approval Manager', sortable: false, visible: true, dropdown: false },
      { key: 'direct_manager', label: 'Direct Manager', sortable: false, visible: true, dropdown: false },
      { key: 'localGM', label: 'local GM', sortable: false, visible: true, dropdown: false },
      { key: 'quality_manager', label: 'Quality Manager', sortable: false, visible: true, dropdown: false },
      { key: 'HR_contact', label: 'HR contact', sortable: false, visible: true, dropdown: false },
    ],
    filterKeys: [
      'name',
      'quality_manager',
      'personal_status',
      'HR_contact',
      'office',
      'approval_manager',
      'direct_manager',
      'localGM',
    ],
    rows: [],
    editingIndex: -1,
  },
};

// ─── WebPart ──────────────────────────────────────────────────────────────────

export default class WpEmployeesWebPart extends BaseClientSideWebPart<IWpEmployeesWebPartProps> {

  // private static readonly APP_ID_URI = 'api://66eda48a-d5f9-4db0-a911-0d936f8ce92b';

  // private static readonly API_URL =
  // 'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/admin/employees';

  private siteUrl: string = '';

  // ─── Render ──────────────────────────────────────────────────────────────────

  public render(): void {
    const workbench = document.getElementById('workbenchPageContent');
    if (workbench) workbench.style.maxWidth = 'none';

    const resourceUrl = `${this.siteUrl}/SiteAssets`;

    this.domElement.innerHTML =
      SharedSidebar.getHtml({
        resourceUrl,
        siteUrl: this.siteUrl,
        activeNavItem: '',
        activeTabId: '',
      }) +
      employees.allElementsHtml;

    // Reset modal listener guards so Employees.js re-attaches on re-render
    ['empNewModal', 'empEditModal'].forEach(id => {
      const existing = document.getElementById(id);
      if (existing) {
        delete existing.dataset.newListenerFor;
        delete existing.dataset.editListenerFor;
      }
    });

    this.moveModalsToBody();
    this.loadCss();
    this.publishTableConfig(TABLE_CONFIG);

    // ── API call hidden for now — using dummy data directly ──────────────────
    this.publishRows(DUMMY_ROWS);
    SharedSidebar.initBehavior(this.domElement, this.siteUrl);
    this.loadScripts();

    // ── Uncomment below when the AAD app registration is fixed in this tenant ─
    // this.fetchEmployees()
    //   .then((rows: IEmployeeRow[]) => {
    //     this.publishRows(rows.length ? rows : DUMMY_ROWS);
    //     return this.loadScripts();
    //   })
    //   .catch((err: unknown) => {
    //     console.warn('[WpEmployees] API fetch failed, using dummy data:', err);
    //     this.publishRows(DUMMY_ROWS);
    //     return this.loadScripts();
    //   });
  }

  // ─── Window helpers ───────────────────────────────────────────────────────────

  /**
   * Puts the full table config (columns, filterKeys, sortState, etc.) on window
   * so Employees.js reads it instead of defining its own hard-coded copy.
   */
  private publishTableConfig(config: Record<string, ITableConfig>): void {
    // Deep-clone so Employees.js mutations don't affect our source object
    (window as Window & { __employeeTableConfig?: Record<string, ITableConfig> })
      .__employeeTableConfig = JSON.parse(JSON.stringify(config));
  }

  /**
   * Pushes the row array to window and, if Employees.js is already loaded,
   * triggers an immediate re-render via the reload hook.
   */
  private publishRows(rows: IEmployeeRow[]): void {
    (window as Window & { __employeeTableData?: IEmployeeRow[] })
      .__employeeTableData = rows;

    // Also hydrate the live config object so Employees.js sees the rows
    // even when the script has already run (e.g. cached on re-render)
    const liveConfig = (window as Window & { __employeeTableConfig?: Record<string, ITableConfig> })
      .__employeeTableConfig;

    if (liveConfig) {
      Object.keys(liveConfig).forEach(tabId => {
        liveConfig[tabId].rows = [...rows];
        liveConfig[tabId]._allRows = [...rows];
      });
    }
  }

  // ─── Modal move ───────────────────────────────────────────────────────────────

  private moveModalsToBody(): void {
    ['empNewModal', 'empEditModal'].forEach(id => {
      // Remove any previously moved copy sitting directly under <body>
      // (not the one still inside this.domElement which we are about to move)
      const existing = document.getElementById(id);
      if (existing && !this.domElement.contains(existing)) {
        existing.remove();
      }

      // Move the freshly-rendered modal out of the SPFx shadow into <body>
      // so Bootstrap can position/scroll it correctly.
      const modal = this.domElement.querySelector(`#${id}`);
      if (modal) document.body.appendChild(modal);
    });
  }

  // ─── Authenticated API fetch ──────────────────────────────────────────────────

  // private async fetchEmployees(): Promise<IEmployeeRow[]> {
  //   const client: AadHttpClient =
  //     await this.context.aadHttpClientFactory.getClient(
  //       WpEmployeesWebPart.APP_ID_URI
  //     );

  //   const response: HttpClientResponse = await client.get(
  //     WpEmployeesWebPart.API_URL,
  //     AadHttpClient.configurations.v1
  //   );

  //   if (!response.ok) {
  //     throw new Error(`API error ${response.status}: ${response.statusText}`);
  //   }

  //   const json: IEmployeeApiResponse = await response.json();

  //   if (!json?.data?.items?.length) return [];

  //   return json.data.items.map((item: IEmployeeApiItem): IEmployeeRow => ({
  //     name:                 item.name               ?? '',
  //     personal_status:      item.personalStatus     ?? '',
  //     office:               item.office             ?? '',
  //     approval_manager:     item.approvalManager    ?? '',
  //     direct_manager:       item.directManager      ?? '',
  //     localGM:              item.localGM            ?? '',
  //     quality_manager:      item.qualityManager     ?? '',
  //     HR_contact:           item.hrContact          ?? '',
  //     email:                item.email              ?? '',
  //     direct_manager_email: item.directManagerEmail ?? '',
  //     location:             item.location           ?? '',
  //     employee_type:        item.employeeType       ?? '',
  //   }));
  // }

  // ─── CSS / JS loaders ────────────────────────────────────────────────────────

  private initWhenReady(): void {
    if ((window as any).bootstrap) {
      SharedSidebar.initBehavior(this.domElement, this.siteUrl);
      return;
    }
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if ((window as any).bootstrap || attempts > 20) {
        clearInterval(interval);
        SharedSidebar.initBehavior(this.domElement, this.siteUrl);
      }
    }, 100);
  }

  private loadCss(): void {
    const base = `${this.siteUrl}/SiteAssets/resources/css`;
    SPComponentLoader.loadCss(`${base}/employees.css`);
  }

  private loadScripts(): Promise<void> {
    const base = `${this.siteUrl}/SiteAssets/resources/js`;

    return SPComponentLoader.loadScript(`${base}/jquery-3.6.0.js`, { globalExportsName: 'jQuery' })
      .then(() => SPComponentLoader.loadScript(`${base}/bootstrap.bundle.min.js`, { globalExportsName: 'bootstrap' }))
      .then(() => {
        // SPFx require.js won't set window.bootstrap — grab it from require cache
        const w = window as any;
        if (!w.bootstrap) {
          // Bootstrap 5 bundle registers as 'bootstrap' in AMD/require
          try {
            w.bootstrap = (window as any).require('bootstrap');
            console.log('[WpEmployees] bootstrap loaded via require:', !!w.bootstrap?.Modal);
          } catch {
            console.warn('[WpEmployees] bootstrap not in require cache either — using manual modal fallback');
          }
        }
        this.registerModalHelpers();
      })
      .then(() => SPComponentLoader.loadScript(`${base}/Employees.js`))
      .then(() => {
        // Clear guards on BODY-level modals
        ['empNewModal', 'empEditModal'].forEach(id => {
          const el = document.getElementById(id);
          if (el) {
            delete el.dataset.newListenerFor;
            delete el.dataset.editListenerFor;
          }
        });

        const w = window as Window & {
          __initEmployeeTables?: () => void;
          __reloadEmployeeTable?: () => void;
        };

        if (typeof w.__reloadEmployeeTable === 'function') w.__reloadEmployeeTable();
        if (typeof w.__initEmployeeTables === 'function') w.__initEmployeeTables();

        // ↓ Re-init sidebar now that Bootstrap is confirmed loaded
        this.initWhenReady();
      })
      .catch((err: unknown) => {
        console.error('[WpEmployees] Script load error:', err);
      }) as Promise<void>;
  }

  // ─── Bootstrap modal helpers ──────────────────────────────────────────────────

  private registerModalHelpers(): void {
    type ModalWindow = Window & {
      showModal?: (id: string) => void;
      hideModal?: (id: string) => void;
      __modalHelpersRegistered?: boolean;
    };

    const w = window as ModalWindow & { [key: string]: any };

    // ── Only register once across SPFx re-renders ──────────────────────────
    if (w.__modalHelpersRegistered) return;
    w.__modalHelpersRegistered = true;

    w.showModal = (id: string) => {
      const el = document.getElementById(id);
      if (!el) { console.error('[WpEmployees] Modal not found:', id); return; }

      const bs = w.bootstrap;
      if (bs?.Modal) {
        const instance = bs.Modal.getOrCreateInstance(el);
        (el as any)._bsModal = instance;
        instance.show();
        return;
      }

      // Manual fallback
      el.style.display = 'block';
      el.classList.add('show');
      el.removeAttribute('aria-hidden');
      el.setAttribute('aria-modal', 'true');
      document.body.classList.add('modal-open');

      let bd = document.getElementById('nemko-modal-backdrop');
      if (!bd) {
        bd = document.createElement('div');
        bd.id = 'nemko-modal-backdrop';
        bd.className = 'modal-backdrop fade show';
        document.body.appendChild(bd);
      }
    };

    w.hideModal = (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;

      const bs = w.bootstrap;
      if (bs?.Modal) {
        bs.Modal.getOrCreateInstance(el).hide();
        return;
      }

      // Manual fallback
      el.style.display = 'none';
      el.classList.remove('show');
      el.setAttribute('aria-hidden', 'true');
      el.removeAttribute('aria-modal');
      document.body.classList.remove('modal-open');

      const bd = document.getElementById('nemko-modal-backdrop');
      if (bd) bd.remove();

      // Fire event so Employees.js hidden.bs.modal listeners still trigger
      el.dispatchEvent(new Event('hidden.bs.modal'));
    };

    // ── Handle data-bs-dismiss="modal" (close/cancel buttons) ─────────────
    document.addEventListener('click', function (e) {
      const target = e.target as HTMLElement;
      const dismissBtn = target.closest('[data-bs-dismiss="modal"]');
      if (!dismissBtn) return;

      const modal = (dismissBtn as HTMLElement).closest('.modal');
      if (!modal) return;

      if (typeof w.hideModal === 'function') {
        w.hideModal(modal.id);
      }
    }, true);
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────────

  protected onInit(): Promise<void> {
    this.siteUrl = this.context.pageContext.web.absoluteUrl;
    this.registerModalHelpers();
    return Promise.resolve();
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  // ─── Property pane ───────────────────────────────────────────────────────────

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [{
        header: { description: strings.PropertyPaneDescription },
        groups: [{
          groupName: strings.BasicGroupName,
          groupFields: [
            PropertyPaneTextField('description', {
              label: strings.DescriptionFieldLabel
            })
          ]
        }]
      }]
    };
  }
}