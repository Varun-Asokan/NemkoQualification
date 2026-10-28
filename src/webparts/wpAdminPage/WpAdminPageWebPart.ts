import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { AadHttpClient } from '@microsoft/sp-http';
import AdminPage from './AdminPageUi';
import { SPComponentLoader } from '@microsoft/sp-loader';
import * as strings from 'WpAdminPageWebPartStrings';
import SharedSidebar from '../../SharedSidebar';

export interface IWpAdminPageWebPartProps {
  description: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE_URL =
  'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net';

//  AAD App ID — same as the AdvancedSearch / Verification & Authorization webparts
const AAD_APP_ID = 'api://66eda48a-d5f9-4db0-a911-0d936f8ce92b';

export default class WpAdminPageWebPart extends BaseClientSideWebPart<IWpAdminPageWebPartProps> {

private siteUrl: string = '';
private apiClient!: AadHttpClient;

// ── Import modal state ──────────────────────────────────────────────────────
private _pendingImportFile: File | null = null;

// ── Cache of the qualification import type's column names, populated on
//    demand from GET /api/ImportMetadata/columns/qualification (used to
//    render the information modal table). Same pattern as
//    WpAdvancedSearchWebPart._importColumnsCache. ───────────────────────────
private _importColumnsCache: Record<string, string[]> = {};

  public render(): void {
      const resourceUrl = `${this.siteUrl}/SiteAssets`;
      const metadataUrl = `${this.siteUrl}/SitePages/AdvancedSearch.aspx?env=WebViewList`;
      const employeeUrl = `${this.siteUrl}/SitePages/Employees.aspx?env=WebViewList`;
      const globalUrl = `${this.siteUrl}/SitePages/GlobalVerifier.aspx?env=WebViewList`;
      const overrideRulesUrl = `${this.siteUrl}/SitePages/AdminOverride.aspx?env=WebViewList`;

      this.domElement.innerHTML =
        SharedSidebar.getHtml({
          resourceUrl,
          siteUrl: this.siteUrl,
          activeNavItem: '',
          activeTabId: '',
        }) +
        AdminPage.allElementsHtml
        .replace(/__KEY_URL_RESOURCE__/g, resourceUrl)
        .replace("__KEY_MASTERDATA_URL__", metadataUrl)
        .replace("__KEY_EMPLOYEES_URL__", employeeUrl)
        .replace("__KEY_GLOBALAUTH_URL__", globalUrl)
        .replace("__KEY_OVERRIDE_RULES_URL__", overrideRulesUrl)
        
        
      // ── Sidebar init — no timeout needed ─────────────────────────────────
      SharedSidebar.initBehavior(this.domElement, this.siteUrl);
      this.initWhenReady();
      this.bindImportModal();
  
     
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

protected onInit(): Promise<void> {
    this.siteUrl = this.context.pageContext.web.absoluteUrl;
    this.loadCSS();

    window.onpopstate = () => {
      this.render();
    };

    return this.context.aadHttpClientFactory
      .getClient(AAD_APP_ID)
      .then(client => {
        this.apiClient = client;
      })
      .catch(err => {
        console.error('[NEMKO] AAD client init failed:', err);
      });
  }

   private loadCSS(): void {
      SPComponentLoader.loadCss(`${this.siteUrl}/SiteAssets/resources/css/jquery-ui.css`);
      SPComponentLoader.loadCss(`${this.siteUrl}/SiteAssets/resources/css/nemko-modal.css`);
      SPComponentLoader.loadCss(`${this.siteUrl}/SiteAssets/resources/css/qualification-db.css`)
      SPComponentLoader.loadCss(`${this.siteUrl}/SiteAssets/resources/css/admin.css`);
      // ← removed setTimeout loadHomeScripts — render() calls it directly
    }

  // ══════════════════════════════════════════════════════════════════════════
  // IMPORT QUALIFICATION — moved over from WpVerificationAndAuthorizationWebPart,
  // now using the same ImportMetadata-driven pattern as
  // WpAdvancedSearchWebPart (Standard / Scheme / Test Method / Employee):
  // column names for the information modal and the downloadable template
  // both come live from the backend. All validation (file type, column
  // names/positions, data) is done solely by the backend — the client just
  // uploads the raw file and surfaces whatever error/success response the
  // API returns.
  // ══════════════════════════════════════════════════════════════════════════

  /** Converts a 0-based index into a spreadsheet-style column letter (0→A, 25→Z, 26→AA, ...). */
  private getColumnLetter(index: number): string {
    let n = index;
    let letter = '';
    do {
      letter = String.fromCharCode(65 + (n % 26)) + letter;
      n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    return letter;
  }

  /**
   * Fetches an import type's column names from
   * GET /api/ImportMetadata/columns/{importType}, caching the result per
   * importType so re-opening the information modal doesn't re-fetch.
   */
  private async fetchImportColumns(importType: string): Promise<string[]> {
    if (this._importColumnsCache[importType]) {
      return this._importColumnsCache[importType];
    }
    if (!this.apiClient) { throw new Error('API client not ready. Please try again.'); }

    const url = `${API_BASE_URL}/api/ImportMetadata/columns/${importType}`;
    const response = await this.apiClient.fetch(url, AadHttpClient.configurations.v1, { method: 'GET' });
    const raw = await response.text();
    let json: any = null;
    try { json = raw ? JSON.parse(raw) : null; } catch { json = null; }

    if (!response.ok) {
      throw new Error(json?.message || ('API ' + response.status + ': ' + raw));
    }

    const columns: string[] = Array.isArray(json?.data) ? json.data : [];
    this._importColumnsCache[importType] = columns;
    return columns;
  }

  /** Minimal HTML-escaping for column names inserted via innerHTML. */
  private escapeHtml(value: string): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Renders the given import type's information-modal table header (A, B, C...)
   * and single data row from the given column names, e.g.
   * #info-modal-table-head-qualification / -body-qualification.
   */
  private populateInformationModalColumns(importType: string, columns: string[]): void {
    const thead = this.domElement.querySelector(`#info-modal-table-head-${importType}`) as HTMLElement;
    const tbody = this.domElement.querySelector(`#info-modal-table-body-${importType}`) as HTMLElement;
    if (!thead || !tbody) return;

    const headerCells = columns.map((_, i) =>
      `<th class="text-sm">${this.getColumnLetter(i)}</th>`
    ).join('');
    const dataCells = columns.map(col => `<td>${this.escapeHtml(col)}</td>`).join('');

    thead.innerHTML = `<tr>${headerCells}</tr>`;
    tbody.innerHTML = `<tr>${dataCells}</tr>`;
  }

  // ── Bind Import Modal ──────────────────────────────────────────────────────
  private bindImportModal(): void {
    const self = this;

    this.domElement.querySelector('#import-qual-tile')?.addEventListener('click', () => {
      self.resetImportModal();
      self.openModal('editTempDocModal');
    });

    const fileInput = this.domElement.querySelector(
      '#editTempDocModal input[type="file"]'
    ) as HTMLInputElement;

    const fileNameDisplay = this.domElement.querySelector(
      '#editTempDocModal .form-control[disabled]'
    ) as HTMLInputElement;

    if (fileInput && fileNameDisplay) {
      fileInput.addEventListener('change', () => {
        const file = fileInput.files?.[0];
        fileNameDisplay.value = file ? file.name : '';
        self._pendingImportFile = file ?? null;
        self.setImportError('');
      });
    }

    // ── Download Template — fetches the actual file straight from the
    //    backend (GET /api/ImportMetadata/file/qualification), same pattern
    //    as WpAdvancedSearchWebPart's downloadBtn handler. ─────────────────
    const downloadBtn = this.domElement.querySelector(
      '#editTempDocModal .nemko-btn-download'
    ) as HTMLButtonElement;

    if (downloadBtn) {
      downloadBtn.addEventListener('click', async () => {
        if (!self.apiClient) { self.setImportError('API client not ready. Please try again.'); return; }

        const originalLabel = downloadBtn.textContent;
        downloadBtn.disabled = true;
        downloadBtn.textContent = 'Downloading...';

        try {
          const url = `${API_BASE_URL}/api/ImportMetadata/file/qualification`;
          const response = await self.apiClient.fetch(url, AadHttpClient.configurations.v1, { method: 'GET' });

          if (!response.ok) {
            const raw = await response.text();
            throw new Error('API ' + response.status + ': ' + raw);
          }

          const blob = await response.blob();

          // Prefer the filename from Content-Disposition (if the API sends one),
          // falling back to a sensible default.
          let fileName = 'qualification-template.xlsx';
          const disposition = response.headers?.get?.('content-disposition');
          const match = disposition ? /filename\*?=(?:UTF-8'')?"?([^;"]+)"?/i.exec(disposition) : null;
          if (match && match[1]) { fileName = decodeURIComponent(match[1].trim()); }

          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
        } catch (err) {
          console.error('[NEMKO] Template download failed:', err);
          self.setImportError('Could not download the template: ' + (err as Error).message);
        } finally {
          downloadBtn.disabled = false;
          downloadBtn.textContent = originalLabel;
        }
      });
    }

    // ── Info icon — fetches the current column list from the backend
    //    (GET /api/ImportMetadata/columns/qualification), renders the
    //    A/B/C... header + data row from it, then opens the info modal.
    //    Same pattern as WpAdvancedSearchWebPart's templateInfoBtn handler. ──
    const templateInfoBtn = this.domElement.querySelector('#import-template-info-btn') as HTMLButtonElement;
    if (templateInfoBtn) {
      templateInfoBtn.addEventListener('click', async () => {
        try {
          const columns = await self.fetchImportColumns('qualification');
          self.populateInformationModalColumns('qualification', columns);
        } catch (err) {
          console.error('[NEMKO] Fetching template columns failed:', err);
          self.setImportError('Could not load column information: ' + (err as Error).message);
          return;
        }
        self.closeModal('editTempDocModal');
        self.openModal('informationModalQualification');
      });
    }

    const uploadBtn = this.domElement.querySelector(
      '#editTempDocModal .nemko-btn-save'
    ) as HTMLButtonElement;

    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => self.handleImportUpload(fileInput));
    }

    // ── Ok / dismiss on the information modal — closes it and returns to
    //    the import modal, same as WpAdvancedSearchWebPart. ────────────────
    this.domElement.addEventListener('click', function (e: Event) {
      const target = e.target as HTMLElement;
      const btn = target.closest('.info-modal-ok-btn') as HTMLElement;
      if (!btn) return;
      const modalId = btn.dataset.modalId ?? '';
      if (modalId) self.closeModal(modalId);
      self.openModal('editTempDocModal');
    });

    this.domElement.addEventListener('click', function (e: Event) {
      const target = e.target as HTMLElement;
      const btn = target.closest('.info-modal-dismiss-btn') as HTMLElement;
      if (!btn) return;
      const modalId = btn.dataset.modalId ?? '';
      if (modalId) self.closeModal(modalId);
      self.openModal('editTempDocModal');
    });

    // ── Close / cancel on the import modal itself. ─────────────────────────
    this.domElement.addEventListener('click', function (e: Event) {
      const target = e.target as HTMLElement;
      if (!target.closest('.import-modal-close-btn')) return;
      e.preventDefault();
      self.resetImportModal();
      self.closeModal('editTempDocModal');
    });
  }

  private resetImportModal(): void {
    const fileNameDisplay = this.domElement.querySelector('#editTempDocModal .form-control[disabled]') as HTMLInputElement;
    if (fileNameDisplay) fileNameDisplay.value = '';
    const fileInput = this.domElement.querySelector('#editTempDocModal input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    this._pendingImportFile = null;
    this.setImportError('');
  }

  /**
   * Upload handler. No client-side file-type or column validation — the file
   * is sent to the backend as-is, and any validation error the API returns
   * (type, columns, data, ...) is surfaced to the user as-is. Same contract
   * as WpAdvancedSearchWebPart's uploadBtn handler.
   */
  private async handleImportUpload(fileInput?: HTMLInputElement): Promise<void> {
    this.setImportError('');

    const input = fileInput ?? (this.domElement.querySelector('#editTempDocModal input[type="file"]') as HTMLInputElement);
    const file = (input?.files && input.files.length > 0 ? input.files[0] : null) ?? this._pendingImportFile;
    if (!file) { this.setImportError('Please select a file before uploading.'); return; }

    if (!this.apiClient) { this.setImportError('API client not ready. Please try again.'); return; }

    const uploadBtn = this.domElement.querySelector('#editTempDocModal .nemko-btn-save') as HTMLButtonElement;
    const originalLabel = uploadBtn ? uploadBtn.textContent : null;

    if (uploadBtn) { uploadBtn.disabled = true; uploadBtn.textContent = 'Uploading...'; }

    try {
      const formData = new FormData();
      formData.append('file', file, file.name);

      const url = `${API_BASE_URL}/api/import/qualification`;
      console.log('[NEMKO] Importing file:', file.name, '→', url);

      const response = await this.apiClient!.fetch(url, AadHttpClient.configurations.v1, {
        method: 'POST',
        body: formData
      });

      // Read the body once as text, then try to parse it as JSON — works
      // whether the response is a proper JSON error/success payload or a
      // plain-text error, and avoids "body already read" issues from
      // attempting response.json() and response.text() separately.
      const raw = await response.text();
      let json: any = null;
      try { json = raw ? JSON.parse(raw) : null; } catch { json = null; }

      if (!response.ok) {
        throw new Error(json?.message || ('API ' + response.status + ': ' + raw));
      }

      this._pendingImportFile = null;
      this.resetImportModal();
      this.closeModal('editTempDocModal');

      // Show the API's own message + a breakdown of its `data` stats,
      // instead of a hardcoded success string.
      const baseMsg = json?.message || `File "${file.name}" imported successfully. Records are being processed.`;
      const summaryText = json?.data ? this.formatImportSummary(json.data) : '';
      alert(summaryText ? `${baseMsg}\n\n${summaryText}` : baseMsg);

    } catch (err) {
      console.error('[NEMKO] Import failed:', err);
      this.setImportError('Upload failed: ' + (err as Error).message);
    } finally {
      if (uploadBtn) { uploadBtn.disabled = false; uploadBtn.textContent = originalLabel; }
    }
  }

  // ── Turns an arbitrary API `data` summary object (e.g. totalRequested,
  // qualificationsWithInvalidStandard, ...) into readable "Label: value"
  // lines, one per key, in the order the API returned them. Handles any
  // camelCase key generically rather than hardcoding specific field names,
  // so it stays correct if the backend adds/removes stats. ───────────────────
  private formatImportSummary(data: Record<string, any>): string {
    const toLabel = (key: string): string =>
      key
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/^./, (c) => c.toUpperCase())
        .trim();

    return Object.keys(data)
      .map((key) => `${toLabel(key)}: ${data[key]}`)
      .join('\n');
  }

  private setImportError(msg: string): void {
    const el = this.domElement.querySelector('#import-file-error') as HTMLElement;
    if (!el) return;
    el.textContent = msg;
    el.style.display = msg ? 'block' : 'none';
  }

  // ── Modal open/close helpers ─────────────────────────────────────────────
  // Same approach as WpEmployeesWebPart / WpMyQualificationsWebPart: hand off
  // to the real Bootstrap modal plugin (via jQuery) instead of toggling
  // classes/inline styles by hand. This gives us the dark backdrop,
  // click-outside-to-close and Esc-to-close behaviour for free (respecting
  // data-bs-backdrop="static" / data-bs-keyboard="false" on modals that
  // must stay open until explicitly dismissed).
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
