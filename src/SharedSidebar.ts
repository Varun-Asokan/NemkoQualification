import NemkoAdminCheck from './NemkoAdminCheck';

export interface ISidebarConfig {
  resourceUrl: string;
  siteUrl: string;
  activeNavItem?: string;
  activeTabId?: string;
}

export default class SharedSidebar {


  private static _navHandlers: Record<string, (key: string) => void> = {};

  public static registerNavHandler(key: string, handler: (key: string) => void): void {
    SharedSidebar._navHandlers[key] = handler;
  }

  public static unregisterNavHandler(key: string): void {
    delete SharedSidebar._navHandlers[key];
  }

  public static getHtml(config: ISidebarConfig): string {
    const activeNav = config.activeNavItem ?? '';
    const activeTab = config.activeTabId ?? '';

    const navKeys = [
      'add-qualification', 'my-qualifications', 'my-verification',
      'my-authorizations', 'advanced-search', 'guidelines', 'add-new-standard'
    ];
    const tabIds = ['authorized-table', 'requested-table', 'advanced-search-table', 'database-table'];

    const qualTabs = ['authorized-table', 'requested-table'];
    const isQualTab = qualTabs.indexOf(activeTab) !== -1;

    let html = SharedSidebar.sidebarTemplate
      .replace(/__KEY_URL_RESOURCE__/g, config.resourceUrl)
      .replace(/__KEY_URL_RESOURCE_SITE__/g, config.siteUrl)
      .replace(/__KEY_HOME_URL__/g, config.siteUrl + '/SitePages/HomePage.aspx?env=WebViewList')
      .replace(/__SUBMENU_QUAL_SHOW__/g, isQualTab ? 'show' : '')
      .replace(/__SUBMENU_QUAL_ARIA__/g, isQualTab ? 'true' : 'false');

    const submenuTabToNav: Record<string, string> = {
      'authorized-table': 'my-qualifications',
      'requested-table': 'my-qualifications',
    };
    const parentNavKey = submenuTabToNav[activeTab];

    navKeys.forEach(key => {
      const token = new RegExp(`__ACTIVE_NAV__${key}__`, 'g');
      const isActive = activeNav === key || parentNavKey === key;
      html = html.replace(token, isActive ? 'active-sm-link' : '');
    });

    tabIds.forEach(id => {
      const token = new RegExp(`__ACTIVE_TAB__${id}__`, 'g');
      html = html.replace(token, activeTab === id ? 'active-submenu' : '');
    });

    return html;
  }



  public static initBehavior(domElement: HTMLElement, siteUrl: string): void {
    SharedSidebar.initSubmenuButtons(domElement, siteUrl);
    SharedSidebar.initNavLinks(domElement, siteUrl);
    SharedSidebar.applyAddNewStandardVisibility(domElement, siteUrl);

    window.dispatchEvent(new CustomEvent('sidebarMounted'));
  }

  private static applyAddNewStandardVisibility(domElement: HTMLElement, siteUrl: string): void {
    const link = domElement.querySelector<HTMLElement>('li:has(> a[data-nav-key="add-new-standard"])')
      ?? domElement.querySelector<HTMLElement>('a[data-nav-key="add-new-standard"]');
    if (!link) return;

    // Hide by default until the admin check resolves, to avoid a flash of visible content
    link.style.display = 'none';

    NemkoAdminCheck.isAdmin(siteUrl)
      .then(isAdminUser => { link.style.display = isAdminUser ? '' : 'none'; })
      .catch(() => { /* keep hidden on error */ });
  }

  private static initNavLinks(domElement: HTMLElement, siteUrl: string): void {
    const VERIF_PAGE = `${siteUrl}/SitePages/VerificationAuthorization.aspx`;

    const NAV_ROUTES: Record<string, string> = {
      'add-qualification': `${siteUrl}/SitePages/MyQualifications.aspx?modal=addQualification`,
      'my-verification': VERIF_PAGE,
      'my-authorizations': VERIF_PAGE,
      'advanced-search': `${siteUrl}/SitePages/AdvancedSearch.aspx`,
      'guidelines': `${siteUrl}/SitePages/Guidelines.aspx`,
      'add-new-standard': `${siteUrl}/SitePages/AdvancedSearch.aspx?open=create-standard`,

    };

    const NAV_TAB_PARAMS: Record<string, string> = {
      'my-verification': 'verification',
      'my-authorizations': 'authorization',
    };

    const TAB_DRIVEN_KEYS = new Set(Object.keys(NAV_TAB_PARAMS));

    // ── On load: auto-expand submenu if a child tab is active ────────────────
    const activeSubmenuBtn = domElement.querySelector<HTMLElement>('.submenu-list-btn.active-submenu');
    if (activeSubmenuBtn) {
      const parentSubmenu = activeSubmenuBtn.closest<HTMLElement>('.sidebar-submenu');
      if (parentSubmenu) {
        parentSubmenu.classList.add('show');
        const toggleLink = domElement.querySelector<HTMLElement>(
          `[aria-controls="${parentSubmenu.id}"]`
        );
        if (toggleLink) {
          toggleLink.setAttribute('aria-expanded', 'true');
          toggleLink.classList.add('active-sm-link');
        }
      }
    }

    // ── On load: highlight active nav link for simple pages (guidelines etc.) ─
    // Checks current URL pathname against each route to set active state
    const currentPath = window.location.pathname.toLowerCase();
    domElement.querySelectorAll<HTMLElement>('.sidebar-nav-link[data-nav-key]').forEach(link => {
      const key = link.getAttribute('data-nav-key') ?? '';
      const route = NAV_ROUTES[key];
      if (!route || route === '#') return;

      
      if (TAB_DRIVEN_KEYS.has(key) || key === 'add-qualification' || key === 'add-new-standard') return;

      try {
        const routePath = new URL(route).pathname.toLowerCase();
        if (currentPath === routePath && !link.classList.contains('active-sm-link')) {
          link.classList.add('active-sm-link');
        }
      } catch { }
    });

    // ── Click handlers ────────────────────────────────────────────────────────
    // href already carries the correct URL (with ?tab= where needed).
    // Only preventDefault when a registered in-page handler takes over.
    domElement.querySelectorAll<HTMLElement>('.sidebar-nav-link[data-nav-key]').forEach(link => {
      const key = link.getAttribute('data-nav-key') ?? '';
      if (!NAV_ROUTES[key]) return;

      link.addEventListener('click', (e) => {
        const handler = SharedSidebar._navHandlers[key];
        if (handler) {
          e.preventDefault();
          domElement.querySelectorAll<HTMLElement>('.sidebar-nav-link')
            .forEach(l => l.classList.remove('active-sm-link'));
          domElement.querySelectorAll<HTMLElement>('.submenu-list-btn')
            .forEach(b => b.classList.remove('active-submenu'));
          link.classList.add('active-sm-link');
          handler(key);
        }
        // else: let the href navigate naturally
      });
    });
  }



  private static initSubmenuButtons(domElement: HTMLElement, siteUrl: string): void {
    const MY_QUAL_PAGE = `${siteUrl}/SitePages/MyQualifications.aspx`;

    const submenuBtns = domElement.querySelectorAll<HTMLElement>('.submenu-list-btn');

    const initialActive = domElement.querySelector<HTMLElement>('.submenu-list-btn.active-submenu');
    if (initialActive) {
      const initialTabId = initialActive.getAttribute('data-tab-id');
      if (initialTabId) SharedSidebar.activateTab(domElement, initialTabId);
    }

    submenuBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabId = btn.getAttribute('data-tab-id') ?? '';

        const currentPath = window.location.pathname.toLowerCase();
        const qualPath = new URL(MY_QUAL_PAGE).pathname.toLowerCase();
        const isOnQualPage = currentPath === qualPath;

        if (isOnQualPage) {
          e.preventDefault();
          SharedSidebar.activateTab(domElement, tabId);
        }
        // else: let href navigate to MyQualifications.aspx?tab=...
      });
    });

    domElement.querySelectorAll<HTMLElement>('.nemko-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab-id');
        if (!tabId) return;

        const qualTabIds = ['authorized-table', 'requested-table'];
        const verifTabIds = ['verif-verification-table', 'verif-authorization-table'];

        if (qualTabIds.indexOf(tabId) !== -1) {
          // My Qualifications page — sync submenu active state
          domElement.querySelectorAll<HTMLElement>('.submenu-list-btn').forEach(b => {
            b.classList.toggle('active-submenu', b.getAttribute('data-tab-id') === tabId);
          });
          domElement.querySelectorAll<HTMLElement>('.sidebar-nav-link')
            .forEach(l => l.classList.remove('active-sm-link'));
          const matchingNavLink = domElement.querySelector<HTMLElement>(
            `.sidebar-nav-link[data-tab-id="${tabId}"]`
          );
          if (matchingNavLink) matchingNavLink.classList.add('active-sm-link');

        } else if (verifTabIds.indexOf(tabId) !== -1) {
          // My Verification / My Authorization page — sync sidebar nav link
          const navKey = tabId === 'verif-authorization-table' ? 'my-authorizations' : 'my-verification';
          domElement.querySelectorAll<HTMLElement>('.sidebar-nav-link')
            .forEach(l => l.classList.remove('active-sm-link'));
          const activeLink = domElement.querySelector<HTMLElement>(
            `.sidebar-nav-link[data-nav-key="${navKey}"]`
          );
          if (activeLink) activeLink.classList.add('active-sm-link');

        }
      });
    });
  }

  private static activateTab(domElement: HTMLElement, tabId: string): void {
    // 1. Sidebar submenu links
    domElement.querySelectorAll<HTMLElement>('.submenu-list-btn').forEach(b => {
      b.classList.toggle('active-submenu', b.getAttribute('data-tab-id') === tabId);
    });

    // 2. Top tab buttons
    domElement.querySelectorAll<HTMLElement>('.nemko-tab-btn').forEach(tb => {
      tb.classList.toggle('nemko-tab-btn-active', tb.getAttribute('data-tab-id') === tabId);
    });

    // 3. Tab panels — only toggle if panels actually exist on this page
    const panels = domElement.querySelectorAll<HTMLElement>('[id$="-table"]');
    if (panels.length > 0) {
      panels.forEach(panel => {
        panel.style.display = panel.id === tabId ? 'block' : 'none';
      });
    }

    // 4. Highlight parent nav link
    const activeBtn = domElement.querySelector<HTMLElement>(
      `.submenu-list-btn[data-tab-id="${tabId}"]`
    );
    if (activeBtn) {
      const parentSubmenu = activeBtn.closest<HTMLElement>('.sidebar-submenu');
      if (parentSubmenu) {
        const parentId = parentSubmenu.id;
        const parentNavLink = domElement.querySelector<HTMLElement>(
          `[aria-controls="${parentId}"]`
        );
        if (parentNavLink) {
          domElement.querySelectorAll<HTMLElement>('.sidebar-nav-link')
            .forEach(l => l.classList.remove('active-sm-link'));
          parentNavLink.classList.add('active-sm-link');
        }
      }
    }
  }

  // ... sidebarTemplate and globalModalsHtml unchanged


  // ─────────────────────────────────────────────────────────────────────────
  private static readonly sidebarTemplate: string = `
<div class="sidebar-overlay" id="sidebarOverlay"></div>

<aside class="nemko-sidebar">
  <div class="w-100 float-start px-3">
    <div class="sidebar-brand w-100 float-start d-flex justify-content-center align-items-center">
      <a href="__KEY_HOME_URL__">
        <img src="__KEY_URL_RESOURCE__/resources/images/logo-white.png" alt="" />
      </a>
    </div>
  </div>
  <div class="flex-grow-1 overflow-hidden min-w-0 d-flex py-3 px-1">
    <ul class="sidebar-nav w-100 float-start overflow-auto custom-scroll-view px-1 d-flex flex-column gap-1">

      <li class="w-100 float-start">
        <a href="__KEY_URL_RESOURCE_SITE__/SitePages/MyQualifications.aspx?modal=addQualification" data-nav-key="add-qualification"
           class="sidebar-nav-link nemko-open-add-qualification-modal __ACTIVE_NAV__add-qualification__">
          <img class="sidemenu-icon"
               src="__KEY_URL_RESOURCE__/resources/images/icons/sidemenu/add-qualification.png"
               alt="Add Qualification" />
          <p class="text-base font-medium">Add Qualification</p>
        </a>
      </li>

     <li class="w-100 float-start">
      <a href="#submenuQual" data-nav-key="my-qualifications"
        class="sidebar-nav-link __ACTIVE_NAV__my-qualifications__"
        data-bs-toggle="collapse" 
        aria-expanded="__SUBMENU_QUAL_ARIA__"   
        aria-controls="submenuQual">
        <img class="sidemenu-icon"
            src="__KEY_URL_RESOURCE__/resources/images/icons/sidemenu/my-qualifications.png"
            alt="My Qualifications" />
        <p class="text-base font-medium">My Qualifications</p>
        <svg class="ms-auto" width="13" height="7" viewBox="0 0 13 7" fill="none">
          <path fill-rule="evenodd" clip-rule="evenodd"
            d="M5.77789 6.72168L-5.87545e-08 1.34415L1.44422 -5.05119e-07L6.5 4.70546L11.5558 -6.31287e-08L13 1.34415L7.22211 6.72168C7.03057 6.89989 6.77083 7 6.5 7C6.22917 7 5.96943 6.89989 5.77789 6.72168Z"
            fill="white"/>
        </svg>
      </a>
      <ul class="sidebar-submenu collapse __SUBMENU_QUAL_SHOW__" id="submenuQual">
        <li class="my-2">
          <a href="__KEY_URL_RESOURCE_SITE__/SitePages/MyQualifications.aspx?tab=authorized"
            data-tab-id="authorized-table"
            class="text-sm font-normal submenu-list-btn __ACTIVE_TAB__authorized-table__">
            Authorized
          </a>
        </li>
        <li class="my-2">
          <a href="__KEY_URL_RESOURCE_SITE__/SitePages/MyQualifications.aspx?tab=requested"
            data-tab-id="requested-table"
            class="text-sm font-normal submenu-list-btn __ACTIVE_TAB__requested-table__">
            Requested
          </a>
        </li>
      </ul>
    </li>

      <li class="w-100 float-start">
        <a href="__KEY_URL_RESOURCE_SITE__/SitePages/VerificationAuthorization.aspx?tab=verification" data-nav-key="my-verification" data-tab-id="verif-verification-table"
          class="sidebar-nav-link __ACTIVE_NAV__my-verification__">
          <img class="sidemenu-icon"
               src="__KEY_URL_RESOURCE__/resources/images/icons/sidemenu/my-verification.png"
               alt="My Verification" />
          <p class="text-base font-medium">My Verification</p>
        </a>
      </li>

      <li class="w-100 float-start">
        <a href="__KEY_URL_RESOURCE_SITE__/SitePages/VerificationAuthorization.aspx?tab=authorization" data-nav-key="my-authorizations" data-tab-id="verif-authorization-table"
          class="sidebar-nav-link __ACTIVE_NAV__my-authorizations__">
          <img class="sidemenu-icon"
               src="__KEY_URL_RESOURCE__/resources/images/icons/sidemenu/my-authorizations.png"
               alt="My Authorizations" />
          <p class="text-base font-medium">My Authorizations</p>
        </a>
      </li>

      <li class="w-100 float-start">
        <a href="__KEY_URL_RESOURCE_SITE__/SitePages/AdvancedSearch.aspx" data-nav-key="advanced-search"
           class="sidebar-nav-link __ACTIVE_NAV__advanced-search__">
          <img class="sidemenu-icon"
               src="__KEY_URL_RESOURCE__/resources/images/icons/sidemenu/advanced-search.png"
               alt="Advanced Search" />
          <p class="text-base font-medium">Advanced Search</p>
        </a>
      </li>

      <li class="w-100 float-start">
        <a href="__KEY_URL_RESOURCE_SITE__/SitePages/Guidelines.aspx" data-nav-key="guidelines"
           class="sidebar-nav-link __ACTIVE_NAV__guidelines__">
          <img class="sidemenu-icon"
               src="__KEY_URL_RESOURCE__/resources/images/icons/sidemenu/guidelines.png"
               alt="Guidelines" />
          <p class="text-base font-medium">Guidelines</p>
        </a>
      </li>

      <li class="w-100 float-start">
        <a href="__KEY_URL_RESOURCE_SITE__/SitePages/AdvancedSearch.aspx?open=create-standard" data-nav-key="add-new-standard"
           class="sidebar-nav-link __ACTIVE_NAV__add-new-standard__">
          <img class="sidemenu-icon"
               src="__KEY_URL_RESOURCE__/resources/images/icons/sidemenu/add-new-standared.png"
               alt="Add new Standard" />
          <p class="text-base font-medium">Add new Standard</p>
        </a>
      </li>

    </ul>
  </div>
</aside>
  `;

 


}


