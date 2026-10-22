export default class AdminPage {

    public static allElementsHtml: string = `


<div class="sidebar-overlay" id="sidebarOverlay"></div>

 <div class="main-wrapper min-h-screen-container has-nemko-sidebar">
    <div class="w-100 float-start">
      <div class="container container-nemko px-3 px-lg-4 clearfix py-3">
        <div class="w-100 float-start nemko-inner-page-wrapper py-4 ps-xl-4 admin-home">
          <h2 class="inner-page-main-title nm-page-title">Admin Home</h2>
          <div class="w-100 float-start d-flex flex-wrap admin-page-grid-link gap-3">
            <a href="__KEY_EMPLOYEES_URL__" class="d-flex flex-column align-items-center gap-2 admin-page-grid-link-item">
              <img src="__KEY_URL_RESOURCE__/resources/images/icons/employees.png" alt="" />
              <p class="font-medium text-color-12 text-base">Employees</p>
            </a>
            <a href="__KEY_MASTERDATA_URL__" class="d-flex flex-column align-items-center gap-2 admin-page-grid-link-item">
              <img src="__KEY_URL_RESOURCE__/resources/images/icons/master-data-entry.png" alt="" />
              <p class="font-medium text-color-12 text-base">Master Data Entry</p>
            </a>
            <a href="__KEY_GLOBALAUTH_URL__" class="d-flex flex-column align-items-center gap-2 admin-page-grid-link-item">
              <img src="__KEY_URL_RESOURCE__/resources/images/icons/global-ver-auth.png" alt="" />
              <p class="font-medium text-color-12 text-base">Global Verifier and Authorizer</p>
            </a>
            <a href="__KEY_OVERRIDE_RULES_URL__" class="d-flex flex-column align-items-center gap-2 admin-page-grid-link-item">
              <img src="__KEY_URL_RESOURCE__/resources/images/icons/manage-override-rules.png" alt="" />
              <p class="font-medium text-color-12 text-base">Manage Override Rules</p>
            </a>
            <button type="button" id="import-qual-tile" class="btn d-flex flex-column align-items-center gap-2 admin-page-grid-link-item" style="background:none;border:none;">
              
              <img src="__KEY_URL_RESOURCE__/resources/images/icons/import-qualification.png" alt="" />
              <p class="font-medium text-color-12 text-base">Import Qualification</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

<!-- IMPORT MODAL -->
 <div class="modal nemko-modal nemko-modal-default edit-temp-doc-modal" id="editTempDocModal" tabindex="-1" aria-labelledby="editTempDocModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title text-lg font-semibold">Edit Template Document</h5>
          <button type="button" class="btn-close import-modal-close-btn" aria-label="Close"></button>
        </div>
        <div class="modal-body custom-scroll-view">
          <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <div class="form-label">File<span class="text-danger">*</span></div>
              <div class="d-flex align-items-center flex-grow-1 overflow-hidden gap-2">
                <input type="text" class="form-control flex-grow-1" disabled>
                <label class="nemko-btn-default nemko-btn-browse d-flex flex-shrink-0 align-items-center justify-content-center text-center px-2">
                  <input type="file" class="d-none" />
                  <span>Browse</span>
                </label>
              </div>
            </div>
            <div class="w-100 float-start d-flex align-items-center gap-2">
              <button type="button" class="nemko-btn-default nemko-btn-download flex-shrink-0 px-2">Download Template</button>
              <button type="button" class="btn btn-link p-0 d-flex align-items-center flex-shrink-0" id="import-template-info-btn" title="View template information" aria-label="View template information">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" style="fill:var(--nemko-blue);" class="bi bi-info-circle-fill" viewBox="0 0 16 16">
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <p id="import-file-error" style="color:red;display:none;width:100%;margin-bottom:8px;"></p>
          <button type="button" class="nemko-btn-default nemko-btn-save text-sm">Upload</button>
          <button type="button" class="nemko-btn-default nemko-btn-cancel text-sm import-modal-close-btn">Cancel</button>
        </div>
      </div>
    </div>
  </div>

<!-- INFORMATION MODAL - QUALIFICATION -->
  <div class="modal fade nemko-modal nemko-modal-default information-modal" id="informationModalQualification" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title text-lg font-semibold">Information</h5>
          <button type="button" class="btn-close info-modal-dismiss-btn" aria-label="Close" data-modal-id="informationModalQualification"></button>
        </div>
        <div class="modal-body custom-scroll-view">
          <div class="w-100 float-start d-flex flex-column gap-4">
            <p class="text-color-17 font-medium text-sm">Before uploading the file, make sure its format meets the requirements. The column headers must exactly match the sample below. Any deviations may result in import errors.</p>
            <div class="table-responsive w-100 float-start information-table custom-scroll-view custom-scroll-h-view">
              <table class="table table-borderless align-middle table-fixed text-center" style="min-width:2100px;">
                <!-- Header (A, B, C, ...) and data row are populated dynamically at runtime
                     from GET /api/ImportMetadata/columns/qualification — see
                     WpAdminPageWebPart.populateInformationModalColumns(). Do not hardcode columns here. -->
                <thead id="info-modal-table-head-qualification">
                </thead>
                <tbody id="info-modal-table-body-qualification">
                  <tr>
                    <td class="text-center">Loading columns…</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="modal-footer justify-content-end border-top-0">
          <button type="button" class="info-modal-ok-btn nemko-btn-default nemko-btn-save text-sm" data-modal-id="informationModalQualification">Ok</button>
        </div>
      </div>
    </div>
  </div>

    `
}