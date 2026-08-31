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
// Bundled at build time via webpack (run `npm install xlsx --save` first) —
// avoids all runtime script-loading issues (CDN blocking, CSP, AMD conflicts).
// Same library + same header-validation pattern used by WpAdvancedSearchWebPart
// and (previously) WpVerificationAndAuthorizationWebPart, which this Import
// Qualification tile + modal was moved over from.
import * as XLSX from 'xlsx';

export interface IWpAdminPageWebPartProps {
  description: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE_URL =
  'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net';

// ✅ AAD App ID — same as the AdvancedSearch / Verification & Authorization webparts
const AAD_APP_ID = 'api://66eda48a-d5f9-4db0-a911-0d936f8ce92b';

export default class WpAdminPageWebPart extends BaseClientSideWebPart<IWpAdminPageWebPartProps> {

private siteUrl: string = '';
private apiClient!: AadHttpClient;

// ── Import modal state ──────────────────────────────────────────────────────
private _pendingImportFile: File | null = null;

// ── Import template column definitions (name + position, used for both the
//    downloadable template and client-side validation of uploaded files) ────
// Same pattern as WpAdvancedSearchWebPart.TEMPLATE_COLUMNS — there's only one
// import type here ("qualification"), so the map has a single key.
private readonly TEMPLATE_COLUMNS: Record<string, string[]> = {
  qualification: [
    'ExternalQualificationID', 'Employee Email Address', 'Qualification', 'Level',
    'Type', 'Qualified Date', 'Verifier Email Address', 'Authorizer Email Address',
    'Limitations', 'Remarks', 'Status', 'IsRejected', 'Withdrawn Date',
    'Report Approver', 'Conformity Statement', 'Certification Decision'
  ]
};

  public render(): void {
      const resourceUrl = `${this.siteUrl}/SiteAssets`;
      const metadataUrl = `${this.siteUrl}/SitePages/AdvancedSearch.aspx?env=WebViewList`;
      const employeeUrl = `${this.siteUrl}/SitePages/Employees.aspx?env=WebViewList`;
      const globalUrl = `${this.siteUrl}/SitePages/GlobalVerifier.aspx?env=WebViewList`;

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
      SPComponentLoader.loadCss(`${this.siteUrl}/SiteAssets/resources/css/qualification-db.css`);
      SPComponentLoader.loadCss(`${this.siteUrl}/SiteAssets/resources/css/admin.css`);
      // ← removed setTimeout loadHomeScripts — render() calls it directly
    }

  // ══════════════════════════════════════════════════════════════════════════
  // IMPORT QUALIFICATION — moved over from WpVerificationAndAuthorizationWebPart.
  // Header validation uses the bundled XLSX (SheetJS) library +
  // validateTemplateColumns() to check both column names AND their position
  // before uploading.
  // ══════════════════════════════════════════════════════════════════════════

  /** Basic RFC4180-ish CSV line parser (handles quoted fields containing commas). */
  private parseCsvHeaderLine(line: string): string[] {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') { cur += '"'; i++; }
          else { inQuotes = false; }
        } else {
          cur += ch;
        }
      } else {
        if (ch === '"') { inQuotes = true; }
        else if (ch === ',') { result.push(cur); cur = ''; }
        else { cur += ch; }
      }
    }
    result.push(cur);
    return result.map(s => s.trim());
  }

  /** Reads a File as text using FileReader (broader browser support than Blob.text()). */
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(reader.error || new Error('Failed to read the file as text.'));
      reader.readAsText(file);
    });
  }

  /** Reads a File as an ArrayBuffer using FileReader (broader browser support than Blob.arrayBuffer()). */
  private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error || new Error('Failed to read the file as binary data.'));
      reader.readAsArrayBuffer(file);
    });
  }

  /** Reads just the header (first) row from a .csv / .xls / .xlsx file. */
  private async readFileHeaderRow(file: File): Promise<string[]> {
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (ext === '.csv') {
      const text = await this.readFileAsText(file);
      const lines = text.split(/\r\n|\n|\r/);
      let firstLine = '';
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().length > 0) { firstLine = lines[i]; break; }
      }
      // Strip a leading UTF-8 BOM if present, same as the previous CSV path.
      return this.parseCsvHeaderLine(firstLine.replace(/^\uFEFF/, ''));
    }

    // .xls / .xlsx — XLSX is the bundled npm module imported at the top of this file.
    // Handles legacy binary .xls AND modern zip/deflate .xlsx, so hand-rolled
    // zip/inflate parsing is not needed.
    const buffer = await this.readFileAsArrayBuffer(file);
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook && workbook.SheetNames ? workbook.SheetNames[0] : null;
    if (!firstSheetName) {
      throw new Error('The file does not contain any readable sheets.');
    }
    const sheet = workbook.Sheets[firstSheetName];
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false, defval: '' });
    const headerRow = (rows && rows.length) ? rows[0] : [];
    return headerRow.map((c: any) => String(c ?? '').trim());
  }

  /**
   * Compares the uploaded header row against the expected template column
   * names + positions for the given import type. Same contract as
   * WpAdvancedSearchWebPart.validateTemplateColumns — returns null when valid,
   * or a human-readable error message otherwise.
   */
  private validateTemplateColumns(headerRow: string[], importType: string): string | null {
    const expected = this.TEMPLATE_COLUMNS[importType] || [];
    if (!expected.length) return null;

    const trimVal = (s: string) => (s ?? '').toString().trim();
    let actual = (headerRow || []).map(trimVal);

    if (actual.length === 0 || actual.every(c => !c)) {
      return 'The file has no header row. Please use the provided template and do not remove the column headings.';
    }

    // Ignore trailing phantom columns — Excel/Sheets can inflate the sheet's
    // used range with empty, formatting-only columns beyond the real data
    // (e.g. a stray fill/border applied to column Q). Only strip blanks that
    // come AFTER the last non-blank header so a genuine extra named column
    // still fails validation as expected.
    let lastNonBlank = actual.length - 1;
    while (lastNonBlank >= 0 && !actual[lastNonBlank]) {
      lastNonBlank--;
    }
    actual = actual.slice(0, lastNonBlank + 1);

    if (actual.length !== expected.length) {
      return `Expected ${expected.length} column(s) but found ${actual.length}. Expected columns (in order): ${expected.join(', ')}.`;
    }

    const mismatches: string[] = [];
    for (let i = 0; i < expected.length; i++) {
      if (trimVal(expected[i]) !== actual[i]) {
        mismatches.push(`position ${i + 1}: expected "${expected[i]}" but found "${headerRow[i] || '(blank)'}"`);
      }
    }

    if (mismatches.length) {
      return `Column heading mismatch — ${mismatches.join('; ')}. Please check the column names, capitalization, and their order match the template exactly.`;
    }

    return null;
  }

  // ── Bind Import Modal ──────────────────────────────────────────────────────
  private bindImportModal(): void {
    const self = this;

    this.domElement.querySelector('#import-qual-tile')?.addEventListener('click', () => {
      self.resetImportModal();
      self.openModal('editTempDocModal');
    });

    this.domElement.querySelectorAll('#informationModal [data-bs-dismiss="modal"]').forEach(btn =>
      btn.addEventListener('click', () => {
        self.closeThenOpenModal('informationModal', 'editTempDocModal');
      })
    );

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

    // ── Download Template — same pattern as WpAdvancedSearchWebPart's
    //    downloadBtn handler: build an .xlsx workbook from TEMPLATE_COLUMNS
    //    using the bundled XLSX (SheetJS) library. ─────────────────────────
    const downloadBtn = this.domElement.querySelector(
      '#editTempDocModal .nemko-btn-download'
    ) as HTMLButtonElement;

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        const cols = this.TEMPLATE_COLUMNS['qualification'] || [];

        const worksheet = XLSX.utils.aoa_to_sheet([cols]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
        const wbout: ArrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        const blob = new Blob([wbout], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'qualification-template.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }

    // ── Info icon — same pattern as WpAdvancedSearchWebPart's
    //    templateInfoBtn handler: closes the import modal and opens the
    //    information modal (no dropdown/value check needed anymore). ──────
    const templateInfoBtn = this.domElement.querySelector('#import-template-info-btn') as HTMLButtonElement;
    if (templateInfoBtn) {
      templateInfoBtn.addEventListener('click', () => {
        self.closeThenOpenModal('editTempDocModal', 'informationModal');
      });
    }

    const uploadBtn = this.domElement.querySelector(
      '#editTempDocModal .nemko-btn-save'
    ) as HTMLButtonElement;

    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => self.handleImportUpload(fileInput));
    }

    this.domElement.querySelectorAll('#editTempDocModal [data-bs-dismiss="modal"]').forEach(btn =>
      btn.addEventListener('click', () => {
        self.resetImportModal();
        self.closeModal('editTempDocModal');
      })
    );
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
   * Upload handler — mirrors WpAdvancedSearchWebPart.uploadBtn's click handler:
   * 1) basic file-presence / extension checks
   * 2) client-side header validation via readFileHeaderRow() + validateTemplateColumns()
   * 3) POST to the API only if validation passes
   */
  private async handleImportUpload(fileInput?: HTMLInputElement): Promise<void> {
    this.setImportError('');

    const input = fileInput ?? (this.domElement.querySelector('#editTempDocModal input[type="file"]') as HTMLInputElement);
    const file = (input?.files && input.files.length > 0 ? input.files[0] : null) ?? this._pendingImportFile;
    if (!file) { this.setImportError('Please select a file before uploading.'); return; }

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const allowed = ['.csv', '.xlsx', '.xls'];
    if (allowed.indexOf(ext) === -1) {
      this.setImportError('Only .csv, .xlsx, and .xls files are supported. Received: ' + ext);
      return;
    }
    if (!this.apiClient) { this.setImportError('API client not ready. Please try again.'); return; }

    const uploadBtn = this.domElement.querySelector('#editTempDocModal .nemko-btn-save') as HTMLButtonElement;
    const originalLabel = uploadBtn ? uploadBtn.textContent : null;

    // Give feedback the instant the user clicks — for large .xlsx/.xls files,
    // readFileHeaderRow() below has to parse the ENTIRE workbook client-side
    // just to read row 1 (that's how the XLSX library works), which can take
    // several seconds on its own, before the upload request is even sent.
    // Without this, the button just sits there looking unresponsive during
    // that window. "Uploading..." stays up through both the validation pass
    // and the actual network request/response, right up to the finally below.
    if (uploadBtn) { uploadBtn.disabled = true; uploadBtn.textContent = 'Uploading...'; }

    try {
      // ── Client-side validation: header row column names + position must match the template ──
      // Same pattern/error messages as WpAdvancedSearchWebPart.validateTemplateColumns.
      try {
        const headerRow = await this.readFileHeaderRow(file);
        const columnError = this.validateTemplateColumns(headerRow, 'qualification');
        if (columnError) {
          this.setImportError(columnError);
          return;
        }
      } catch (err) {
        console.error('[NEMKO] Template header validation error:', err);
        const detail = (err && (err as Error).message) ? (err as Error).message : '';
        this.setImportError(
          detail
            ? `Could not read the file to validate its columns: ${detail}`
            : 'Could not read the file to validate its columns. Please check the file and try again.'
        );
        return;
      }

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
