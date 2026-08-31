export default class AdminPage {

    public static allElementsHtml: string = `


<div class="sidebar-overlay" id="sidebarOverlay"></div>

 <div class="main-wrapper min-h-screen-container has-nemko-sidebar">
    <div class="w-100 float-start">
      <div class="container container-nemko px-3 px-lg-4 clearfix py-3">
        <div class="w-100 float-start nemko-inner-page-wrapper py-4 ps-xl-4 admin-home">
          <h2 class="inner-page-main-title fhd-text-size-48-combo mb-3">admin home</h2>
          <div class="w-100 float-start d-flex flex-wrap admin-page-grid-link gap-3">
            <a href="__KEY_EMPLOYEES_URL__" class="d-flex flex-column align-items-center gap-2 admin-page-grid-link-item">
              <img src="__KEY_URL_RESOURCE__/resources/images/icons/employees.png" alt="" />
              <p class="font-medium text-color-12 text-base lg-text-lg xxl-text-size-20">Employees</p>
            </a>
            <a href="__KEY_MASTERDATA_URL__" class="d-flex flex-column align-items-center gap-2 admin-page-grid-link-item">
              <img src="__KEY_URL_RESOURCE__/resources/images/icons/master-data-entry.png" alt="" />
              <p class="font-medium text-color-12 text-base lg-text-lg xxl-text-size-20">master data entry</p>
            </a>
            <a href="__KEY_GLOBALAUTH_URL__" class="d-flex flex-column align-items-center gap-2 admin-page-grid-link-item">
              <img src="__KEY_URL_RESOURCE__/resources/images/icons/global-ver-auth.png" alt="" />
              <p class="font-medium text-color-12 text-base lg-text-lg xxl-text-size-20">Global Verifier and Authorizer</p>
            </a>
            <button type="button" id="import-qual-tile" class="btn d-flex flex-column align-items-center gap-2 admin-page-grid-link-item" style="background:none;border:none;padding:0;">
              <!-- TODO: replace with the correct icon once provided -->
              <img src="__KEY_URL_RESOURCE__/resources/images/icons/import-qualification.png" alt="" />
              <p class="font-medium text-color-12 text-base lg-text-lg xxl-text-size-20">Import Qualification</p>
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
          <h5 class="modal-title fhd-text-xl-combo">Create template document</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="info-modal-close-btn"></button>
        </div>
        <div class="modal-body custom-scroll-view">
          <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <div class="form-label">file <span style="color:red;">*</span></div>
              <div class="d-flex align-items-center flex-grow-1 overflow-hidden gap-2">
                <input type="text" class="form-control flex-grow-1" disabled>
                <label class="nemko-btn-default nemko-btn-browse d-flex flex-shrink-0 align-items-center justify-content-center text-center px-2">
                  <input type="file" class="d-none" accept=".csv,.xls,.xlsx" />
                  <span>Browse</span>
                </label>
              </div>
            </div>
            <div class="w-100 float-start d-flex align-items-center gap-2">
              <button type="button" class="nemko-btn-default nemko-btn-download flex-shrink-0 px-2">Download Template</button>
              <button type="button" class="btn btn-link p-0 d-flex align-items-center flex-shrink-0" id="import-template-info-btn" title="View template information" aria-label="View template information">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="#5E99AB" class="bi bi-info-circle-fill" viewBox="0 0 16 16">
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <p id="import-file-error" style="color:red;display:none;width:100%;margin-bottom:8px;"></p>  <!-- ADD -->
          <button type="button" class="nemko-btn-default nemko-btn-save text-base md-text-lg">Upload</button>
          <button type="button" class="nemko-btn-default nemko-btn-cancel text-base md-text-lg" data-bs-dismiss="modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade nemko-modal nemko-modal-default information-modal" id="informationModal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false" aria-labelledby="informationModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fhd-text-xl-combo">Information</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body custom-scroll-view">
          <div class="w-100 float-start d-flex flex-column gap-4">
            <p class="text-color-17 font-medium text-base lg-text-lg xxl-text-size-20 text-capitalize">before uploading the file, make sure its format meets the requirements. the column headers must exactly match the sample below. any deviations may result in import errors.</p>
            <div class="table-responsive w-100 float-start information-table custom-scroll-view custom-scroll-h-view">
              <table class="table table-borderless align-middle table-fixed text-center" style="min-width:2100px;">
                <thead>
                  <tr>
                    <th class="text-base md-text-lg">A</th>
                    <th class="text-base md-text-lg">B</th>
                    <th class="text-base md-text-lg">C</th>
                    <th class="text-base md-text-lg">D</th>
                    <th class="text-base md-text-lg">E</th>
                    <th class="text-base md-text-lg">F</th>
                    <th class="text-base md-text-lg">G</th>
                    <th class="text-base md-text-lg">H</th>
                    <th class="text-base md-text-lg">I</th>
                    <th class="text-base md-text-lg">J</th>
                    <th class="text-base md-text-lg">K</th>
                    <th class="text-base md-text-lg">L</th>
                    <th class="text-base md-text-lg">M</th>
                    <th class="text-base md-text-lg">N</th>
                    <th class="text-base md-text-lg">O</th>
                    <th class="text-base md-text-lg">P</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>ExternalQualificationID</td>
                    <td>Employee Email Address</td>
                    <td>Qualification</td>
                    <td>Level</td>
                    <td>Type</td>
                    <td>Qualified Date</td>
                    <td>Verifier Email Address</td>
                    <td>Authorizer Email Address</td>
                    <td>Limitations</td>
                    <td>Remarks</td>
                    <td>Status</td>
                    <td>IsRejected</td>
                    <td>Withdrawn Date</td>
                    <td>Report Approver</td>
                    <td>Conformity Statement</td>
                    <td>Certification Decision</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="modal-footer justify-content-end border-top-0">
          <button type="button" class="nemko-btn-default nemko-btn-save text-base md-text-lg" data-bs-dismiss="modal">Ok</button>
        </div>
      </div>
    </div>
  </div>

    `
}