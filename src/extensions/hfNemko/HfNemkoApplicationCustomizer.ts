import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';

import * as strings from 'HfNemkoApplicationCustomizerStrings';

import HfNemkoHeader from './Header';
import HfNemkoFooter from './Footer';
import HfNemkoChatbot from './Chatbot';
import NemkoAdminCheck from '../../NemkoAdminCheck';
import { SPComponentLoader } from '@microsoft/sp-loader';
import { SPHttpClient, AadHttpClient } from '@microsoft/sp-http';

const LOG_SOURCE: string = 'HfNemkoApplicationCustomizer';
const DASHBOARD_API_BASE = 'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net';

export interface IHfNemkoApplicationCustomizerProperties {
  testMessage: string;
}

export default class HfNemkoApplicationCustomizer
  extends BaseApplicationCustomizer<IHfNemkoApplicationCustomizerProperties> {

  private _topPlaceholder: PlaceholderContent | undefined;
  private _bottomPlaceholder: PlaceholderContent | undefined;
  private _navigationHandler: any = null;
  private _apiClient: AadHttpClient | undefined;

private _sidebarObserver: MutationObserver | null = null; // add as class property

public async onInit(): Promise<void> {

  const currentPage = window.location.pathname.toLowerCase();
  const isCopilotPage = currentPage.indexOf('/sitepages/copilot.aspx') !== -1;

  const basePath = this.context.pageContext.web.serverRelativeUrl + "/SiteAssets/resources";

  // Always load CSS so hide-rules like #CommentsWrapper apply even on Copilot.aspx
  this.loadCssFiles(basePath);

  if (isCopilotPage) {
    return Promise.resolve();
  }

  Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

  this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceHolders);

  this._navigationHandler = this.context.application.navigatedEvent.add(this, () => {
    setTimeout(() => {
      this._renderFooter();
      this._updateHeaderActiveLink();
      this._detectSidebar();
    }, 300);
  });

  this.loadJsFiles(basePath);
  this._initApiClient();

  return Promise.resolve();
}



  private loadCssFiles(basePath: string): void {
    SPComponentLoader.loadCss(basePath + "/css/bootstrap.min.css");
    SPComponentLoader.loadCss(basePath + "/css/variable.css");
    SPComponentLoader.loadCss(basePath + "/css/font-size.css");
    SPComponentLoader.loadCss(basePath + "/css/swiper-bundle.min.css");
    SPComponentLoader.loadCss(basePath + "/css/custom.css?v=1");
    SPComponentLoader.loadCss(basePath + "/css/home.css");
    SPComponentLoader.loadCss(basePath + "/css/sp-custom.css");
  }

  private async loadJsFiles(basePath: string): Promise<void> {
    await SPComponentLoader.loadScript(basePath + "/js/jquery-3.6.0.js", { globalExportsName: "jQuery" });
    await SPComponentLoader.loadScript(basePath + "/js/bootstrap.bundle.min.js");
    await SPComponentLoader.loadScript(basePath + "/js/swiper-bundle.min.js");
    await SPComponentLoader.loadScript(basePath + "/js/common.js");
    await SPComponentLoader.loadScript(basePath + "/js/home.js");
  }

  private async _initApiClient(retries: number = 2): Promise<void> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        this._apiClient = await this.context.aadHttpClientFactory
          .getClient('api://66eda48a-d5f9-4db0-a911-0d936f8ce92b');
        return;
      } catch (err) {
        console.error(`[HfNemko] AAD client init attempt ${attempt + 1}/${retries + 1} failed:`, err);
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  }

private _headerInitialized: boolean = false;
private _footerLinks: Array<{ Title: string; RedirectUrl: string }> = [];

private _renderPlaceHolders(): void {

  /** HEADER */
  if (!this._topPlaceholder) {
    this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(
      PlaceholderName.Top,
      { onDispose: this._onDispose }
    );

    if (this._topPlaceholder?.domElement) {
      this._topPlaceholder.domElement.innerHTML =
        HfNemkoHeader.headerHTML
        .replace(
          /__KEY_RESOURCE_URL__/g,
          this.context.pageContext.web.absoluteUrl + "/SiteAssets"
        )
        .replace(/__KEY_HOME_URL__/g, this.context.pageContext.web.absoluteUrl + "/SitePages/HomePage.aspx?env=WebViewList")
        .replace("__KEY_ADMIN_URL__", this.context.pageContext.web.absoluteUrl + "/SitePages/AdminPage.aspx?env=WebViewList");

      // document.body.style.paddingTop = "60px";

      this._loadHeaderUserData().catch(() => { /* silent fallback */ });

      // Wait for DOM to settle before attaching
      setTimeout(() => {
        this._initNavbarToggler();
        this._updateHeaderActiveLink();
        this._applySidebarMode(false);
        this._detectSidebar();
      }, 100);
    }
  }

  this._renderFooter();

  /** CHATBOT */
if (!document.getElementById('nemko-chatbot')) {
  const div = document.createElement('div');
  div.innerHTML =
    HfNemkoChatbot.chatbotHTML
    .replace(
      /__KEY_RESOURCE_URL__/g,
      this.context.pageContext.web.absoluteUrl + "/SiteAssets"
    )
    .replace(
        /__KEY_COPILOT_URL__/g,
        this.context.pageContext.web.absoluteUrl + "/SitePages/Copilot.aspx"
      );
  document.body.appendChild(div);

  // ── Homepage: open chatbot by default, hide FAB ──
  const isHomePage = window.location.pathname.toLowerCase()
  .indexOf('/sitepages/homepage.aspx') !== -1;
  if (isHomePage) {
    const chat = div.querySelector('#nemko-chatbot');
    const fab = div.querySelector('#chatFab');
    chat?.classList.add('open');
    fab?.classList.remove('d-flex');
    fab?.classList.add('d-none');
  }

  this._attachChatEvents();
}
}

private _initNavbarToggler(): void {
  // Guard: only attach once
  if (this._headerInitialized) return;

  const toggler = document.getElementById('nm-nav-toggler') as HTMLElement;
  const target = document.getElementById('navbarSupportedContent') as HTMLElement;

  if (!toggler || !target) return;

  this._headerInitialized = true;

  // Sign-out must be a real, full navigation — SharePoint's SPA router
  // intercepts same-origin anchor clicks to do a client-side pushState
  // navigation instead, which SignOut.aspx can't complete (it needs an
  // actual round trip through the sign-out/redirect chain). Stopping
  // propagation here keeps the click from ever reaching that router's
  // document-level listener.
  const signOutLink = document.querySelector<HTMLAnchorElement>('.nemko-header a[href*="SignOut.aspx"]');
  signOutLink?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = signOutLink.href;
  });

  toggler.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = target.classList.contains('show');
    if (isOpen) {
      target.classList.remove('show');
      toggler.setAttribute('aria-expanded', 'false');
    } else {
      target.classList.add('show');
      toggler.setAttribute('aria-expanded', 'true');
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!document.querySelector('.nemko-header')?.contains(e.target as Node)) {
      target.classList.remove('show');
      toggler.setAttribute('aria-expanded', 'false');
    }
  });
}

  // Extracted into its own method so it can be called independently
  // on both initial render and SPA navigation events
  private _renderFooter(): void {

    if (!this._bottomPlaceholder) {
      this._bottomPlaceholder = this.context.placeholderProvider.tryCreateContent(
        PlaceholderName.Bottom,
        { onDispose: this._onDispose }
      );
    }

    if (this._bottomPlaceholder?.domElement) {
      this._bottomPlaceholder.domElement.innerHTML =
        HfNemkoFooter.footerHTML.replace(
          /__KEY_RESOURCE_URL__/g,
          this.context.pageContext.web.absoluteUrl + "/SiteAssets"
        );

      this._loadFooterLinks().catch(() => { /* silent fallback */ });

      // Move footer into the SP canvas so it flows naturally
      // with page content instead of being stuck in the viewport
      const spCanvasElement = document.querySelector('.SPCanvas div');
      if (spCanvasElement) {
        const existingFooter = spCanvasElement.querySelector('#bottomPlaceholder');
        if (existingFooter) existingFooter.remove();
        spCanvasElement.appendChild(this._bottomPlaceholder.domElement);
         window.dispatchEvent(new CustomEvent('nemkoFooterMounted'));
      }
    } else {
      console.log('[HfNemko] Could not load bottom placeholder');
    }
  }

  private _attachChatEvents(): void {

    const chat = document.getElementById('nemko-chatbot');
    const toggle = document.getElementById('chatFab');
    const close = document.getElementById('chat-close');

    if (!chat) return;

    toggle?.addEventListener('click', () => {
      chat.classList.toggle('open');
      toggle.classList.toggle('d-none');
    });

    close?.addEventListener('click', () => {
      chat.classList.remove('open');
      toggle?.classList.remove('d-none');
    });

    document.querySelectorAll('.nm-suggestion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.getElementById('chatInput') as HTMLTextAreaElement;
        const counter = document.getElementById('charCount');

        if (input && counter) {
          input.value = (btn as HTMLElement).innerText.trim();
          counter.innerText = `${input.value.length}/2000`;
          input.focus();
        }
      });
    });
  }

  private _detectSidebar(): void {
  // Disconnect any previous observer before starting a new one
  if (this._sidebarObserver) {
    this._sidebarObserver.disconnect();
    this._sidebarObserver = null;
  }

  // Sidebar already in DOM (e.g. refresh on sidebar page)
  if (document.querySelector('.nemko-sidebar')) {
    this._applySidebarMode(true);
    return;
  }

  // Default to home mode, then watch for sidebar being added
  this._applySidebarMode(false);

  this._sidebarObserver = new MutationObserver(() => {
    if (document.querySelector('.nemko-sidebar')) {
      this._applySidebarMode(true);
      this._sidebarObserver?.disconnect();
      this._sidebarObserver = null;
    }
  });

  this._sidebarObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Safety net: sidebar extension fires this event after mounting
  window.addEventListener('sidebarMounted', () => {
    this._applySidebarMode(true);
    this._sidebarObserver?.disconnect();
    this._sidebarObserver = null;
  }, { once: true });
}

private _applySidebarMode(hasSidebar: boolean): void {
  const header = document.querySelector('.nemko-header') as HTMLElement;
  const navbarMobTop = header?.querySelector('.navbar-mob-top') as HTMLElement;

  if (header) {
    header.classList.toggle('has-nemko-sidebar', hasSidebar);
  }

  if (!navbarMobTop) return;

  const baseUrl = this.context.pageContext.web.absoluteUrl;
  const tmp = document.createElement('div');

  if (hasSidebar) {
    // If the hamburger button already exists, do not replace it — any direct
    // click listeners attached by external JS (common.js) would be lost on
    // element recreation. Only remove the brand if it's there in its place.
    if (navbarMobTop.querySelector('.btn-hamburger')) {
      navbarMobTop.querySelector('.navbar-brand')?.remove();
      return;
    }
    navbarMobTop.querySelector('.navbar-brand')?.remove();
    tmp.innerHTML = HfNemkoHeader.sidebarModeLeft;
    navbarMobTop.insertBefore(tmp.firstElementChild!, navbarMobTop.firstChild);

    
  } else {
    // Guard: if brand already present, just remove a stray hamburger if any.
    if (navbarMobTop.querySelector('.navbar-brand')) {
      navbarMobTop.querySelector('.btn-hamburger')?.remove();
      return;
    }
    navbarMobTop.querySelector('.btn-hamburger')?.remove();
    tmp.innerHTML = HfNemkoHeader.homeModeLeft
      .replace('__KEY_HOME_URL__', baseUrl + '/SitePages/HomePage.aspx?env=WebViewList')
      .replace('__KEY_RESOURCE_URL__', baseUrl + '/SiteAssets');
    navbarMobTop.insertBefore(tmp.firstElementChild!, navbarMobTop.firstChild);
  }
}

  public onDispose(): void {
  if (this._navigationHandler) {
    this._navigationHandler.dispose();
  }
  // Disconnect observer on dispose
  if (this._sidebarObserver) {
    this._sidebarObserver.disconnect();
    this._sidebarObserver = null;
  }
  super.onDispose();
}
  private async _loadHeaderUserData(): Promise<void> {
    const container = this._topPlaceholder?.domElement;
    if (!container) return;

    // Default to Graph displayName; override with the Dashboard API's
    // employeeName if that call succeeds and returns a non-empty value.
    let displayName: string = '';

    try {
      const graphClient = await this.context.msGraphClientFactory.getClient('3');
      const user = await graphClient.api('/me').select('displayName').get();
      displayName = user.displayName ?? '';
    } catch (err) {
      console.error('[HfNemko] Failed to load display name from Graph:', err);
    }

    try {
      const employeeName = await this._fetchEmployeeNameFromDashboard();
      if (employeeName && employeeName.trim().length > 0) {
        displayName = employeeName;
      }
    } catch (err) {
      console.error('[HfNemko] Failed to load employeeName from Dashboard API:', err);
    }

    const nameEl = container.querySelector<HTMLElement>('#nav-user-name');
    if (nameEl) nameEl.textContent = displayName;

    try {
      const graphClient = await this.context.msGraphClientFactory.getClient('3');
      const photo = await graphClient.api('/me/photo/$value').get();
      const blob = photo instanceof Blob ? photo : new Blob([photo], { type: 'image/jpeg' });
      const blobUrl = URL.createObjectURL(blob);
      container.querySelectorAll<HTMLImageElement>('.nav-avatar').forEach(img => {
        img.src = blobUrl;
      });
    } catch {
      // keep avatar.png fallback
    }

    try {
      const isAdmin = await NemkoAdminCheck.isAdmin(this.context.pageContext.web.absoluteUrl);
      const adminLi = container.querySelector<HTMLElement>('#nav-admin-li');
      if (adminLi) adminLi.style.display = isAdmin ? '' : 'none';
    } catch (err) {
      console.error('[HfNemko] Failed to check Admin group:', err);
    }
  }

  // ── Dashboard API: fetches employeeName to override the Graph display name.
  // Waits (briefly) for _initApiClient to finish if it hasn't already, since
  // this can run before the AAD client is ready on first page load. ────────
  private async _fetchEmployeeNameFromDashboard(): Promise<string> {
    if (!this._apiClient) {
      await this._initApiClient(0);
    }
    if (!this._apiClient) return '';

    const response = await this._apiClient.get(
      `${DASHBOARD_API_BASE}/api/dashboard`,
      AadHttpClient.configurations.v1
    );

    if (!response.ok) return '';

    const result = await response.json();
    return result?.data?.employeeName ?? '';
  }

  private async _loadFooterLinks(): Promise<void> {
    if (this._footerLinks.length === 0) {
      const listUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('FooterUrl')/items?$select=Title,RedirectUrl&$orderby=Id`;
      const response = await this.context.spHttpClient.get(listUrl, SPHttpClient.configurations.v1);
      const data = await response.json();
      this._footerLinks = data.value ?? [];
    }

    this._populateFooterLinks();
  }

  private _populateFooterLinks(): void {
    const columns = [
      document.getElementById('footer-col-0'),
      document.getElementById('footer-col-1'),
      document.getElementById('footer-col-2'),
      document.getElementById('footer-col-3')
    ];

    columns.forEach(col => { if (col) col.innerHTML = ''; });

    this._footerLinks.forEach((item, index) => {
      const col = columns[index % 4];
      if (!col) return;
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.RedirectUrl || '#';
      a.textContent = item.Title;
      a.target = '_blank';
      li.appendChild(a);
      col.appendChild(li);
    });
  }

  private _onDispose(): void {
    console.log('[HfNemko] Disposed custom placeholders');
  }


  // ── Add this private method ───────────────────────────────────────────────
private _updateHeaderActiveLink(): void {
  const currentPath = window.location.pathname.toLowerCase();

  // Map of path keywords → nav link selectors
  const navLinks = document.querySelectorAll<HTMLAnchorElement>('.nemko-header .nav-link');

  navLinks.forEach(link => {
    const href = (link.getAttribute('href') || '').toLowerCase();

    // Skip empty or # links
    if (!href || href === '#') {
      link.classList.remove('active');
      return;
    }

    // Match by checking if current path contains the page name
    // e.g. /sitepages/homepage.aspx matches "homepage"
    // e.g. /sitepages/adminpage.aspx matches "adminpage"
    const url = new URL(href, window.location.origin);
    const linkPath = url.pathname.toLowerCase();

    if (currentPath === linkPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
}