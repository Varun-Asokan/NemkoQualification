
export default class VerificationAndAuthorization {
  public static allElementsHtml: string = `

<div class="main-wrapper min-h-screen-container has-nemko-sidebar">
  <div class="w-100 float-start">
    <div class="container container-nemko px-3 px-lg-4 clearfix py-3">

      <div class="w-100 float-start nemko-inner-page-wrapper py-5 ps-xl-4">

        <h2 class="inner-page-main-title font-bold mb-3" style="font-size:2.8rem;">
          Verify & Authorize Qualifications
        </h2>

        <!-- MAIN TABS -->
        <div class="w-100 float-start d-flex justify-content-between align-items-center mb-3">
          <div class="d-flex gap-2">
            <button
              data-tab-id="verif-verification-table"
              type="button"
              class="btn nemko-tab-btn nemko-tab-btn-active px-3 text-base md-text-lg">
              Verification
            </button>

            <button
              data-tab-id="verif-authorization-table"
              type="button"
              class="btn nemko-tab-btn px-3 text-base md-text-lg">
              Authorization
            </button>
          </div>
        </div>

        <!-- SUB TABS -->
        <div class="w-100 float-start d-flex align-items-center gap-3 mb-3">
          <button type="button" class="tab-link-btn tab-link-btn-active text-sm lg-text-base">
            Pending verification
          </button>

          <button type="button" class="tab-link-btn text-sm lg-text-base">
            Verified by me
          </button>
        </div>

        <!-- IMPORT BAR -->
        <div id="import-bar" style="display:none;" class="w-100 float-start d-flex align-items-center gap-3 mb-3">
          <button
            id="import-qual-btn"
            type="button"
            class="btn nemko-btn-default nemko-btn-secondary px-3 text-base lg-text-lg">
            Import Qualification
          </button>
        </div>

        <!-- VERIFICATION PANEL -->
        <div
          id="verif-verification-table"
          style="display:block;"
          class="nemko-data-table-wrapper nemko-data-table-qualification w-100 float-start">

          <!-- SEARCH -->
          <div class="nemko-table-top-filter-wrapper w-100 float-start px-4 pt-4 pb-2">
            <div class="nemko-filter-list d-flex flex-column gap-1">
              <label class="font-medium text-sm text-color-3">Search</label>

              <div class="d-flex position-relative">
                <button type="button" class="text-transform-btn font-medium text-xs text-color-3">Ab</button>

                <input
                  id="ver-search"
                  type="text"
                  placeholder="Search here..."
                  class="nemko-filter-input nemko-filter-search" />
              </div>
            </div>
          </div>

          <!-- ACTION BAR -->
          <div id="ver-action-bar" style="display:none;" class="w-100 float-start d-flex align-items-center gap-2 px-4 py-2 flex-wrap">
    <button type="button" class="nemko-btn-default nemko-btn-success verify-selected text-sm lg-text-base px-3">Verify Selected</button>
    <button type="button" class="nemko-btn-default nemko-btn-reject reject-selected text-sm lg-text-base px-3" data-panel="verification">Reject Selected</button>
</div>

          <!-- TABLE -->
          <div class="w-100 float-start d-flex flex-column position-relative px-4 pt-2">

            <div class="col-visibility-btn">
              <div class="w-100 dropdown position-static">

                <svg data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside"
                    class="cursor-pointer" width="28" height="14" viewBox="0 0 14 12" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M0 5.66218C0.591383 2.44103 3.41366 0 6.80594 0C10.1982 0 13.0205 2.44103 13.6125 5.66218C13.0211 8.88332 10.1982 11.3244 6.80594 11.3244C3.41366 11.3244 0.591383 8.88332 0 5.66218ZM6.80594 8.80783C7.64021 8.80783 8.44032 8.47641 9.03025 7.88649C9.62017 7.29656 9.95159 6.49645 9.95159 5.66218C9.95159 4.8279 9.62017 4.02779 9.03025 3.43786C8.44032 2.84794 7.64021 2.51652 6.80594 2.51652C5.97166 2.51652 5.17155 2.84794 4.58162 3.43786C3.9917 4.02779 3.66028 4.8279 3.66028 5.66218C3.66028 6.49645 3.9917 7.29656 4.58162 7.88649C5.17155 8.47641 5.97166 8.80783 6.80594 8.80783ZM6.80594 7.54957C6.30537 7.54957 5.8253 7.35072 5.47135 6.99676C5.11739 6.64281 4.91854 6.16274 4.91854 5.66218C4.91854 5.16161 5.11739 4.68154 5.47135 4.32759C5.8253 3.97363 6.30537 3.77478 6.80594 3.77478C7.3065 3.77478 7.78657 3.97363 8.14052 4.32759C8.49448 4.68154 8.69333 5.16161 8.69333 5.66218C8.69333 6.16274 8.49448 6.64281 8.14052 6.99676C7.78657 7.35072 7.3065 7.54957 6.80594 7.54957Z"
                      fill="#696A6E" />
                  </svg>

                <ul
                  id="authorized-col-visibility"
                  class="dropdown-menu col-visibility-dd-menu px-4 py-12">
                </ul>

              </div>
            </div>

            <div class="table-responsive nemko-table-container my-qualifcation-table">
              <table id="ver-table" class="table">
                <thead><tr></tr></thead>
                <tbody><tr></tr></tbody>
              </table>
            </div>

          </div>

          <ul class="pagination nemko-pagination justify-content-end align-items-center gap-2 w-100 float-start px-4">
              <li class="page-item disabled">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.72266 4.53745L8.16766 0.60786L8.16766 8.46704L2.72266 4.53745Z" fill="#989898" />
                  <rect width="1.815" height="8.1675" fill="#989898" />
                </svg>
              </li>
              <li class="page-item disabled">
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M-1.9834e-07 4.53745L5.445 0.60786L5.445 8.46704L-1.9834e-07 4.53745Z" fill="#989898" />
                  <path d="M6.35352 4.53745L11.7985 0.60786L11.7985 8.46704L6.35352 4.53745Z" fill="#989898" />
                </svg>
              </li>
              <li class="page-item">
                <span class="font-medium font-inter text-black text-xs">1 to 1 of 1</span>
              </li>
              <li class="page-item">
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.6125 4.53745L8.1675 0.60786L8.1675 8.46704L13.6125 4.53745Z" fill="#989898" />
                  <path d="M7.25898 4.53745L1.81398 0.60786L1.81398 8.46704L7.25898 4.53745Z" fill="#989898" />
                </svg>
              </li>
              <li class="page-item">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.25984 4.53751L1.81484 0.607921L1.81484 8.4671L7.25984 4.53751Z" fill="#989898" />
                  <rect width="1.815" height="8.1675" transform="matrix(-1 0 0 1 9.9825 0)" fill="#989898" />
                </svg>
              </li>
            </ul>
        </div>

        <!-- AUTHORIZATION PANEL -->
        <div
          id="verif-authorization-table"
          style="display:none;"
          class="nemko-data-table-wrapper nemko-data-table-qualification w-100 float-start">

          <!-- SEARCH -->
          <div class="nemko-table-top-filter-wrapper w-100 float-start px-4 pt-4 pb-2">
            <div class="nemko-filter-list d-flex flex-column gap-1">
              <label class="font-medium text-sm text-color-3">Search</label>

              <div class="d-flex position-relative">
                <button type="button" class="text-transform-btn font-medium text-xs text-color-3">Ab</button>

                <input
                  id="auth-search"
                  type="text"
                  placeholder="Search here..."
                  class="nemko-filter-input nemko-filter-search" />
              </div>
            </div>
          </div>

          <!-- ACTION BAR -->
          <div id="auth-action-bar" style="display:none;" class="w-100 float-start d-flex align-items-center gap-2 px-4 py-2 flex-wrap">
    <button type="button" class="nemko-btn-default nemko-btn-success authorize-selected text-sm lg-text-base px-3">Authorize Selected</button>
    <button type="button" class="nemko-btn-default nemko-btn-reject reject-selected text-sm lg-text-base px-3" data-panel="authorization">Reject Selected</button>
</div>

          <!-- TABLE -->
          <div class="w-100 float-start d-flex flex-column position-relative px-4 pt-2">

            <div class="col-visibility-btn">
              <div class="w-100 dropdown position-static">

                <svg data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside"
                    class="cursor-pointer" width="28" height="14" viewBox="0 0 14 12" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M0 5.66218C0.591383 2.44103 3.41366 0 6.80594 0C10.1982 0 13.0205 2.44103 13.6125 5.66218C13.0211 8.88332 10.1982 11.3244 6.80594 11.3244C3.41366 11.3244 0.591383 8.88332 0 5.66218ZM6.80594 8.80783C7.64021 8.80783 8.44032 8.47641 9.03025 7.88649C9.62017 7.29656 9.95159 6.49645 9.95159 5.66218C9.95159 4.8279 9.62017 4.02779 9.03025 3.43786C8.44032 2.84794 7.64021 2.51652 6.80594 2.51652C5.97166 2.51652 5.17155 2.84794 4.58162 3.43786C3.9917 4.02779 3.66028 4.8279 3.66028 5.66218C3.66028 6.49645 3.9917 7.29656 4.58162 7.88649C5.17155 8.47641 5.97166 8.80783 6.80594 8.80783ZM6.80594 7.54957C6.30537 7.54957 5.8253 7.35072 5.47135 6.99676C5.11739 6.64281 4.91854 6.16274 4.91854 5.66218C4.91854 5.16161 5.11739 4.68154 5.47135 4.32759C5.8253 3.97363 6.30537 3.77478 6.80594 3.77478C7.3065 3.77478 7.78657 3.97363 8.14052 4.32759C8.49448 4.68154 8.69333 5.16161 8.69333 5.66218C8.69333 6.16274 8.49448 6.64281 8.14052 6.99676C7.78657 7.35072 7.3065 7.54957 6.80594 7.54957Z"
                      fill="#696A6E" />
                  </svg>

                <ul
                  id="requested-col-visibility"
                  class="dropdown-menu col-visibility-dd-menu px-4 py-12">
                </ul>

              </div>
            </div>

            <div class="table-responsive nemko-table-container my-qualifcation-table-requested">
              <table id="auth-table" class="table">
                <thead><tr></tr></thead>
                <tbody><tr></tr></tbody>
              </table>
            </div>

          </div>

          <ul class="pagination nemko-pagination justify-content-end align-items-center gap-2 w-100 float-start px-4">
              <li class="page-item disabled">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.72266 4.53745L8.16766 0.60786L8.16766 8.46704L2.72266 4.53745Z" fill="#989898" />
                  <rect width="1.815" height="8.1675" fill="#989898" />
                </svg>
              </li>
              <li class="page-item disabled">
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M-1.9834e-07 4.53745L5.445 0.60786L5.445 8.46704L-1.9834e-07 4.53745Z" fill="#989898" />
                  <path d="M6.35352 4.53745L11.7985 0.60786L11.7985 8.46704L6.35352 4.53745Z" fill="#989898" />
                </svg>
              </li>
              <li class="page-item">
                <span class="font-medium font-inter text-black text-xs">1 to 1 of 1</span>
              </li>
              <li class="page-item">
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.6125 4.53745L8.1675 0.60786L8.1675 8.46704L13.6125 4.53745Z" fill="#989898" />
                  <path d="M7.25898 4.53745L1.81398 0.60786L1.81398 8.46704L7.25898 4.53745Z" fill="#989898" />
                </svg>
              </li>
              <li class="page-item">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.25984 4.53751L1.81484 0.607921L1.81484 8.4671L7.25984 4.53751Z" fill="#989898" />
                  <rect width="1.815" height="8.1675" transform="matrix(-1 0 0 1 9.9825 0)" fill="#989898" />
                </svg>
              </li>
            </ul>
        </div>

        <!-- AUDIT -->
        <div id="audit-trail" class="w-100 float-start mt-4 text-muted small"></div>

      </div>
    </div>
  </div>
</div>

<!-- IMPORT MODAL -->
 <div class="modal nemko-modal nemko-modal-default edit-temp-doc-modal" id="editTempDocModal" tabindex="-1" aria-labelledby="editTempDocModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fhd-text-xl-combo">Edit template document</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="info-modal-close-btn"></button>
        </div>
        <div class="modal-body custom-scroll-view">
          <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="tempNameIp" class="form-label">name*</label>
              <input type="text" class="form-control" id="tempNameIp" />
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="template" class="form-label">template</label>
              <select class="form-select" id="import-template-select">
              <option value="" selected disabled></option>
              <option value="1">Template 1</option>
              <option value="2">Template 2</option>
            </select>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <div class="form-label">file</div>
              <div class="d-flex flex-wrap align-items-center gap-2">
                <div class="d-flex align-items-center flex-grow-1 overflow-hidden gap-2">
                  <input type="text" class="form-control flex-grow-1" disabled>
                  <label class="nemko-btn-default nemko-btn-browse d-flex flex-shrink-0 align-items-center justify-content-center text-center px-2">
                    <input type="file" class="d-none" />
                    <span>Browse</span>
                  </label>
                </div>
                <button type="button" class="nemko-btn-default nemko-btn-download flex-shrink-0 px-2">Download</button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
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
              <table class="table table-borderless align-middle table-fixed text-center">
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
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>import helper</td>
                    <td>e-mail</td>
                    <td>requester office</td>
                    <td>qualification type</td>
                    <td>verified email</td>
                    <td>authorized by email</td>
                    <td>is approved</td>
                    <td>is rejected</td>
                    <td>qualification</td>
                    <td>qualification level</td>
                    <td>name level</td>
                    <td>date</td>
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

<!-- QUALIFICATION DETAILS MODAL -->
<div class="modal nemko-modal qualification-details-modal" id="qualificationDetailsModal" tabindex="-1" aria-labelledby="qualificationDetailsModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">

      <div class="modal-header">
        <h5 class="modal-title fhd-text-xl-combo">Qualification Details</h5>
        <button type="button" class="btn-close" id="qd-close-btn" aria-label="Close"></button>
      </div>

      <div class="modal-body custom-scroll-view">
        <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">

          <!-- Qualification ID — readonly -->
          <div class="w-100 float-start d-flex frm-readonly-row py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">Qualification ID</label>
              <p class="frm-readonly-val" id="qd-qual-id"></p>
            </div>
          </div>

        <!-- Requested By — readonly -->
          <div class="w-100 float-start d-flex frm-readonly-row py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">Requested by</label>
              <p class="frm-readonly-val" id="qd-requested-by"></p>
            </div>
          </div>

          <!-- Qualification — readonly -->
          <div class="w-100 float-start d-flex frm-readonly-row py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">Qualification</label>
              <p class="frm-readonly-val" id="qd-qualification"></p>
            </div>
          </div>

          <!-- Qualification Level / Conformity Statement / Report Approver — readonly -->
          <div class="w-100 float-start d-flex flex-wrap gap-3 frm-readonly-row justify-content-between py-1">
            <div class="d-flex flex-column form-control-col min-w-0">
              <label class="form-label font-semibold">Qualification level</label>
              <p class="frm-readonly-val" id="qd-qual-level"></p>
            </div>
            <div class="d-flex flex-column form-control-col min-w-0">
              <label class="form-label font-semibold">Conformity statement</label>
              <p class="frm-readonly-val" id="qd-conformity"></p>
            </div>
            <div class="d-flex flex-column form-control-col min-w-0">
              <label class="form-label font-semibold">Report approver</label>
              <p class="frm-readonly-val" id="qd-report-approver"></p>
            </div>
          </div>

          <!-- Updated Qualification Level — readonly -->
          <div class="w-100 float-start d-flex frm-readonly-row py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">Updated Qualification Level</label>
              <p class="frm-readonly-val" id="qd-updated-level"></p>
            </div>
          </div>

          <!-- Remarks — readonly -->
          <div class="w-100 float-start d-flex frm-readonly-row py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">Remarks</label>
              <p class="frm-readonly-val" id="qd-remarks"></p>
            </div>
          </div>

          <!-- Limitations (Requester) — readonly -->
          <div class="w-100 float-start d-flex frm-readonly-row py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">Limitations (Requester)</label>
              <p class="frm-readonly-val" id="qd-limitations-requester"></p>
            </div>
          </div>

          <!-- Limitations (Verifier) — editable textarea (same as limitationsTxtarea pattern) -->
          <div class="w-100 float-start d-flex flex-column form-control-col">
            <label for="qd-limitations-textarea" class="form-label font-semibold">Limitations (Verifier)</label>
            <textarea class="form-control h-px-98 custom-scroll-view" id="qd-limitations-textarea"></textarea>
          </div>

          <!-- Target Achieve Date — editable -->
          <div class="col-12 col-sm-6 col-md-6">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="targetAchieveDate" class="form-label font-semibold">target achieve date</label>
              <div class="d-flex align-items-center position-relative" id="targetAchieveDateWrapper">
                <input type="text" class="form-control" id="targetAchieveDate" placeholder="YYYY-MM-DD" readonly style="cursor:pointer;" />
                <div id="nemko-cal-popup" style="display:none;position:absolute;top:100%;left:0;z-index:9999;background:#fff;border:1px solid #ccc;border-radius:6px;padding:10px;min-width:280px;box-shadow:0 4px 12px rgba(0,0,0,0.15);"></div>
              </div>
            </div>
          </div>

          <!-- Authorizer — editable input + arrow pick button -->
          <div class="w-100 float-start d-flex flex-column form-control-col">
            <label class="form-label font-semibold">Authorizer</label>
            <div class="d-flex align-items-center gap-2">
              <input type="text" class="form-control flex-grow-1" id="qd-authorizer" placeholder="Select authorizer..." readonly />
              <button type="button" class="frm-right-arrow-btn" id="qd-authorizer-pick-btn"></button>
            </div>
          </div>

        </div>
      </div>

      <!-- Footer — same button classes as existing modal -->
      <div class="modal-footer">
        <button type="button" id="qd-verify-btn" class="nemko-btn-default nemko-btn-save text-base md-text-lg">Verify</button>
        <button type="button" id="qd-reject-btn" class="nemko-btn-default nemko-btn-reject text-base md-text-lg">Reject</button>
      </div>

    </div>
  </div>
</div>

<!-- SELECT AUTHORIZER MODAL — exact same classes as selectEmpModal -->
<div class="modal nemko-modal nemko-modal-default select-emp-modal" id="selectAuthorizerModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">

      <div class="modal-header">
        <h5 class="modal-title fhd-text-xl-combo">Select Authorizer</h5>
        <button type="button" class="btn-close" id="select-authorizer-close-btn" aria-label="Close"></button>
      </div>

      <div class="modal-frm-search-top w-100 float-start">
        <div class="w-100 float-start d-flex flex-column form-control-col">
          <div class="d-flex align-items-center gap-2">
            <input type="text" class="form-control flex-grow-1 modal-search-input" id="authorizer-search-input" placeholder="Search" />
            <button type="button" class="frm-right-close-btn" id="authorizer-search-clear-btn"></button>
          </div>
        </div>
      </div>

      <div class="modal-body custom-scroll-view pt-0">
        <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm">
          <div class="w-100 float-start d-flex flex-column form-control-col checkbox-list-main" id="authorizer-list">
            <!-- Rendered dynamically by renderAuthorizerList() -->
          </div>
        </div>
      </div>

      <div class="modal-footer gap-2 justify-content-sm-start justify-content-center">
        <button type="button" class="btn nemko-btn-default nemko-btn-save text-base md-text-lg m-0" id="authorizer-save-btn">Save</button>
        <button type="button" class="btn nemko-btn-default nemko-btn-cancel text-base md-text-lg m-0" id="authorizer-cancel-btn">Cancel</button>
      </div>

    </div>
  </div>
</div>

<!-- AUTHORIZATION DETAILS MODAL -->
<div class="modal nemko-modal qualification-details-modal" id="authorizationDetailsModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title fhd-text-xl-combo">Qualification Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body custom-scroll-view">
        <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">
          <div class="row gy-3">
            <div class="col-12 col-sm-6 col-md-7">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label for="reqEmail" class="form-label font-semibold">Req email</label>
                <input type="email" class="form-control" id="reqEmail" />
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-5">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <div class="form-label-cr font-semibold">approval is rejected</div>
                <div class="d-flex align-items-center gap-3 mt-1">
                  <label class="nemko-frm-radio d-flex align-items-center gap-1">
                    <input class="form-check-input" type="radio" name="radioDefault3">
                    <span class="radio-icon"></span>
                    <p class="form-check-label">Yes</p>
                  </label>
                  <label class="nemko-frm-radio d-flex align-items-center gap-1">
                    <input class="form-check-input" type="radio" name="radioDefault3" checked>
                    <span class="radio-icon active"></span>
                    <p class="form-check-label">No</p>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="row gy-3">
            <div class="col-12 col-sm-6 col-md-7">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label for="verEmail" class="form-label font-semibold">Ver email</label>
                <input type="email" class="form-control" id="verEmail" />
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-5">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <div class="form-label-cr font-semibold">authorization is rejected</div>
                <div class="d-flex align-items-center gap-3 mt-1">
                  <label class="nemko-frm-radio d-flex align-items-center gap-1">
                    <input class="form-check-input" type="radio" name="radioDefault4">
                    <span class="radio-icon"></span>
                    <p class="form-check-label">Yes</p>
                  </label>
                  <label class="nemko-frm-radio d-flex align-items-center gap-1">
                    <input class="form-check-input" type="radio" name="radioDefault4" checked>
                    <span class="radio-icon active"></span>
                    <p class="form-check-label">No</p>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="row gy-3">
            <div class="col-12 col-sm-6 col-md-7">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label for="authEmail" class="form-label font-semibold">Auth email</label>
                <input type="email" class="form-control" id="authEmail" />
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-5">
            <div class="w-100 float-start d-flex flex-column form-control-col">

              <label for="approvalDate" class="form-label font-semibold">
                approval date
              </label>

              <div
                class="d-flex align-items-center gap-2 date-picker-input-row position-relative"
                id="approvalDateWrapper">

                <input
                  type="text"
                  readonly
                  class="form-control flex-grow-1 date-picker-input"
                  id="approvalDate" />

                <button
                  type="button"
                  class="date-picker-icon"
                  id="approvalDateIcon">

                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"  fill="currentColor" class="bi bi-calendar2-fill"
                      viewBox="0 0 16 16">
                    <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4z"/>
                  </svg>
                </button>

                <div id="approval-cal-popup" class="position-absolute bg-white border rounded p-3 shadow" hidden></div>
              </div>

            </div>
          </div>
          </div>
          <div class="w-100 float-start d-flex frm-readonly-row py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">qualification ID</label>
              <p class="frm-readonly-val" id="auth-qual-id">—</p>
            </div>
          </div>
          <div class="w-100 float-start d-flex frm-readonly-row py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">requested by</label>
              <p class="frm-readonly-val" id="auth-requested-by">—</p>
            </div>
          </div>
          <div class="w-100 float-start d-flex frm-readonly-row py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">qualification</label>
              <p class="frm-readonly-val" id="auth-qualification">—</p>
            </div>
          </div>
          <div class="w-100 float-start d-flex flex-wrap gap-3 frm-readonly-row justify-content-between py-1">
            <div class="d-flex flex-column form-control-col min-w-0">
              <label class="form-label font-semibold">qualification level</label>
              <p class="frm-readonly-val" id="auth-qual-level">—</p>
            </div>
            <div class="d-flex flex-column form-control-col min-w-0">
              <label class="form-label font-semibold">conformity statement</label>
              <p class="frm-readonly-val" id="auth-conformity">—</p>
            </div>
            <div class="d-flex flex-column form-control-col min-w-0">
              <label class="form-label font-semibold">report approver</label>
              <p class="frm-readonly-val" id="auth-report-approver">—</p>
            </div>
          </div>
          <div class="w-100 float-start d-flex frm-readonly-row py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">remarks</label>
              <p class="frm-readonly-val" id="auth-remarks">—</p>
            </div>
          </div>
          <div class="w-100 float-start d-flex frm-readonly-row py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">limitations (verifier)</label>
              <p class="frm-readonly-val" id="auth-limitations-verifier">—</p>
            </div>
          </div>
          <div class="w-100 float-start d-flex flex-column form-control-col">
            <label for="limitationsTxtarea" class="form-label font-semibold">limitations</label>
            <textarea class="form-control h-px-98 custom-scroll-view" id="limitationsTxtarea"></textarea>
          </div>
          <div class="w-100 float-start d-flex frm-readonly-row py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">Approval date</label>
              <p class="frm-readonly-val" id="auth-approval-date-readonly">—</p>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="nemko-btn-default nemko-btn-save text-base md-text-lg" id="auth-modal-authorize-btn">Authorize</button>
        <button type="button" class="nemko-btn-default nemko-btn-reject text-base md-text-lg" id="auth-modal-reject-btn">Reject</button>
      </div>
    </div>
  </div>
</div>
<!-- WITHDRAWN DETAILS MODAL -->
<div class="modal nemko-modal qualification-details-modal" id="withdrawDetailsModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title fhd-text-xl-combo">Qualification Details</h5>
        <button type="button"  class="btn-close withdraw-back-btn" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body custom-scroll-view">
        <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">
          <div class="row gy-3">
            <div class="col-12 col-sm-6 col-md-7">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label for="reqEmail" class="form-label font-semibold">Req email</label>
                <input type="email" class="form-control" id="reqEmail" />
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-5">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <div class="form-label-cr font-semibold">approval is rejected</div>
                <div class="d-flex align-items-center gap-3 mt-1">
                  <label class="nemko-frm-radio d-flex align-items-center gap-1">
                    <input class="form-check-input" type="radio" name="radioDefault3">
                    <span class="radio-icon"></span>
                    <p class="form-check-label">Yes</p>
                  </label>
                  <label class="nemko-frm-radio d-flex align-items-center gap-1">
                    <input class="form-check-input" type="radio" name="radioDefault3" checked>
                    <span class="radio-icon active"></span>
                    <p class="form-check-label">No</p>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="row gy-3">
            <div class="col-12 col-sm-6 col-md-7">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label for="verEmail" class="form-label font-semibold">Ver email</label>
                <input type="email" class="form-control" id="verEmail" />
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-5">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <div class="form-label-cr font-semibold">authorization is rejected</div>
                <div class="d-flex align-items-center gap-3 mt-1">
                  <label class="nemko-frm-radio d-flex align-items-center gap-1">
                    <input class="form-check-input" type="radio" name="radioDefault4">
                    <span class="radio-icon"></span>
                    <p class="form-check-label">Yes</p>
                  </label>
                  <label class="nemko-frm-radio d-flex align-items-center gap-1">
                    <input class="form-check-input" type="radio" name="radioDefault4" checked>
                    <span class="radio-icon active"></span>
                    <p class="form-check-label">No</p>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="row gy-3">
            <div class="col-12 col-sm-6 col-md-7">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label for="authEmail" class="form-label font-semibold">Auth email</label>
                <input type="email" class="form-control" id="authEmail" />
              </div>
            </div>
          
          </div>
          <div class="w-100 float-start d-flex frm-readonly-row py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">qualification ID</label>
              <p class="frm-readonly-val" id="auth-qual-id">—</p>
            </div>
          </div>
          <div class="w-100 float-start d-flex frm-readonly-row py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">requested by</label>
              <p class="frm-readonly-val" id="wd-requested-by">—</p>
            </div>
          </div>
          <div class="w-100 float-start d-flex frm-readonly-row py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">qualification</label>
              <p class="frm-readonly-val" id="wd-qualification">—</p>
            </div>
          </div>
          <div class="w-100 float-start d-flex flex-wrap gap-3 frm-readonly-row justify-content-between py-1">
            <div class="d-flex flex-column form-control-col min-w-0">
              <label class="form-label font-semibold">qualification level</label>
              <p class="frm-readonly-val" id="wd-level">—</p>
            </div>
            <div class="d-flex flex-column form-control-col min-w-0">
              <label class="form-label font-semibold">conformity statement</label>
              <p class="frm-readonly-val" id="wd-conformity">—</p>
            </div>
            <div class="d-flex flex-column form-control-col min-w-0">
              <label class="form-label font-semibold">report approver</label>
              <p class="frm-readonly-val" id="wd-report-approver">—</p>
            </div>
          </div>
          <div class="w-100 float-start d-flex frm-readonly-row py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">Updated Qualification Level</label>
              <p class="frm-readonly-val" id="wd-updated-level">—</p>
            </div>
          </div>
          <div class="w-100 float-start d-flex frm-readonly-row py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">remarks</label>
              <p class="frm-readonly-val" id="wd-remarks">—</p>
            </div>
          </div>
          <div class="w-100 float-start d-flex frm-readonly-row py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">updated remarks</label>
              <p class="frm-readonly-val" id="wd-updated-remarks">—</p>
            </div>
          </div>
          <div class="w-100 float-start d-flex frm-readonly-row py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">limitations (verifier)</label>
              <p class="frm-readonly-val" id="wd-limitations-verifier">—</p>
            </div>
          </div>
          <div class="w-100 float-start d-flex frm-readonly-row py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">limitations</label>
              <p class="frm-readonly-val" id="wd-limitations">—</p>
            </div>
          </div>
          <div class="w-100 float-start d-flex frm-readonly-row py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">Qualified date</label>
              <p class="frm-readonly-val" id="wd-qualified-date-readonly">—</p>
            </div>
          </div>
          <div class="w-100 float-start d-flex frm-readonly-row py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">Withdrawn date</label>
              <p class="frm-readonly-val" id="wd-withdrawn-date-readonly">—</p>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="nemko-btn-default nemko-btn-save text-base md-text-lg withdraw-back-btn" >Back</button>
      </div>
    </div>
  </div>
</div>

`;
}
