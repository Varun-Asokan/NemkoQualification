import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPComponentLoader } from '@microsoft/sp-loader';
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
  Employee: string;
  Qualification: string;
  Level: string;
  TargetDate: string;
  Authorizer: string;
  VerifiedBy: string;
  Status: string; // 'Pending' | 'Verified' | 'Rejected'
}

interface IAuthorizationRow {
  Id: number;
  QualificationId: string;
  Employee: string;
  Qualification: string;
  Level: string;
  TargetDate: string;
  VerifiedBy: string;
  Status: string; // 'Pending' | 'Authorized' | 'Rejected'
}

interface IAuditEntry {
  timestamp: string;
  userId: string;
  action: string;
  targets: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SUPER_USERS: string[] = ['juan.gonzalez@nemko.com', 'stuart.beck@nemko.com'];

const REQUIRED_IMPORT_HEADERS: string[] = [
  'E-mail',
  'Requester Office',
  'Qualification Type',
  'Verified By Email',
  'Authorized By Email',
  'Is Approved',
  'Is Rejected',
  'Qualification',
  'Qualification Level',
  'Name Level',
  'Date'
];

// ─── WebPart ──────────────────────────────────────────────────────────────────

export default class WpVerificationAndAuthorizationWebPart
  extends BaseClientSideWebPart<IWpVerificationAndAuthorizationWebPartProps> {

  // ── State ──────────────────────────────────────────────────────────────────
  private siteUrl: string = '';
  private currentUserEmail: string = '';

  private verificationRows: IVerificationRow[] = [];
  private authorizationRows: IAuthorizationRow[] = [];
  private auditLog: IAuditEntry[] = [];

  private currentMainTab: string = 'verification'; // 'verification' | 'authorization'
  private currentSubTab: string = 'pending';        // 'pending' | 'mine'
  private verSearchQuery: string = '';
  private authSearchQuery: string = '';

  /** Per-tab column visibility: key = `${tabKey}_${colKey}`, value = boolean */
  private colVisibility: { [key: string]: boolean } = {};

  /** Global click handler stored so it can be removed on re-render. */
  private _docClickHandler: (() => void) | null = null;

  private calViewYear: number = 0;
  private calViewMonth: number = 0;
  private sortState: { key: string; direction: 'asc' | 'desc' | 'default' } = { key: '', direction: 'default' };


  // ── Lifecycle ──────────────────────────────────────────────────────────────
  protected onInit(): Promise<void> {
    this.siteUrl = this.context.pageContext.web.absoluteUrl;
    this.currentUserEmail = this.context.pageContext.user.email.toLowerCase();

    this.loadCss();
    this.loadScripts();

    return Promise.resolve();
  }

  public render(): void {
    SharedSidebar.unregisterNavHandler('my-verification');
    SharedSidebar.unregisterNavHandler('my-authorizations');

    const workbench = document.getElementById('workbenchPageContent');
    if (workbench) workbench.style.maxWidth = 'none';

    const resourceUrl = this.siteUrl + '/SiteAssets';
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');

    const isAuthorization = tabParam === 'authorization';
    const activeTabId = isAuthorization ? 'verif-authorization-table' : 'verif-verification-table';
    const activeNavItem = isAuthorization ? 'my-authorizations' : 'my-verification';

    this.currentMainTab = isAuthorization ? 'authorization' : 'verification';

    this.domElement.innerHTML =
      SharedSidebar.getHtml({
        resourceUrl,
        siteUrl: this.siteUrl,
        activeNavItem,
        activeTabId
      }) +
      VerificationAndAuthorization.allElementsHtml
        .replace(/__KEY_URL_RESOURCE__/g, resourceUrl);

    if (this._docClickHandler) {
      document.removeEventListener('click', this._docClickHandler);
      this._docClickHandler = null;
    }

    // ── Run sidebar init immediately (same as AdminPage) ──────────────────────
    SharedSidebar.initBehavior(this.domElement, this.siteUrl);

    // ── Then poll for Bootstrap and re-init once it's ready ───────────────────
    this.initWhenReady();

    // ── Run all other page init immediately — no waiting needed ───────────────
    SharedSidebar.registerNavHandler('my-verification', this.handleSidebarNavClick.bind(this));
    SharedSidebar.registerNavHandler('my-authorizations', this.handleSidebarNavClick.bind(this));

    const verPanel = this.domElement.querySelector<HTMLElement>('#verif-verification-table');
    const authPanel = this.domElement.querySelector<HTMLElement>('#verif-authorization-table');
    if (isAuthorization) {
      if (verPanel) verPanel.style.display = 'none';
      if (authPanel) authPanel.style.display = 'block';
    } else {
      if (verPanel) verPanel.style.display = 'block';
      if (authPanel) authPanel.style.display = 'none';
    }

    const initialTabPanelId = isAuthorization ? 'verif-authorization-table' : 'verif-verification-table';
    this.domElement.querySelectorAll('.nemko-tab-btn').forEach(btn => {
      btn.classList.toggle('nemko-tab-btn-active', btn.getAttribute('data-tab-id') === initialTabPanelId);
    });

    this.updateSubTabLabels();
    this.loadMockData();
    this.updateSubTabLabels();
    this.loadMockData();

    setTimeout(() => {
      this.bindAll();
      this.refreshCurrentView();
    }, 300);
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

  // ── CSS / JS ───────────────────────────────────────────────────────────────
  private loadCss(): void {
    const base = this.siteUrl + '/SiteAssets/resources/css';
    SPComponentLoader.loadCss(base + '/bootstrap.min.css');
    SPComponentLoader.loadCss(base + '/variable.css');
    SPComponentLoader.loadCss(base + '/font-size.css');
    SPComponentLoader.loadCss(base + '/custom.css');
    SPComponentLoader.loadCss(base + '/sp-custom.css');
    SPComponentLoader.loadCss(base + '/nemko-modal.css');
  }

  private loadScripts(): void {
    const base = this.siteUrl + '/SiteAssets/resources/js';
    SPComponentLoader
      .loadScript(base + '/jquery-3.6.0.js', { globalExportsName: 'jQuery' })
      // .then(() => SPComponentLoader.loadScript(base + '/bootstrap.bundle.min.js'))
      // .then(() => SPComponentLoader.loadScript(base + '/common.js'))

      .catch(function (err: any) { console.error(err); });
  }

  // ── Mock Data 
  private loadMockData(): void {
    this.verificationRows = [
      {
        Id: 1,
        QualificationId: '000001',
        Employee: 'John Smith',
        Qualification: 'Electrical Safety',
        Level: 'Employee',
        TargetDate: '2026-05-01',
        Authorizer: 'Admin User',
        VerifiedBy: '',
        Status: 'Pending'
      },
      {
        Id: 2,
        QualificationId: '000002',
        Employee: 'Maria Jones',
        Qualification: 'Fire Testing',
        Level: 'Verifier',
        TargetDate: '2026-05-10',
        Authorizer: 'Admin User',
        VerifiedBy: 'Current User',
        Status: 'Verified'
      },
      {
        Id: 3,
        QualificationId: '000003',
        Employee: 'Peter Blake',
        Qualification: 'EMC Lab',
        Level: 'Employee',
        TargetDate: '2026-06-01',
        Authorizer: 'Supervisor A',
        VerifiedBy: '',
        Status: 'Pending'
      }
    ];

    this.authorizationRows = [
      {
        Id: 11,
        QualificationId: '000011',
        Employee: 'Alex Brown',
        Qualification: 'Toy Lab',
        Level: 'Project Handler',
        TargetDate: '2026-05-12',
        VerifiedBy: 'John Smith',
        Status: 'Pending'
      },
      {
        Id: 12,
        QualificationId: '000012',
        Employee: 'Helen Ray',
        Qualification: 'EMC Testing',
        Level: 'Verifier',
        TargetDate: '2026-05-15',
        VerifiedBy: 'Maria Jones',
        Status: 'Authorized'
      },
      {
        Id: 13,
        QualificationId: '000013',
        Employee: 'Sam Wilson',
        Qualification: 'Electrical Safety',
        Level: 'Project Handler',
        TargetDate: '2026-06-10',
        VerifiedBy: 'Peter Blake',
        Status: 'Pending'
      }
    ];
  }

  // ── Bind All Event Listeners ───────────────────────────────────────────────
  private bindAll(): void {
    this.bindMainTabs();
    this.bindSubTabs();
    this.bindActions();
    this.bindSearch();
    this.bindDropdownToggle();
    this.bindImportModal();
    this.bindQualificationDetailsModal();
    this.initCustomCalendar(
      'targetAchieveDate',
      'targetAchieveDateIcon',
      'targetAchieveDateWrapper',
      'nemko-cal-popup'
    );

    this.initCustomCalendar(
      'approvalDate',
      'approvalDateIcon',
      'approvalDateWrapper',
      'approval-cal-popup'
    );
  }

  // ── Main Tabs ──────────────────────────────────────────────────────────────
  private bindMainTabs(): void {
    const self = this;
    const buttons = this.domElement.querySelectorAll('.nemko-tab-btn');

    for (let i = 0; i < buttons.length; i++) {
      (function (btn: Element) {
        btn.addEventListener('click', function () {
          const tabId = btn.getAttribute('data-tab-id') || '';
          self.currentMainTab =
            (tabId === 'verif-authorization-table')
              ? 'authorization'
              : 'verification';

          // ── ADD: sync sidebar highlight ──
          const navKey = (tabId === 'verif-authorization-table')
            ? 'my-authorizations'
            : 'my-verification';
          self.domElement.querySelectorAll<HTMLElement>('.sidebar-nav-link')
            .forEach(l => l.classList.remove('active-sm-link'));
          const activeLink = self.domElement.querySelector<HTMLElement>(
            `.sidebar-nav-link[data-nav-key="${navKey}"]`
          );
          if (activeLink) activeLink.classList.add('active-sm-link');
          // ── END ADD ──

          // Toggle active class.
          for (let j = 0; j < buttons.length; j++) {
            buttons[j].classList.remove('nemko-tab-btn-active');
          }
          btn.classList.add('nemko-tab-btn-active');

          // Show / hide panels.
          const panels = self.domElement.querySelectorAll('.nemko-data-table-wrapper');
          for (let k = 0; k < panels.length; k++) {
            (panels[k] as HTMLElement).style.display = 'none';
          }
          const activePanel = self.domElement.querySelector('#' + tabId) as HTMLElement;
          if (activePanel) activePanel.style.display = 'block';

          // Reset sub-tab to pending.
          self.currentSubTab = 'pending';
          self.updateSubTabLabels();
          self.activateSubTab(0);
          self.resetSearchInputs();
          self.refreshCurrentView();
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
          self.activateSubTab(index);
          self.resetSearchInputs();
          self.refreshCurrentView();
          self.updateBarVisibility();
        });
      })(tabs[i], i);
    }
  }


  private handleSidebarNavClick(navKey: string): void {
    const isVerification = navKey === 'my-verification';

    this.currentMainTab = isVerification ? 'verification' : 'authorization';

    // Sync top tab buttons
    const tabPanelId = isVerification
      ? 'verif-verification-table'
      : 'verif-authorization-table';

    this.domElement.querySelectorAll('.nemko-tab-btn').forEach(btn => {
      btn.classList.toggle(
        'nemko-tab-btn-active',
        btn.getAttribute('data-tab-id') === tabPanelId
      );
    });

    // Sync panels
    this.domElement.querySelectorAll<HTMLElement>('.nemko-data-table-wrapper')
      .forEach(p => { p.style.display = 'none'; });
    const panel = this.domElement.querySelector<HTMLElement>('#' + tabPanelId);
    if (panel) panel.style.display = 'block';

    // Sync sidebar active highlight
    this.domElement.querySelectorAll<HTMLElement>('.sidebar-nav-link')
      .forEach(l => l.classList.remove('active-sm-link'));
    const activeLink = this.domElement.querySelector<HTMLElement>(
      `.sidebar-nav-link[data-nav-key="${navKey}"]`
    );
    if (activeLink) activeLink.classList.add('active-sm-link');

    // Reset sub-tab
    this.currentSubTab = 'pending';
    this.updateSubTabLabels();
    this.activateSubTab(0);
    this.resetSearchInputs();
    this.refreshCurrentView();
  }

  private activateSubTab(index: number): void {
    const tabs = this.domElement.querySelectorAll('.tab-link-btn');
    for (let i = 0; i < tabs.length; i++) {
      if (i === index) {
        tabs[i].classList.add('tab-link-btn-active');
      } else {
        tabs[i].classList.remove('tab-link-btn-active');
      }
    }
  }

  private updateSubTabLabels(): void {
    const tabs = this.domElement.querySelectorAll('.tab-link-btn');
    if (this.currentMainTab === 'verification') {
      if (tabs[0]) tabs[0].textContent = 'Pending verification';
      if (tabs[1]) tabs[1].textContent = 'Verified by me';
    } else {
      if (tabs[0]) tabs[0].textContent = 'Pending authorization';
      if (tabs[1]) tabs[1].textContent = 'Authorized by me';
    }
  }

  private authorizerOptions: string[] = [
    'Admin User',
    'Supervisor A',
    'John Smith',
    'Maria Jones',
    'Peter Blake',
    'Stuart Beck',
    'Juan Gonzalez'
  ];

  private selectedAuthorizerTemp: string = '';

  // ── Reset search inputs ────────────────────────────────────────────────────
  private resetSearchInputs(): void {
    this.verSearchQuery = '';
    this.authSearchQuery = '';
    const verInput = this.domElement.querySelector('#ver-search') as HTMLInputElement;
    const authInput = this.domElement.querySelector('#auth-search') as HTMLInputElement;
    if (verInput) verInput.value = '';
    if (authInput) authInput.value = '';
  }

  // ── Action Buttons ─────────────────────────────────────────────────────────
  private bindActions(): void {
    const self = this;
    this.domElement.addEventListener('click', function (e: Event) {
      const target = e.target as HTMLElement;

      if (target.className && target.className.indexOf('evaluate-link') !== -1) {
        e.preventDefault();
        const row = target.closest('tr');
        if (row) {
          if (self.currentMainTab === 'verification') {
            self.openQualificationDetailsModal(row);
          } else {
            self.openAuthorizationDetailsModal(row);
          }
        }
        return;
      }

      if (target.className && target.className.indexOf('verify-selected') !== -1) {
        self.verifySelected();
        return;
      }

      if (target.className && target.className.indexOf('authorize-selected') !== -1) {
        self.authorizeSelected();
        return;
      }

      if (target.className && target.className.indexOf('reject-selected') !== -1) {
        const panel = target.getAttribute('data-panel') || '';
        self.rejectSelected(panel);
        return;
      }

      if (target.className.indexOf('withdraw-btn') !== -1) {
        e.preventDefault();

        const row = target.closest('tr');
        if (row) {
          self.openWithdrawDetailsModal(row);
        }
        return;
      }

      if (target.getAttribute('data-dismiss-modal')) {
        const modalId = target.getAttribute('data-dismiss-modal') || '';
        self.closeModal(modalId);
        return;
      }

      if (target.id === 'qd-verify-btn') {
        self.verifyFromDetailsModal();
        return;
      }

      if (target.id === 'qd-reject-btn') {
        self.rejectFromDetailsModal();
        return;
      }
    });
  }

  private openAuthorizationDetailsModal(row: Element): void {
    const cells = row.querySelectorAll('td');

    // col 0 = checkbox, 1 = Employee, 2 = Qualification, 3 = Level,
    // 4 = TargetDate, 5 = VerifiedBy
    const employee = cells[1] ? (cells[1].textContent || '').trim() : '';
    const qualification = cells[2] ? (cells[2].textContent || '').trim() : '';
    // const level         = cells[3] ? (cells[3].textContent || '').trim() : '';
    // const targetDate    = cells[4] ? (cells[4].textContent || '').trim() : '';
    const verifiedBy = cells[5] ? (cells[5].textContent || '').trim() : '';

    this.activeDetailsPanel = 'authorization';
    this.activeDetailsRowId = -1;

    // Find the matching authorization row by employee name
    for (let i = 0; i < this.authorizationRows.length; i++) {
      if (this.authorizationRows[i].Employee === employee) {
        this.activeDetailsRowId = this.authorizationRows[i].Id;
        break;
      }
    }

    // Get QualificationId from the matched row
    let qualId = '';
    for (let i = 0; i < this.authorizationRows.length; i++) {
      if (this.authorizationRows[i].Id === this.activeDetailsRowId) {
        qualId = this.authorizationRows[i].QualificationId;
        break;
      }
    }

    // Populate email fields
    const reqEmailInput = this.domElement.querySelector('#reqEmail') as HTMLInputElement;
    if (reqEmailInput) reqEmailInput.value = employee;

    const verEmailInput = this.domElement.querySelector('#verEmail') as HTMLInputElement;
    if (verEmailInput) verEmailInput.value = verifiedBy;

    const authEmailInput = this.domElement.querySelector('#authEmail') as HTMLInputElement;
    if (authEmailInput) authEmailInput.value = this.currentUserEmail || '';

    // Populate approval date field
    const approvalDateInput = this.domElement.querySelector('#approvalDate') as HTMLInputElement;
    if (approvalDateInput) approvalDateInput.value = '';

    // Reset radio buttons — default to "No" (not rejected) for both
    const approvalRejectedRadios = this.domElement.querySelectorAll('input[name="radioDefault3"]');
    for (let i = 0; i < approvalRejectedRadios.length; i++) {
      const radio = approvalRejectedRadios[i] as HTMLInputElement;
      // index 0 = Yes, index 1 = No — default to No
      radio.checked = (i === 1);
      const icon = radio.closest('label') ? radio.closest('label')!.querySelector('.radio-icon') : null;
      if (icon) {
        if (i === 1) {
          icon.classList.add('active');
        } else {
          icon.classList.remove('active');
        }
      }
    }

    const authorizationRejectedRadios = this.domElement.querySelectorAll('input[name="radioDefault4"]');
    for (let i = 0; i < authorizationRejectedRadios.length; i++) {
      const radio = authorizationRejectedRadios[i] as HTMLInputElement;
      radio.checked = (i === 1);
      const icon = radio.closest('label') ? radio.closest('label')!.querySelector('.radio-icon') : null;
      if (icon) {
        if (i === 1) {
          icon.classList.add('active');
        } else {
          icon.classList.remove('active');
        }
      }
    }

    // Populate readonly fields in the modal body
    const qualIdEl = this.domElement.querySelector('#authorizationDetailsModal .frm-readonly-row:nth-child(4) .frm-readonly-val') as HTMLElement;
    if (qualIdEl) qualIdEl.textContent = qualId || '—';

    const requestedByEl = this.domElement.querySelector('#authorizationDetailsModal .frm-readonly-row:nth-child(5) .frm-readonly-val') as HTMLElement;
    if (requestedByEl) requestedByEl.textContent = employee || '—';

    const qualificationEl = this.domElement.querySelector('#authorizationDetailsModal .frm-readonly-row:nth-child(6) .frm-readonly-val') as HTMLElement;
    if (qualificationEl) qualificationEl.textContent = qualification || '—';

    // Populate the limitations textarea
    const limitationsTextarea = this.domElement.querySelector('#limitationsTxtarea') as HTMLTextAreaElement;
    if (limitationsTextarea) limitationsTextarea.value = '';

    // Bind the Authorize button
    const authorizeBtn = this.domElement.querySelector('#authorizationDetailsModal .nemko-btn-save') as HTMLElement;
    if (authorizeBtn) {
      // Remove any previously bound listener by cloning
      const newAuthorizeBtn = authorizeBtn.cloneNode(true) as HTMLElement;
      authorizeBtn.parentNode!.replaceChild(newAuthorizeBtn, authorizeBtn);

      const self = this;
      newAuthorizeBtn.addEventListener('click', function () {
        self.authorizeFromDetailsModal();
      });
    }

    // Bind the Reject button
    const rejectBtn = this.domElement.querySelector('#authorizationDetailsModal .nemko-btn-reject') as HTMLElement;
    if (rejectBtn) {
      const newRejectBtn = rejectBtn.cloneNode(true) as HTMLElement;
      rejectBtn.parentNode!.replaceChild(newRejectBtn, rejectBtn);

      const self = this;
      newRejectBtn.addEventListener('click', function () {
        self.rejectFromAuthorizationDetailsModal();
      });
    }

    // Bind the close / X button
    const closeBtn = this.domElement.querySelector('#authorizationDetailsModal [data-bs-dismiss="modal"]') as HTMLElement;
    if (closeBtn) {
      const newCloseBtn = closeBtn.cloneNode(true) as HTMLElement;
      closeBtn.parentNode!.replaceChild(newCloseBtn, closeBtn);

      const self = this;
      newCloseBtn.addEventListener('click', function () {
        self.closeModal('authorizationDetailsModal');
      });
    }

    this.openModal('authorizationDetailsModal');
  }

  private authorizeFromDetailsModal(): void {
    for (let i = 0; i < this.authorizationRows.length; i++) {
      if (this.authorizationRows[i].Id === this.activeDetailsRowId) {
        this.authorizationRows[i].Status = 'Authorized';
        this.addAudit(
          'Authorized',
          this.authorizationRows[i].Employee,
          this.authorizationRows[i].Qualification
        );
        break;
      }
    }
    this.closeModal('authorizationDetailsModal');
    this.refreshCurrentView();
  }

  private openWithdrawDetailsModal(row: Element): void {
    const cells = row.querySelectorAll('td');

    const employee = cells[0]?.textContent?.trim() || '';
    const qualification = cells[1]?.textContent?.trim() || '';
    const level = cells[2]?.textContent?.trim() || '';
    const targetDate = cells[3]?.textContent?.trim() || '';
    const verifiedBy = cells[4]?.textContent?.trim() || '';

    // ── Format helper: YYYY-MM-DD → DD/MM/YYYY ──────────────────────────────
    const formatDate = function (raw: string): string {
      if (!raw) return '—';
      const parts = raw.split('-');
      if (parts.length === 3) {
        return parts[2] + '/' + parts[1] + '/' + parts[0]; // DD/MM/YYYY
      }
      return raw; // return as-is if unexpected format
    };

    // Email fields (scoped to this modal to avoid duplicate-ID clash)
    const modal = this.domElement.querySelector('#withdrawDetailsModal') as HTMLElement;
    if (!modal) return;

    const reqEmailInput = modal.querySelector('#reqEmail') as HTMLInputElement;
    if (reqEmailInput) reqEmailInput.value = employee;

    const verEmailInput = modal.querySelector('#verEmail') as HTMLInputElement;
    if (verEmailInput) verEmailInput.value = verifiedBy;

    const authEmailInput = modal.querySelector('#authEmail') as HTMLInputElement;
    if (authEmailInput) authEmailInput.value = this.currentUserEmail || '';

    this.setModalField('wd-requested-by', employee);
    this.setModalField('wd-qualification', qualification);
    this.setModalField('wd-level', level);
    this.setModalField('wd-conformity', 'No');
    this.setModalField('wd-report-approver', 'No');
    this.setModalField('wd-updated-level', level);
    this.setModalField('wd-remarks', 'test');
    this.setModalField('wd-updated-remarks', '');
    this.setModalField('wd-limitations-verifier', 'tests');
    this.setModalField('wd-limitations', 'tests');

    // Both dates now use the same DD/MM/YYYY format
    this.setModalField('wd-qualified-date-readonly',
      formatDate(targetDate));
    this.setModalField('wd-withdrawn-date-readonly',
      new Date().toLocaleDateString('en-GB')); // already DD/MM/YYYY

    this.openModal('withdrawDetailsModal');
  }

  private rejectFromAuthorizationDetailsModal(): void {
    for (let i = 0; i < this.authorizationRows.length; i++) {
      if (this.authorizationRows[i].Id === this.activeDetailsRowId) {
        this.authorizationRows[i].Status = 'Rejected';
        this.addAudit(
          'Rejected',
          this.authorizationRows[i].Employee,
          this.authorizationRows[i].Qualification
        );
        break;
      }
    }
    this.closeModal('authorizationDetailsModal');
    this.refreshCurrentView();
  }

  // Tracks which row is currently open in the details modal
  private activeDetailsRowId: number = -1;
  private activeDetailsPanel: string = ''; // 'verification' | 'authorization'

  private openQualificationDetailsModal(row: Element): void {
    const cells = row.querySelectorAll('td');

    // col 0 = checkbox, 1 = Employee, 2 = Qualification, 3 = Level,
    // 4 = TargetDate, 5 = Authorizer (ver) or VerifiedBy (auth)
    const employee = cells[1] ? (cells[1].textContent || '').trim() : '';
    const qualification = cells[2] ? (cells[2].textContent || '').trim() : '';
    const level = cells[3] ? (cells[3].textContent || '').trim() : '';
    const targetDate = cells[4] ? (cells[4].textContent || '').trim() : '';
    const authorizer = cells[5] ? (cells[5].textContent || '').trim() : '';

    this.activeDetailsPanel = this.currentMainTab;

    if (this.currentMainTab === 'verification') {
      for (let i = 0; i < this.verificationRows.length; i++) {
        if (this.verificationRows[i].Employee === employee) {
          this.activeDetailsRowId = this.verificationRows[i].Id;
          break;
        }
      }
    } else {
      for (let i = 0; i < this.authorizationRows.length; i++) {
        if (this.authorizationRows[i].Employee === employee) {
          this.activeDetailsRowId = this.authorizationRows[i].Id;
          break;
        }
      }
    }

    // Resolve the matched row to get QualificationId
    let qualId = '';
    if (this.currentMainTab === 'verification') {
      for (let i = 0; i < this.verificationRows.length; i++) {
        if (this.verificationRows[i].Id === this.activeDetailsRowId) {
          qualId = this.verificationRows[i].QualificationId;
          break;
        }
      }
    } else {
      for (let i = 0; i < this.authorizationRows.length; i++) {
        if (this.authorizationRows[i].Id === this.activeDetailsRowId) {
          qualId = this.authorizationRows[i].QualificationId;
          break;
        }
      }
    }

    // Populate readonly fields
    this.setModalField('qd-qual-id', qualId);
    this.setModalField('qd-requested-by', employee);
    this.setModalField('qd-qualification', qualification);
    this.setModalField('qd-qual-level', level);
    this.setModalField('qd-conformity', '—');
    this.setModalField('qd-report-approver', '—');
    this.setModalField('qd-updated-level', level);
    this.setModalField('qd-remarks', '—');
    this.setModalField('qd-limitations-requester', '—');

    // FIX: correct textarea ID (was 'qd-limitations-verifier-sub' which doesn't exist)
    const limitationsTextarea = this.domElement.querySelector('#qd-limitations-textarea') as HTMLTextAreaElement;
    if (limitationsTextarea) limitationsTextarea.value = '';

    // Populate editable date field
    const targetDateInput = this.domElement.querySelector('#targetAchieveDate') as HTMLInputElement;
    if (targetDateInput) targetDateInput.value = targetDate;

    // Populate authorizer field
    const authorizerInput = this.domElement.querySelector('#qd-authorizer') as HTMLInputElement;
    if (authorizerInput) authorizerInput.value = authorizer;

    // Show/hide footer buttons based on panel
    const verifyBtn = this.domElement.querySelector('#qd-verify-btn') as HTMLElement;
    const rejectBtn = this.domElement.querySelector('#qd-reject-btn') as HTMLElement;
    if (verifyBtn) verifyBtn.style.display = (this.currentMainTab === 'verification') ? '' : 'none';
    if (rejectBtn) rejectBtn.style.display = '';

    // Reset authorizer picker state
    this.selectedAuthorizerTemp = '';
    const authSearchInput = this.domElement.querySelector('#authorizer-search-input') as HTMLInputElement;
    if (authSearchInput) authSearchInput.value = '';

    // Pre-render the authorizer list so it's ready when picker opens
    this.renderAuthorizerList('');

    this.openModal('qualificationDetailsModal');
    // Reset authorizer picker state
    this.selectedAuthorizerTemp = '';
    if (authSearchInput) authSearchInput.value = '';

    // Pre-render the authorizer list so it's ready when picker opens
    this.renderAuthorizerList('');

    this.openModal('qualificationDetailsModal');

  }
  // ── Custom Vanilla Calendar  ──

  private initCustomCalendar(
    inputId: string,
    buttonId: string,
    wrapperId: string,
    popupId: string
  ): void {

    const self = this;

    const input = this.domElement.querySelector('#' + inputId) as HTMLInputElement;
    const wrapper = this.domElement.querySelector('#' + wrapperId) as HTMLElement;
    const popup = this.domElement.querySelector('#' + popupId) as HTMLElement;
    const button = this.domElement.querySelector('#' + buttonId) as HTMLElement;

    if (!input || !wrapper || !popup) return;

    const openCalendar = function (e: Event): void {
      e.preventDefault();
      e.stopPropagation();

      const today = new Date();

      if (input.value && input.value.length === 10) {
        const parts = input.value.split('-');

        self.calViewYear = parseInt(parts[0], 10);
        self.calViewMonth = parseInt(parts[1], 10) - 1;

        if (isNaN(self.calViewYear)) self.calViewYear = today.getFullYear();
        if (isNaN(self.calViewMonth)) self.calViewMonth = today.getMonth();
      } else {
        self.calViewYear = today.getFullYear();
        self.calViewMonth = today.getMonth();
      }

      self.renderCalendarPopup(input, popup);

      popup.hidden = false;
      popup.style.display = 'block';
    };

    // input click
    input.addEventListener('click', openCalendar);

    // button click
    if (button) {
      button.addEventListener('click', openCalendar);

      const childs = button.querySelectorAll('*');

      for (let i = 0; i < childs.length; i++) {
        childs[i].addEventListener('click', openCalendar);
      }
    }

    // outside click close
    document.addEventListener('click', function (e: Event) {
      const target = e.target as Node;

      if (!wrapper.contains(target)) {
        popup.hidden = true;
        popup.style.display = 'none';
      }
    });
  }
  private getSortSVG(key: string): string {
    const isActive = this.sortState.key === key;
    const dir = isActive ? this.sortState.direction : 'default';
    const active = 'var(--color-primary, #006e8c)';
    const inactive = '#C0C0C0';
    const upStroke = (isActive && dir === 'asc') ? active : inactive;
    const downStroke = (isActive && dir === 'desc') ? active : inactive;

    return (
      '<span style="display:inline-flex;flex-shrink:0;align-items:center;">' +
      '<svg width="12" height="16" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M5 1L1 5H9L5 1Z" fill="' + upStroke + '" />' +
      '<path d="M5 13L1 9H9L5 13Z" fill="' + downStroke + '" />' +
      '</svg>' +
      '</span>'
    );
  }
  private applySorting(rows: any[], tabKey: string): any[] {
    if (!this.sortState.key || this.sortState.direction === 'default') return rows;

    const key = this.sortState.key;
    const dir = this.sortState.direction;

    const sorted: any[] = [];
    for (let i = 0; i < rows.length; i++) sorted.push(rows[i]);

    sorted.sort(function (a: any, b: any) {
      const aVal = String(a[key] || '').toLowerCase();
      const bVal = String(b[key] || '').toLowerCase();
      if (aVal < bVal) return dir === 'asc' ? -1 : 1;
      if (aVal > bVal) return dir === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }
  private renderCalendarPopup(
    input: HTMLInputElement,
    popup: HTMLElement
  ): void {

    const self = this;

    const MONTH_NAMES = [
      'January', 'February', 'March', 'April',
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
    ];

    const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const year = self.calViewYear;
    const month = self.calViewMonth;

    const today = new Date();

    const todayY = today.getFullYear();
    const todayM = today.getMonth();
    const todayD = today.getDate();

    let selYear = -1;
    let selMonth = -1;
    let selDay = -1;

    if (input.value && input.value.length === 10) {

      const parts = input.value.split('-');

      selYear = parseInt(parts[0], 10);
      selMonth = parseInt(parts[1], 10) - 1;
      selDay = parseInt(parts[2], 10);
    }

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let html = '';

    // Header
    html +=
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +

      '<button type="button" id="cal-prev" style="width:28px;height:28px;border:none;background:#006e8c;color:#fff;border-radius:4px;">‹</button>' +

      '<span style="font-weight:600;">' +
      MONTH_NAMES[month] + ' ' + year +
      '</span>' +

      '<button type="button" id="cal-next" style="width:28px;height:28px;border:none;background:#006e8c;color:#fff;border-radius:4px;">›</button>' +

      '</div>';

    // Table
    html += '<table style="width:100%;border-collapse:collapse;">';

    html += '<thead><tr>';

    for (let d = 0; d < DAY_NAMES.length; d++) {
      html += '<th style="padding:4px;text-align:center;font-size:12px;">' +
        DAY_NAMES[d] +
        '</th>';
    }

    html += '</tr></thead><tbody>';

    let day = 1;

    for (let row = 0; row < 6; row++) {

      html += '<tr>';

      for (let col = 0; col < 7; col++) {

        if (row === 0 && col < firstDay) {

          html += '<td></td>';

        } else if (day > daysInMonth) {

          html += '<td></td>';

        } else {

          let style =
            'padding:6px;text-align:center;cursor:pointer;border-radius:4px;';

          const isToday =
            (year === todayY &&
              month === todayM &&
              day === todayD);

          const isSelected =
            (year === selYear &&
              month === selMonth &&
              day === selDay);

          if (isSelected) {
            style += 'background:#006e8c;color:#fff;';
          } else if (isToday) {
            style += 'background:#fff3cd;';
          }

          html +=
            '<td class="cal-day" data-day="' + day + '" style="' + style + '">' +
            day +
            '</td>';

          day++;
        }
      }

      html += '</tr>';

      if (day > daysInMonth) break;
    }

    html += '</tbody></table>';

    popup.innerHTML = html;

    // Prev
    const prevBtn = popup.querySelector('#cal-prev');

    if (prevBtn) {

      prevBtn.addEventListener('click', function (e: Event) {

        e.stopPropagation();

        self.calViewMonth--;

        if (self.calViewMonth < 0) {
          self.calViewMonth = 11;
          self.calViewYear--;
        }

        self.renderCalendarPopup(input, popup);
      });
    }

    // Next
    const nextBtn = popup.querySelector('#cal-next');

    if (nextBtn) {

      nextBtn.addEventListener('click', function (e: Event) {

        e.stopPropagation();

        self.calViewMonth++;

        if (self.calViewMonth > 11) {
          self.calViewMonth = 0;
          self.calViewYear++;
        }

        self.renderCalendarPopup(input, popup);
      });
    }

    // Day click
    const days = popup.querySelectorAll('.cal-day');

    for (let i = 0; i < days.length; i++) {

      (function (cell: Element) {

        cell.addEventListener('click', function (e: Event) {

          e.stopPropagation();

          const d = parseInt(
            cell.getAttribute('data-day') || '0',
            10
          );

          if (!d) return;

          const mm =
            (self.calViewMonth + 1 < 10)
              ? '0' + (self.calViewMonth + 1)
              : '' + (self.calViewMonth + 1);

          const dd =
            (d < 10)
              ? '0' + d
              : '' + d;

          input.value =
            self.calViewYear + '-' + mm + '-' + dd;

          popup.style.display = 'none';
        });

      })(days[i]);
    }
  }

  private setModalField(fieldId: string, value: string): void {
    const el = this.domElement.querySelector('#' + fieldId);
    if (el) el.textContent = value || '—';
  }

  private verifyFromDetailsModal(): void {
    for (let i = 0; i < this.verificationRows.length; i++) {
      if (this.verificationRows[i].Id === this.activeDetailsRowId) {
        this.verificationRows[i].Status = 'Verified';
        this.verificationRows[i].VerifiedBy = this.currentUserEmail || 'Current User';
        this.addAudit('Verified', this.verificationRows[i].Employee, this.verificationRows[i].Qualification);
        break;
      }
    }
    this.closeModal('qualificationDetailsModal');
    this.refreshCurrentView();
  }

  private rejectFromDetailsModal(): void {
    if (this.activeDetailsPanel === 'verification') {
      for (let i = 0; i < this.verificationRows.length; i++) {
        if (this.verificationRows[i].Id === this.activeDetailsRowId) {
          this.verificationRows[i].Status = 'Rejected';
          this.addAudit('Rejected', this.verificationRows[i].Employee, this.verificationRows[i].Qualification);
          break;
        }
      }
    } else {
      for (let i = 0; i < this.authorizationRows.length; i++) {
        if (this.authorizationRows[i].Id === this.activeDetailsRowId) {
          this.authorizationRows[i].Status = 'Rejected';
          this.addAudit('Rejected', this.authorizationRows[i].Employee, this.authorizationRows[i].Qualification);
          break;
        }
      }
    }
    this.closeModal('qualificationDetailsModal');
    this.refreshCurrentView();
  }

  private verifySelected(): void {
    const tbody = this.domElement.querySelector('#ver-table tbody');
    if (!tbody) return;

    const checked = this.getCheckedRowIndexes(tbody);
    if (checked.length === 0) {
      alert('Please select at least one row to verify.');
      return;
    }

    const pendingRows: IVerificationRow[] = [];
    for (let i = 0; i < this.verificationRows.length; i++) {
      if (this.verificationRows[i].Status === 'Pending') {
        pendingRows.push(this.verificationRows[i]);
      }
    }

    for (let ci = 0; ci < checked.length; ci++) {
      const row = pendingRows[checked[ci]];
      if (!row) continue;

      if (!this.isSuperUser() && !this.canActOnLevel(row.Level)) {
        alert('You do not have permission to verify "' + row.Employee + '" (' + row.Level + ' level).');
        continue;
      }

      row.Status = 'Verified';
      row.VerifiedBy = this.currentUserEmail || 'Current User';
      this.addAudit('Verified', row.Employee, row.Qualification);
    }

    this.refreshCurrentView();
  }

  private authorizeSelected(): void {
    const tbody = this.domElement.querySelector('#auth-table tbody');
    if (!tbody) return;

    const checked = this.getCheckedRowIndexes(tbody);
    if (checked.length === 0) {
      alert('Please select at least one row to authorize.');
      return;
    }

    const pendingRows: IAuthorizationRow[] = [];
    for (let i = 0; i < this.authorizationRows.length; i++) {
      if (this.authorizationRows[i].Status === 'Pending') {
        pendingRows.push(this.authorizationRows[i]);
      }
    }

    for (let ci = 0; ci < checked.length; ci++) {
      const row = pendingRows[checked[ci]];
      if (!row) continue;

      if (!this.isSuperUser() && !this.canActOnLevel(row.Level)) {
        alert('You do not have permission to authorize "' + row.Employee + '" (' + row.Level + ' level).');
        continue;
      }

      row.Status = 'Authorized';
      this.addAudit('Authorized', row.Employee, row.Qualification);
    } ``
    this.refreshCurrentView();
  }

  private rejectSelected(panel: string): void {
    const tableId = (panel === 'verification') ? '#ver-table' : '#auth-table';
    const tbody = this.domElement.querySelector(tableId + ' tbody');
    if (!tbody) return;

    const checked = this.getCheckedRowIndexes(tbody);
    if (checked.length === 0) {
      alert('Please select at least one row to reject.');
      return;
    }

    if (panel === 'verification') {
      const pendingRows: IVerificationRow[] = [];
      for (let i = 0; i < this.verificationRows.length; i++) {
        if (this.verificationRows[i].Status === 'Pending') {
          pendingRows.push(this.verificationRows[i]);
        }
      }
      for (let ci = 0; ci < checked.length; ci++) {
        const row = pendingRows[checked[ci]];
        if (row) {
          row.Status = 'Rejected';
          this.addAudit('Rejected', row.Employee, row.Qualification);
        }
      }
    } else {
      const pendingRows: IAuthorizationRow[] = [];
      for (let i = 0; i < this.authorizationRows.length; i++) {
        if (this.authorizationRows[i].Status === 'Pending') {
          pendingRows.push(this.authorizationRows[i]);
        }
      }
      for (let ci = 0; ci < checked.length; ci++) {
        const row = pendingRows[checked[ci]];
        if (row) {
          row.Status = 'Rejected';
          this.addAudit('Rejected', row.Employee, row.Qualification);
        }
      }
    }

    this.refreshCurrentView();
  }

  // ── Search ─────────────────────────────────────────────────────────────────
  private bindSearch(): void {
    const self = this;
    const verSearch = this.domElement.querySelector('#ver-search') as HTMLInputElement;
    const authSearch = this.domElement.querySelector('#auth-search') as HTMLInputElement;

    if (verSearch) {
      verSearch.addEventListener('input', function () {
        self.verSearchQuery = verSearch.value.toLowerCase();
        self.renderVerificationTable();
      });
    }

    if (authSearch) {
      authSearch.addEventListener('input', function () {
        self.authSearchQuery = authSearch.value.toLowerCase();
        self.renderAuthorizationTable();
      });
    }
  }

  // ── Column Visibility Dropdown ─────────────────────────────────────────────
  private bindDropdownToggle(): void {

    const self = this;

    const triggers = this.domElement.querySelectorAll('[data-bs-toggle="dropdown"]');

    for (let i = 0; i < triggers.length; i++) {

      (function (trigger: Element) {

        const dropdown = trigger.closest('.dropdown');

        const menu = dropdown

          ? (dropdown.querySelector('.col-visibility-dd-menu') as HTMLElement)

          : null;

        if (!menu) return;

        trigger.addEventListener('click', function (e: Event) {

          e.stopPropagation();   // ← already there, good

          const openMenus = self.domElement.querySelectorAll('.col-visibility-dd-menu.show');

          for (let j = 0; j < openMenus.length; j++) {

            if (openMenus[j] !== menu) openMenus[j].classList.remove('show');

          }

          menu.classList.toggle('show');

        });



        menu.addEventListener('click', function (e: Event) {

          e.stopPropagation();

        });

      })(triggers[i]);

    }

    this._docClickHandler = function () {

      const openMenus = self.domElement.querySelectorAll('.col-visibility-dd-menu.show');

      for (let j = 0; j < openMenus.length; j++) {

        openMenus[j].classList.remove('show');

      }

    };

    document.addEventListener('click', this._docClickHandler);

  }



  private renderColVisibilityMenu(
    menuId: string,
    columns: Array<{ key: string; label: string; visible: boolean }>,
    tabKey: string
  ): void {
    const menu = this.domElement.querySelector('#' + menuId) as HTMLElement;
    if (!menu) return;

    const self = this;
    const toggleable: Array<{ key: string; label: string; visible: boolean }> = [];
    for (let i = 0; i < columns.length; i++) {
      const c = columns[i];
      if (c.key !== 'chk' && c.key !== 'Details' && c.key !== 'Withdraw') {
        toggleable.push(c);
      }
    }

    let html = '';
    for (let i = 0; i < toggleable.length; i++) {
      const col = toggleable[i];
      const storageKey = tabKey + '_' + col.key;
      if (this.colVisibility[storageKey] === undefined) {
        this.colVisibility[storageKey] = true;
      }
      const isVisible = this.colVisibility[storageKey];
      html +=
        '<li class="py-10">' +
        '<label class="dropdown-item d-flex align-items-center gap-2" data-col-key="' + col.key + '">' +
        '<input type="checkbox" ' + (isVisible ? 'checked' : '') + ' class="d-none" name="col-heading-' + tabKey + '" />' +
        '<span class="chkbox-icon ' + (isVisible ? 'active' : '') + '"></span>' +
        '<p class="font-medium text-sm md-text-base text-color-3">' + col.label + '</p>' +
        '</label>' +
        '</li>';
    }
    menu.innerHTML = html;

    // Bind change events.
    const checkboxes = menu.querySelectorAll('input[name="col-heading-' + tabKey + '"]');
    for (let i = 0; i < checkboxes.length; i++) {
      (function (cb: Element) {
        cb.addEventListener('change', function () {
          const input = cb as HTMLInputElement;
          const label = input.closest('label') as HTMLElement;
          const colKey = label ? (label.getAttribute('data-col-key') || '') : '';
          self.colVisibility[tabKey + '_' + colKey] = input.checked;

          // Toggle the custom chkbox-icon active class.
          const icon = label ? label.querySelector('.chkbox-icon') : null;
          if (icon) {
            if (input.checked) {
              icon.classList.add('active');
            } else {
              icon.classList.remove('active');
            }
          }

          self.refreshCurrentView();
        });
      })(checkboxes[i]);
    }
  }

  // ── Import Qualification Modal ─────────────────────────────────────────────
  private bindImportModal(): void {
    const self = this;

    // Open import modal
    const importBtn = this.domElement.querySelector('#import-qual-btn');
    if (importBtn) {
      importBtn.addEventListener('click', function () {
        self.closeModal('editTempDocModal')
        self.openModal('editTempDocModal');
      });
    }

    // Template select → hide import modal, show info modal
    const templateSelect = this.domElement.querySelector('#import-template-select') as HTMLSelectElement;
    if (templateSelect) {
      templateSelect.addEventListener('change', function () {
        // Only trigger if an actual template was chosen
        if (!templateSelect.value) return;
        self.closeModal('editTempDocModal');
        self.openModal('informationModal');
      });
    }

    // Info modal OK → reopen import modal
    const infoOkBtn = this.domElement.querySelector('#info-modal-ok-btn');
    if (infoOkBtn) {
      infoOkBtn.addEventListener('click', function () {
        self.closeModal('informationModal');
        self.openModal('editTempDocModal');
      });
    }

    // Info modal X button — also reopen import modal
    const infoCloseBtns = this.domElement.querySelectorAll('#informationModal [data-bs-dismiss="modal"]');
    for (let i = 0; i < infoCloseBtns.length; i++) {
      (function (btn: Element) {
        btn.addEventListener('click', function () {
          self.closeModal('informationModal');
          self.openModal('editTempDocModal');
        });
      })(infoCloseBtns[i]);
    }

    // File browse
    const fileInput = this.domElement.querySelector('#import-file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.addEventListener('change', function () {
        const fileNameEl = self.domElement.querySelector('#import-file-name') as HTMLInputElement;
        if (fileNameEl && fileInput.files && fileInput.files.length > 0) {
          fileNameEl.value = fileInput.files[0].name;
        }
        self.setImportError('');
      });
    }

    // Upload button
    const uploadBtn = this.domElement.querySelector('#import-upload-btn');
    if (uploadBtn) {
      uploadBtn.addEventListener('click', function () {
        self.handleImportUpload();
      });
    }

    // Download sample
    const downloadBtn = this.domElement.querySelector('#download-sample-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', function () {
        self.downloadSampleTemplate();
      });
    }

    // Import modal dismiss buttons (Cancel / X)
    const importDismissBtns = this.domElement.querySelectorAll('#editTempDocModal [data-bs-dismiss="modal"]');
    for (let i = 0; i < importDismissBtns.length; i++) {
      (function (btn: Element) {
        btn.addEventListener('click', function () {
          self.closeModal('editTempDocModal');
        });
      })(importDismissBtns[i]);
    }
  }

  private bindQualificationDetailsModal(): void {
    const self = this;

    // ── Close / X button on details modal ──────────────────────────────────
    const qdCloseBtn = this.domElement.querySelector('#qd-close-btn');
    if (qdCloseBtn) {
      qdCloseBtn.addEventListener('click', function () {
        self.closeModal('qualificationDetailsModal');
      });
    }

    // ── Authorizer pick button → open authorizer picker modal ──────────────
    const authPickBtn = this.domElement.querySelector('#qd-authorizer-pick-btn');
    if (authPickBtn) {
      authPickBtn.addEventListener('click', function () {
        self.selectedAuthorizerTemp = '';
        self.renderAuthorizerList('');
        self.closeModal('qualificationDetailsModal');
        self.openModal('selectAuthorizerModal');
      });
    }

    // ── Authorizer search input ─────────────────────────────────────────────
    const authSearchInput = this.domElement.querySelector('#authorizer-search-input') as HTMLInputElement;
    if (authSearchInput) {
      authSearchInput.addEventListener('input', function () {
        self.renderAuthorizerList(authSearchInput.value);
      });
    }

    // ── Authorizer search clear button ─────────────────────────────────────
    const authSearchClear = this.domElement.querySelector('#authorizer-search-clear-btn');
    if (authSearchClear) {
      authSearchClear.addEventListener('click', function () {
        const input = self.domElement.querySelector('#authorizer-search-input') as HTMLInputElement;
        if (input) {
          input.value = '';
          self.renderAuthorizerList('');
        }
      });
    }

    // ── Authorizer modal Save ───────────────────────────────────────────────
    const authSaveBtn = this.domElement.querySelector('#authorizer-save-btn');
    if (authSaveBtn) {
      authSaveBtn.addEventListener('click', function () {
        if (self.selectedAuthorizerTemp) {
          const authInput = self.domElement.querySelector('#qd-authorizer') as HTMLInputElement;
          if (authInput) authInput.value = self.selectedAuthorizerTemp;
        }
        self.closeModal('selectAuthorizerModal');
        self.openModal('qualificationDetailsModal');
      });
    }

    // ── Authorizer modal Cancel / X ─────────────────────────────────────────
    const authCancelBtn = this.domElement.querySelector('#authorizer-cancel-btn');
    if (authCancelBtn) {
      authCancelBtn.addEventListener('click', function () {
        self.closeModal('selectAuthorizerModal');
        self.openModal('qualificationDetailsModal');
      });
    }

    const authCloseBtn = this.domElement.querySelector('#select-authorizer-close-btn');
    if (authCloseBtn) {
      authCloseBtn.addEventListener('click', function () {
        self.closeModal('selectAuthorizerModal');
        self.openModal('qualificationDetailsModal');
      });
    }

    const wdBackBtns = this.domElement.querySelectorAll('.withdraw-back-btn');

    for (let i = 0; i < wdBackBtns.length; i++) {
      wdBackBtns[i].addEventListener('click', () => {
        this.closeModal('withdrawDetailsModal');
      });
    }
  }

  // ── Render authorizer radio list ──────────────────────────────────────────
  private renderAuthorizerList(query: string): void {
    const list = this.domElement.querySelector('#authorizer-list');
    if (!list) return;

    const q = query.toLowerCase();
    const self = this;

    let html = '';
    for (let i = 0; i < this.authorizerOptions.length; i++) {
      const name = this.authorizerOptions[i];
      if (q && name.toLowerCase().indexOf(q) === -1) continue;

      const isSelected = (name === this.selectedAuthorizerTemp);
      html +=
        '<label class="nemko-frm-radio d-flex align-items-center gap-2">' +
        '<input class="form-check-input d-none" type="radio" name="authorizerRadio" value="' + name + '"' +
        (isSelected ? ' checked' : '') + ' />' +
        '<span class="radio-icon radio-icon-lg' + (isSelected ? ' active' : '') + '"></span>' +
        '<p class="form-check-label">' + name + '</p>' +
        '</label>';
    }

    if (!html) {
      html = '<p class="text-muted text-sm py-2">No results found.</p>';
    }

    list.innerHTML = html;

    // Bind radio change
    const radios = list.querySelectorAll('input[name="authorizerRadio"]');
    for (let i = 0; i < radios.length; i++) {
      (function (radio: Element) {
        radio.addEventListener('change', function () {
          const input = radio as HTMLInputElement;
          self.selectedAuthorizerTemp = input.value;

          // Update active class on all icons
          const allLabels = list.querySelectorAll('.nemko-frm-radio');
          for (let j = 0; j < allLabels.length; j++) {
            const icon = allLabels[j].querySelector('.radio-icon');
            if (icon) icon.classList.remove('active');
          }
          const thisIcon = input.closest('label') ? input.closest('label')!.querySelector('.radio-icon') : null;
          if (thisIcon) thisIcon.classList.add('active');
        });
      })(radios[i]);
    }
  }

  // ── Modal helpers (no Bootstrap JS dependency) ─────────────────────────────
  private openModal(id: string): void {
    const modal = this.domElement.querySelector('#' + id) as HTMLElement;
    if (!modal) return;
    modal.classList.add('show');
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
  }

  private closeModal(id: string): void {
    const modal = this.domElement.querySelector('#' + id) as HTMLElement;
    if (!modal) return;
    modal.classList.remove('show');
    modal.style.display = 'none';
    // Only remove modal-open if no other modals are open
    const anyOpen = this.domElement.querySelectorAll('.modal.show');
    if (anyOpen.length === 0) {
      document.body.classList.remove('modal-open');
    }
  }

  private handleImportUpload(): void {
    const fileInput = this.domElement.querySelector('#import-file-input') as HTMLInputElement;

    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      this.setImportError('Please select a file before uploading.');
      return;
    }

    const file = fileInput.files[0];
    const allowedExtensions: string[] = ['.csv', '.xlsx', '.xls'];
    const dotIndex = file.name.lastIndexOf('.');
    const ext = dotIndex !== -1 ? file.name.substring(dotIndex).toLowerCase() : '';

    // Check if ext is in allowedExtensions — SPFx-safe loop (no .includes).
    let isAllowed = false;
    for (let i = 0; i < allowedExtensions.length; i++) {
      if (allowedExtensions[i] === ext) {
        isAllowed = true;
        break;
      }
    }

    if (!isAllowed) {
      this.setImportError('Only .csv, .xlsx, and .xls files are supported.');
      return;
    }


    this.addAudit('Imported', file.name, '');
    this.closeModal('editTempDocModal')
    alert('File "' + file.name + '" uploaded successfully. Records are being processed.');
  }

  private downloadSampleTemplate(): void {
    let headers = '';
    for (let i = 0; i < REQUIRED_IMPORT_HEADERS.length; i++) {
      if (i > 0) headers += ',';
      headers += REQUIRED_IMPORT_HEADERS[i];
    }
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + '\n');
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', 'qualification_import_template.csv');
    link.click();
  }

  private setImportError(msg: string): void {
    const el = this.domElement.querySelector('#import-file-error') as HTMLElement;
    if (!el) return;
    el.textContent = msg;
    el.style.display = msg ? 'block' : 'none';
  }

  // ── Permission Helpers ─────────────────────────────────────────────────────
  private isSuperUser(): boolean {
    for (let i = 0; i < SUPER_USERS.length; i++) {
      if (SUPER_USERS[i] === this.currentUserEmail) return true;
    }
    return false;
  }

  private canActOnLevel(_requiredLevel: string): boolean {
    // TODO: compare currentUserLevel index >= requiredLevel index using SP data.
    return true;
  }

  // ── Audit Trail ────────────────────────────────────────────────────────────
  private addAudit(action: string, employee: string, qualification: string): void {
    const entry: IAuditEntry = {
      timestamp: new Date().toLocaleString(),
      userId: this.currentUserEmail || 'Current User',
      action: action,
      targets: qualification ? (employee + ' \u2014 ' + qualification) : employee
    };
    // Prepend — no .unshift needed, build new array manually if needed,
    // but unshift is fine (it's an Array method, not ES6+). Using it safely:
    this.auditLog.splice(0, 0, entry);

    const el = this.domElement.querySelector('#audit-trail') as HTMLElement;
    if (el && this.auditLog[0]) {
      const latest = this.auditLog[0];
      el.textContent =
        'Last action: [' + latest.timestamp + '] ' + latest.userId +
        ' \u2014 ' + latest.action + ': ' + latest.targets;
    }
  }

  // ── Refresh Orchestrator ───────────────────────────────────────────────────
  private refreshCurrentView(): void {
    if (this.currentMainTab === 'verification') {
      this.renderVerificationTable();
    } else {
      this.renderAuthorizationTable();
    }

    this.updateBarVisibility();
  }

  private updateBarVisibility(): void {
    const isVerification = (this.currentMainTab === 'verification');
    const isPending = (this.currentSubTab === 'pending');

    // Always force-hide ALL bars first, then show only what belongs
    const importBar = this.domElement.querySelector('#import-bar') as HTMLElement;
    const verBar = this.domElement.querySelector('#ver-action-bar') as HTMLElement;
    const authBar = this.domElement.querySelector('#auth-action-bar') as HTMLElement;

    // Force hide all three unconditionally first
    if (importBar) importBar.style.setProperty('display', 'none', 'important');
    if (verBar) verBar.style.setProperty('display', 'none', 'important');
    if (authBar) authBar.style.setProperty('display', 'none', 'important');

    // Now show only the correct one
    if (isVerification && isPending) {
      if (importBar) importBar.style.setProperty('display', 'flex', 'important');
      if (verBar) verBar.style.setProperty('display', 'flex', 'important');
    }

    if (!isVerification && isPending) {
      if (authBar) authBar.style.setProperty('display', 'flex', 'important');
    }
  }

  // ── Verification Table Rendering ───────────────────────────────────────────
  private renderVerificationTable(): void {
    if (this.currentSubTab === 'pending') {
      this.renderVerificationPending();
    } else {
      this.renderVerificationMine();
    }
  }

  private renderVerificationPending(): void {
    const allCols = [
      { key: 'chk', label: '', visible: true },
      { key: 'Employee', label: 'Employee', visible: true },
      { key: 'Qualification', label: 'Qualification', visible: true },
      { key: 'Level', label: 'Level', visible: true },
      { key: 'TargetDate', label: 'Target Date', visible: true },
      { key: 'Authorizer', label: 'To be Authorized By', visible: true },
      { key: 'Details', label: 'Details', visible: true }
    ];

    const source: IVerificationRow[] = [];
    for (let i = 0; i < this.verificationRows.length; i++) {
      if (this.verificationRows[i].Status === 'Pending') source.push(this.verificationRows[i]);
    }

    const filtered = this.applySearch(source, this.verSearchQuery);
    const rows: any[] = [];
    for (let i = 0; i < filtered.length; i++) {
      const r = filtered[i];
      rows.push({
        chk: '<input type="checkbox" />',
        Employee: r.Employee,
        Qualification: r.Qualification,
        Level: r.Level,
        TargetDate: r.TargetDate,
        Authorizer: r.Authorizer,
        Details: '<a href="#" class="text-primary text-sm evaluate-link">Evaluate</a>'
      });
    }

    this.renderColVisibilityMenu('authorized-col-visibility', allCols, 'verPending');
    this.drawTable('#ver-table', allCols, rows, 'verPending');
  }

  private renderVerificationMine(): void {
    const allCols = [
      { key: 'Employee', label: 'Employee', visible: true },
      { key: 'Qualification', label: 'Qualification', visible: true },
      { key: 'Level', label: 'Level', visible: true },
      { key: 'TargetDate', label: 'Target Date', visible: true },
      { key: 'Authorizer', label: 'To be Authorized By', visible: true },
      { key: 'VerifiedBy', label: 'Verified By', visible: true }
    ];

    const source: IVerificationRow[] = [];
    for (let i = 0; i < this.verificationRows.length; i++) {
      if (this.verificationRows[i].Status === 'Verified') source.push(this.verificationRows[i]);
    }

    const filtered = this.applySearch(source, this.verSearchQuery);
    const rows: any[] = [];
    for (let i = 0; i < filtered.length; i++) {
      const r = filtered[i];
      rows.push({
        Employee: r.Employee,
        Qualification: r.Qualification,
        Level: r.Level,
        TargetDate: r.TargetDate,
        Authorizer: r.Authorizer,
        VerifiedBy: r.VerifiedBy
      });
    }

    this.renderColVisibilityMenu('authorized-col-visibility', allCols, 'verMine');
    this.drawTable('#ver-table', allCols, rows, 'verMine');

  }
  // ── Authorization Table Rendering ──────────────────────────────────────────
  private renderAuthorizationTable(): void {
    if (this.currentSubTab === 'pending') {
      this.renderAuthorizationPending();
    } else {
      this.renderAuthorizationMine();
    }
  }

  private renderAuthorizationPending(): void {
    const allCols = [
      { key: 'chk', label: '', visible: true },
      { key: 'Employee', label: 'Employee', visible: true },
      { key: 'Qualification', label: 'Qualification', visible: true },
      { key: 'Level', label: 'Level', visible: true },
      { key: 'TargetDate', label: 'Target Date', visible: true },
      { key: 'VerifiedBy', label: 'Verified By', visible: true },
      { key: 'Details', label: 'Details', visible: true }
    ];

    const source: IAuthorizationRow[] = [];
    for (let i = 0; i < this.authorizationRows.length; i++) {
      if (this.authorizationRows[i].Status === 'Pending') source.push(this.authorizationRows[i]);
    }

    const filtered = this.applySearch(source, this.authSearchQuery);
    const rows: any[] = [];
    for (let i = 0; i < filtered.length; i++) {
      const r = filtered[i];
      rows.push({
        chk: '<input type="checkbox" />',
        Employee: r.Employee,
        Qualification: r.Qualification,
        Level: r.Level,
        TargetDate: r.TargetDate,
        VerifiedBy: r.VerifiedBy,
        Details: '<a href="#" class="text-primary text-sm evaluate-link">Evaluate</a>'
      });
    }

    this.renderColVisibilityMenu('requested-col-visibility', allCols, 'authPending');
    this.drawTable('#auth-table', allCols, rows, 'authPending');

  }
  private renderAuthorizationMine(): void {
    const allCols = [
      { key: 'Employee', label: 'Employee', visible: true },
      { key: 'Qualification', label: 'Qualification', visible: true },
      { key: 'Level', label: 'Level', visible: true },
      { key: 'TargetDate', label: 'Target Date', visible: true },
      { key: 'VerifiedBy', label: 'Verified By', visible: true },
      { key: 'Withdraw', label: 'Withdraw', visible: true }
    ];

    const source: IAuthorizationRow[] = [];
    for (let i = 0; i < this.authorizationRows.length; i++) {
      if (this.authorizationRows[i].Status === 'Authorized') source.push(this.authorizationRows[i]);
    }

    const filtered = this.applySearch(source, this.authSearchQuery);
    const rows: any[] = [];
    for (let i = 0; i < filtered.length; i++) {
      const r = filtered[i];
      rows.push({
        Employee: r.Employee,
        Qualification: r.Qualification,
        Level: r.Level,
        TargetDate: r.TargetDate,
        VerifiedBy: r.VerifiedBy,
        Withdraw:
          '<a href="#" class="text-primary text-sm withdraw-btn">Withdrawn</a>'
      });
    }

    this.renderColVisibilityMenu('requested-col-visibility', allCols, 'authMine');
    this.drawTable('#auth-table', allCols, rows, 'authMine');

  }

  // ── Core Table Drawing ─────────────────────────────────────────────────────
  private drawTable(
    selector: string,
    allColumns: Array<{ key: string; label: string; visible: boolean }>,
    rows: any[],
    tabKey: string
  ): void {
    const table = this.domElement.querySelector(selector) as HTMLTableElement;
    if (!table) {
      console.warn('drawTable: "' + selector + '" matched no element.');
      return;
    }

    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    if (!thead || !tbody) {
      console.warn('drawTable: missing thead/tbody in "' + selector + '".');
      return;
    }

    // Determine visible columns
    const visibleCols: Array<{ key: string; label: string; visible: boolean }> = [];
    for (let i = 0; i < allColumns.length; i++) {
      const col = allColumns[i];
      if (col.key === 'chk' || col.key === 'Details' || col.key === 'Withdraw') {
        visibleCols.push(col);
        continue;
      }
      const stored = this.colVisibility[tabKey + '_' + col.key];
      if (stored !== false) {
        visibleCols.push(col);
      }
    }

    // ── Render header with sort arrows ────────────────────────────────────────
    let headHtml = '<tr>';
    for (let i = 0; i < visibleCols.length; i++) {
      const col = visibleCols[i];
      if (col.key === 'chk') {
        headHtml += '<th style="width:36px;"></th>';
      } else if (col.key === 'Details' || col.key === 'Withdraw') {
        headHtml +=
          '<th>' +
          '<div class="w-100 d-flex justify-content-between align-items-center">' +
          '<p class="text-color-3 font-medium text-sm lg-text-base">' + col.label + '</p>' +
          '</div>' +
          '</th>';
      } else {
        headHtml +=
          '<th class="sortable-col" data-sort-key="' + col.key + '" style="cursor:pointer;">' +
          '<div class="w-100 d-flex justify-content-between align-items-center gap-1" style="flex-wrap:nowrap;">' +
          '<p class="text-color-3 font-medium text-sm lg-text-base" style="margin:0;min-width:0;">' + col.label + '</p>' +
          this.getSortSVG(col.key) +
          '</div>' +
          '</th>';
      }
    }
    headHtml += '</tr>';
    thead.innerHTML = headHtml;

    // ── Bind sort click on each sortable <th> ─────────────────────────────────
    const self = this;
    const sortableThs = thead.querySelectorAll('.sortable-col');
    for (let i = 0; i < sortableThs.length; i++) {
      (function (th: Element) {
        th.addEventListener('click', function () {
          const clickedKey = th.getAttribute('data-sort-key') || '';

          if (self.sortState.key === clickedKey) {
            // Cycle: asc → desc → default
            if (self.sortState.direction === 'asc') {
              self.sortState.direction = 'desc';
            } else if (self.sortState.direction === 'desc') {
              self.sortState.direction = 'default';
              self.sortState.key = '';
            } else {
              self.sortState.direction = 'asc';
            }
          } else {
            self.sortState.key = clickedKey;
            self.sortState.direction = 'asc';
          }

          self.refreshCurrentView();
        });
      })(sortableThs[i]);
    }

    // ── Apply sorting before rendering rows ──────────────────────────────────
    const sortedRows = this.applySorting(rows, tabKey);

    // ── Render rows or empty state ────────────────────────────────────────────
    if (sortedRows.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="' + visibleCols.length + '" class="text-center text-muted py-4">' +
        'No records found.</td></tr>';
      return;
    }

    let bodyHtml = '';
    for (let i = 0; i < sortedRows.length; i++) {
      const row = sortedRows[i];
      bodyHtml += '<tr>';
      for (let j = 0; j < visibleCols.length; j++) {
        const val = row[visibleCols[j].key];
        bodyHtml += '<td>' + (val !== undefined && val !== null ? val : '') + '</td>';
      }
      bodyHtml += '</tr>';
    }
    tbody.innerHTML = bodyHtml;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  private getCheckedRowIndexes(tbody: Element): number[] {
    const checkboxes = tbody.querySelectorAll('input[type="checkbox"]');
    const indexes: number[] = [];
    for (let i = 0; i < checkboxes.length; i++) {
      if ((checkboxes[i] as HTMLInputElement).checked) indexes.push(i);
    }
    return indexes;
  }

  private applySearch<T>(rows: T[], query: string): T[] {
    if (!query) return rows;

    const q = query.toLowerCase();
    const result: T[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as any;
      const keys = Object.keys(row);
      let combined = '';
      for (let j = 0; j < keys.length; j++) {
        combined += String(row[keys[j]]) + ' ';
      }
      if (combined.toLowerCase().indexOf(q) !== -1) {
        result.push(rows[i]);
      }
    }

    return result;
  }




  // ── SPFx Boilerplate ───────────────────────────────────────────────────────
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