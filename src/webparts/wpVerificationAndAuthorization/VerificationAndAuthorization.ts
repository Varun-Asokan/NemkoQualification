
export default class VerificationAndAuthorization {
  public static allElementsHtml: string = `

<div class="main-wrapper min-h-screen-container has-nemko-sidebar">
  <div class="w-100 float-start">
    <div class="container container-nemko px-3 px-lg-4 clearfix py-3">

      <div class="w-100 float-start nemko-inner-page-wrapper py-5 ps-xl-4">

        <h2 class="inner-page-main-title nm-page-title">
          Verify & Authorize Qualifications
        </h2>

        <!-- MAIN TABS -->
        <div class="w-100 float-start d-flex justify-content-between align-items-center mb-3">
          <div class="d-flex gap-2">
            <button
              data-tab-id="verif-verification-table"
              type="button"
              class="btn nemko-tab-btn nemko-tab-btn-active px-3 text-sm">
              Verification
            </button>

            <button
              data-tab-id="verif-authorization-table"
              type="button"
              class="btn nemko-tab-btn px-3 text-sm">
              Authorization
            </button>
          </div>
        </div>

        <!-- SUB TABS -->
        <div class="w-100 float-start d-flex align-items-center gap-3 mb-3">
          <button type="button" class="tab-link-btn tab-link-btn-active text-sm">
            Pending Verification
          </button>

          <button type="button" class="tab-link-btn text-sm">
            Verified by Me
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
                <div class="dropdown search-operator-dd">
                  <button type="button" class="text-transform-btn font-medium text-xs text-color-3"
                          data-bs-toggle="dropdown" aria-expanded="false" data-operator="contains"><u>Ab</u></button>
                  <ul class="dropdown-menu search-operator-menu py-1">
                    <li><a class="search-op-item d-flex align-items-center gap-2 active" data-operator="contains" data-symbol="Ab" data-symbol-type="text-full" data-table="verif-verification-table" href="javascript:void(0)">
                      <span class="op-symbol font-medium text-xs"><u>Ab</u></span><span>Contains</span>
                    </a></li>
                    <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="startswith" data-symbol="Ab" data-symbol-type="text-start" data-table="verif-verification-table" href="javascript:void(0)">
                      <span class="op-symbol font-medium text-xs"><u>A</u>b</span><span>Starts with</span>
                    </a></li>
                    <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="endswith" data-symbol="Ab" data-symbol-type="text-end" data-table="verif-verification-table" href="javascript:void(0)">
                      <span class="op-symbol font-medium text-xs">A<u>b</u></span><span>Ends with</span>
                    </a></li>
                    <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="eq" data-symbol="=" data-symbol-type="math" data-table="verif-verification-table" href="javascript:void(0)">
                      <span class="op-symbol op-symbol-math font-medium text-xs">=</span><span>Equal</span>
                    </a></li>
                    <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="neq" data-symbol="≠" data-symbol-type="math" data-table="verif-verification-table" href="javascript:void(0)">
                      <span class="op-symbol op-symbol-math font-medium text-xs">≠</span><span>Not equal</span>
                    </a></li>
                  </ul>
                </div>

                <input
                  id="ver-search"
                  type="text"
                  placeholder="Search here..."
                  class="nemko-filter-input nemko-filter-search" />
              </div>
            </div>

            <div class="nemko-filter-list d-flex flex-column gap-1">
              <label class="font-medium text-sm text-color-3">Type</label>
              <select id="ver-type-filter" class="nemko-filter-input" data-table-id="verif-verification-table" data-filter-key="qualificationType">
                <option value="">All</option>
                <option value="standard">Standard</option>
                <option value="scheme">Scheme</option>
                <option value="test-method">Test Method</option>
              </select>
            </div>
            <div class="nemko-filter-list d-flex flex-column gap-1">
              <label class="font-medium text-sm text-color-3">Status</label>
              <select id="ver-status-filter" class="nemko-filter-input" data-table-id="verif-verification-table" data-filter-key="active">
                <option value="">All</option>
                <option value="Yes">Active</option>
                <option value="No">Inactive</option>
              </select>
            </div>
            <div class="nemko-filter-list d-flex flex-column gap-1">
              <label class="font-medium text-sm text-color-3">Report Approver</label>
              <select id="ver-report-filter" class="nemko-filter-input" data-table-id="verif-verification-table" data-filter-key="report">
                <option value="">All</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div class="nemko-filter-list d-flex flex-column gap-1">
              <label class="font-medium text-sm text-color-3">Conformity Statement</label>
              <select id="ver-conformity-filter" class="nemko-filter-input" data-table-id="verif-verification-table" data-filter-key="conformity">
                <option value="">All</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div class="nemko-filter-list d-flex flex-column gap-1">
              <label class="font-medium text-sm text-color-3">Certification Decision</label>
              <select id="ver-certification-filter" class="nemko-filter-input" data-table-id="verif-verification-table" data-filter-key="certificationDecision">
                <option value="">All</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div class="nemko-filter-list d-flex flex-column gap-1">
              <label class="font-medium text-sm text-color-3">Level</label>
              <select id="ver-level-filter" class="nemko-filter-input" data-table-id="verif-verification-table" data-filter-key="level">
                <option value="">All</option>
              </select>
            </div>
          </div>

          <!-- ACTION BAR -->
          <div id="ver-action-bar" style="display:none;" class="w-100 float-start d-flex align-items-center gap-2 px-4 py-2 flex-wrap">
            <button type="button" class="nemko-btn-default nemko-btn-success verify-selected text-sm px-3">Verify Selected</button>
            <button type="button" class="nemko-btn-default nemko-btn-reject reject-selected text-sm px-3" data-panel="verification">Reject Selected</button>
          </div>

          <!-- TABLE -->
          <ul class="pagination nemko-pagination justify-content-start align-items-center gap-2 w-100 float-start px-4"></ul>
          <div class="w-100 float-start d-flex flex-column position-relative px-4 pt-2">

            <div class="col-visibility-btn">
              <div class="w-100 dropdown">

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

          <ul class="pagination nemko-pagination justify-content-start align-items-center gap-2 w-100 float-start px-4">
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
                <div class="dropdown search-operator-dd">
                  <button type="button" class="text-transform-btn font-medium text-xs text-color-3"
                          data-bs-toggle="dropdown" aria-expanded="false" data-operator="contains"><u>Ab</u></button>
                  <ul class="dropdown-menu search-operator-menu py-1">
                    <li><a class="search-op-item d-flex align-items-center gap-2 active" data-operator="contains" data-symbol="Ab" data-symbol-type="text-full" data-table="verif-authorization-table" href="javascript:void(0)">
                      <span class="op-symbol font-medium text-xs"><u>Ab</u></span><span>Contains</span>
                    </a></li>
                    <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="startswith" data-symbol="Ab" data-symbol-type="text-start" data-table="verif-authorization-table" href="javascript:void(0)">
                      <span class="op-symbol font-medium text-xs"><u>A</u>b</span><span>Starts with</span>
                    </a></li>
                    <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="endswith" data-symbol="Ab" data-symbol-type="text-end" data-table="verif-authorization-table" href="javascript:void(0)">
                      <span class="op-symbol font-medium text-xs">A<u>b</u></span><span>Ends with</span>
                    </a></li>
                    <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="eq" data-symbol="=" data-symbol-type="math" data-table="verif-authorization-table" href="javascript:void(0)">
                      <span class="op-symbol op-symbol-math font-medium text-xs">=</span><span>Equal</span>
                    </a></li>
                    <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="neq" data-symbol="≠" data-symbol-type="math" data-table="verif-authorization-table" href="javascript:void(0)">
                      <span class="op-symbol op-symbol-math font-medium text-xs">≠</span><span>Not equal</span>
                    </a></li>
                  </ul>
                </div>

                <input
                  id="auth-search"
                  type="text"
                  placeholder="Search here..."
                  class="nemko-filter-input nemko-filter-search" />
              </div>
            </div>

            <div class="nemko-filter-list d-flex flex-column gap-1">
              <label class="font-medium text-sm text-color-3">Type</label>
              <select id="auth-type-filter" class="nemko-filter-input" data-table-id="verif-authorization-table" data-filter-key="qualificationType">
                <option value="">All</option>
                <option value="standard">Standard</option>
                <option value="scheme">Scheme</option>
                <option value="test-method">Test Method</option>
              </select>
            </div>
            <div class="nemko-filter-list d-flex flex-column gap-1">
              <label class="font-medium text-sm text-color-3">Status</label>
              <select id="auth-status-filter" class="nemko-filter-input" data-table-id="verif-authorization-table" data-filter-key="active">
                <option value="">All</option>
                <option value="Yes">Active</option>
                <option value="No">Inactive</option>
              </select>
            </div>
            <div class="nemko-filter-list d-flex flex-column gap-1">
              <label class="font-medium text-sm text-color-3">Report Approver</label>
              <select id="auth-report-filter" class="nemko-filter-input" data-table-id="verif-authorization-table" data-filter-key="report">
                <option value="">All</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div class="nemko-filter-list d-flex flex-column gap-1">
              <label class="font-medium text-sm text-color-3">Conformity Statement</label>
              <select id="auth-conformity-filter" class="nemko-filter-input" data-table-id="verif-authorization-table" data-filter-key="conformity">
                <option value="">All</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div class="nemko-filter-list d-flex flex-column gap-1">
              <label class="font-medium text-sm text-color-3">Certification Decision</label>
              <select id="auth-certification-filter" class="nemko-filter-input" data-table-id="verif-authorization-table" data-filter-key="certificationDecision">
                <option value="">All</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div class="nemko-filter-list d-flex flex-column gap-1">
              <label class="font-medium text-sm text-color-3">Level</label>
              <select id="auth-level-filter" class="nemko-filter-input" data-table-id="verif-authorization-table" data-filter-key="level">
                <option value="">All</option>
              </select>
            </div>
          </div>

          <!-- ACTION BAR -->
          <div id="auth-action-bar" style="display:none;" class="w-100 float-start d-flex align-items-center gap-2 px-4 py-2 flex-wrap">
    <button type="button" class="nemko-btn-default nemko-btn-success authorize-selected text-sm px-3">Authorize Selected</button>
    <button type="button" class="nemko-btn-default nemko-btn-reject reject-selected text-sm px-3" data-panel="authorization">Reject Selected</button>
</div>

          <!-- TABLE -->
          <ul class="pagination nemko-pagination justify-content-start align-items-center gap-2 w-100 float-start px-4"></ul>
          <div class="w-100 float-start d-flex flex-column position-relative px-4 pt-2">

            <div class="col-visibility-btn">
              <div class="w-100 dropdown">

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

          <ul class="pagination nemko-pagination justify-content-start align-items-center gap-2 w-100 float-start px-4">
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

<!-- QUALIFICATION DETAILS MODAL -->
<div class="modal nemko-modal qualification-details-modal" id="qualificationDetailsModal" tabindex="-1" aria-labelledby="qualificationDetailsModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">

      <div class="modal-header">
        <h5 class="modal-title text-lg font-semibold">Qualification Details</h5>
        <button type="button" class="btn-close" id="qd-close-btn" aria-label="Close"></button>
      </div>

      <div class="modal-body custom-scroll-view">
        <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">

          <div class="row gy-3">
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Qualification ID</label>
                <input type="text" class="form-control" id="qd-qual-id" readonly />
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Requested by</label>
                <input type="text" class="form-control" id="qd-requested-by" readonly />
              </div>
            </div>
          </div>
          <div class="row gy-3">
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Local Unit</label>
                <input type="text" class="form-control" id="qd-local-unit" readonly />
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Email Address</label>
                <input type="email" class="form-control" id="qd-email-address" readonly />
              </div>
            </div>
          </div>


          <div class="row gy-3">
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Qualification</label>
                <input type="text" class="form-control" id="qd-qualification" readonly />
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Qualification Type</label>
                <input type="text" class="form-control" id="qd-qualification-type" readonly />
              </div>
            </div>
           
          </div>


          <div class="row gy-3">
            <div class="col-12 col-sm-4 col-md-4">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Qualification Level</label>
                <input type="text" class="form-control" id="qd-qual-level" readonly />
              </div>
            </div>
          </div>

          <!-- Status / Report approver / Conformity statement / Certification Decision — one grouped row, 4-up on md+, 2-up on small screens -->
          <div class="row gy-3">
            <div class="col-sm-4 col-md-4">
              <div class="w-100 float-start d-flex frm-readonly-row flex-column form-control-col">
                <label class="form-label font-semibold">Status</label>
                <input type="text" class="form-control" id="qd-status" readonly />
              </div>
            </div>
            <div class="col-sm-4 col-md-4">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Report Approver</label>
                <input type="text" class="form-control" id="qd-report-approver" readonly />
              </div>
            </div>
            <div class="col-sm-4 col-md-4">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Conformity Statement</label>
                <input type="text" class="form-control" id="qd-conformity" readonly />
              </div>
            </div>
            <div class="col-sm-4 col-md-4">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Certification Decision</label>
                <input type="text" class="form-control" id="qd-certification" readonly />
              </div>
            </div>
          </div>

          <!-- Remarks — readonly -->
          <div class="w-100 float-start d-flex  py-1" id="qd-remarks-row">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">Remarks</label>
              <textarea class="form-control h-px-98 custom-scroll-view" id="qd-remarks"></textarea>
              <p class="frm-readonly-val form-control h-px-98 overflow-auto custom-scroll-view" id="qd-remarks-para" style="display:none;"></p>
            </div>
          </div>

          <!-- Limitations by Applicant — readonly -->
          <div class="w-100 float-start d-flex  py-1" id="qd-limitations-requester-row">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">Limitations by Applicant (reference only)</label>
              <p class="frm-readonly-val form-control h-px-98 overflow-auto custom-scroll-view" id="qd-limitations-requester"></p>
              <textarea class="form-control h-px-98 custom-scroll-view" id="qd-limitations-requester-textarea" readonly style="display:none;"></textarea>
            </div>
          </div>

          <!-- Limitations-->
          <div class="w-100 float-start d-flex flex-column form-control-col" id="qd-limitations-textarea-row">
            <label for="qd-limitations-textarea" class="form-label font-semibold">Final Limitations</label>
            <textarea class="form-control h-px-98 custom-scroll-view" id="qd-limitations-textarea"></textarea>
            <p class="frm-readonly-val form-control h-px-98 overflow-auto custom-scroll-view" id="qd-limitations-textarea-para" style="display:none;"></p>
          </div>

           <!-- Withdrawn By — always shown in "Verified by me" -->
          <div class="row gy-3">
            <div class="col-12 col-sm-6 col-md-6" id="qd-withdrawn-by-row">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Withdrawn by</label>
                <input type="text" class="form-control" id="qd-withdrawn-by" readonly />
              </div>
            </div>
          </div>

          <!-- Withdrawn Reason — always shown in "Verified by me" -->
          <div class="w-100 float-start d-flex py-1" id="qd-withdrawn-reason-row">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">Withdrawn Reason</label>
              <p class="frm-readonly-val form-control h-px-98 overflow-auto custom-scroll-view" id="qd-withdrawn-reason-para">—</p>
              <textarea class="form-control h-px-98 custom-scroll-view" id="qd-withdrawn-reason-textarea" readonly style="display:none;"></textarea>
            </div>
          </div>

           <div class="row gy-3">
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label for="targetAchieveDate" class="form-label font-semibold">Target Achieve Date</label>
                <input type="text" class="form-control has-calendar-icon" id="targetAchieveDate" readonly />
              </div>
            </div>
          </div>

          <!-- Qualified date — always shown in "Verified by me" -->
          <div class="row gy-3">
            <div class="col-12 col-sm-6 col-md-6" id="qd-qualified-date-row">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Qualified Date</label>
                <input type="text" class="form-control" id="qd-qualified-date-readonly" readonly />
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-6" id="qd-withdrawn-date-row">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Withdrawn Date</label>
                <input type="text" class="form-control" id="qd-withdrawn-date-readonly" readonly />
              </div>
            </div>
          </div>

          <div class="row gy-3">
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Verifier</label>
                <input type="text" class="form-control" id="qd-verifier" readonly />
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Authorizer</label>
                <div class="d-flex align-items-center gap-2">
                  <input type="text" class="form-control flex-grow-1" id="qd-authorizer" placeholder="Select authorizer..." readonly />
                  <button type="button" class="frm-right-arrow-btn" id="qd-authorizer-pick-btn"></button>
                </div>
              </div>
            </div>
          </div>



        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button type="button" id="qd-verify-btn" class="nemko-btn-default nemko-btn-success text-sm">Verify</button>
        <button type="button" id="qd-reject-btn" class="nemko-btn-default nemko-btn-reject text-sm">Reject</button>
        <button type="button" id="qd-withdraw-btn" class="btn nemko-btn-default nemko-btn-withdraw text-sm" style="display:none;">Withdraw</button>
      </div>

    </div>
  </div>
</div>

<!-- VERIFIED DETAILS MODAL (READONLY) — "Verified by me" tab -->
<div class="modal nemko-modal qualification-details-modal" id="verifiedDetailsModal" tabindex="-1" aria-labelledby="verifiedDetailsModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">

      <div class="modal-header">
        <h5 class="modal-title text-lg font-semibold">Qualification Details</h5>
        <button type="button" class="btn-close" id="vd-close-btn" aria-label="Close"></button>
      </div>

      <div class="modal-body custom-scroll-view">
        <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">

          <div class="w-100 float-start d-flex frm-readonly-row py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">Qualification ID</label>
              <p class="frm-readonly-val" id="vd-qual-id"></p>
            </div>
          </div>

          <div class="w-100 float-start d-flex frm-readonly-row py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">Requested by</label>
              <p class="frm-readonly-val" id="vd-requested-by"></p>
            </div>
          </div>

          <div class="w-100 float-start d-flex flex-wrap gap-3 frm-readonly-row justify-content-between py-1">
            <div class="d-flex flex-column form-control-col min-w-0">
              <label class="form-label font-semibold">Qualification</label>
              <p class="frm-readonly-val" id="vd-qualification"></p>
            </div>
            <div class="d-flex flex-column form-control-col min-w-0">
              <label class="form-label font-semibold">Qualification Level</label>
              <p class="frm-readonly-val" id="vd-qual-level"></p>
            </div>
          </div>

          <div class="w-100 float-start d-flex flex-wrap gap-3 frm-readonly-row justify-content-between py-1">
            <div class="d-flex flex-column form-control-col min-w-0">
              <label class="form-label font-semibold">Report Approver</label>
              <p class="frm-readonly-val" id="vd-report-approver"></p>
            </div>
            <div class="d-flex flex-column form-control-col min-w-0">
              <label class="form-label font-semibold">Conformity Statement</label>
              <p class="frm-readonly-val" id="vd-conformity"></p>
            </div>
          </div>

          <div class="w-100 float-start d-flex py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">Remarks</label>
              <p class="frm-readonly-val form-control h-px-98 overflow-auto custom-scroll-view" id="vd-remarks"></p>
            </div>
          </div>

          <div class="w-100 float-start d-flex py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">Limitations by Applicant (reference only)</label>
              <p class="frm-readonly-val form-control h-px-98 overflow-auto custom-scroll-view" id="vd-limitations-requester"></p>
            </div>
          </div>

          <div class="w-100 float-start d-flex frm-readonly-row py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">Target Achieve Date</label>
              <p class="frm-readonly-val" id="vd-target-date"></p>
            </div>
          </div>

          <div class="w-100 float-start d-flex flex-wrap gap-3 frm-readonly-row justify-content-between py-1">
            <div class="d-flex flex-column form-control-col min-w-0">
              <label class="form-label font-semibold">Verified by</label>
              <p class="frm-readonly-val" id="vd-verified-by"></p>
            </div>
            <div class="d-flex flex-column form-control-col min-w-0">
              <label class="form-label font-semibold">Authorizer</label>
              <p class="frm-readonly-val" id="vd-authorizer"></p>
            </div>
          </div>

        </div>
      </div>

      <div class="modal-footer">
        <button type="button" id="vd-back-btn" class="nemko-btn-default nemko-btn-secondary text-sm" data-dismiss-modal="verifiedDetailsModal">Back</button>
      </div>

    </div>
  </div>
</div>

<!-- SELECT AUTHORIZER MODAL — exact same classes as selectEmpModal -->
<div class="modal nemko-modal nemko-modal-default select-emp-modal" id="selectAuthorizerModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">

      <div class="modal-header">
        <h5 class="modal-title text-lg font-semibold">Select Authorizer</h5>
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
        <button type="button" class="btn nemko-btn-default nemko-btn-save text-sm m-0" id="authorizer-save-btn">Save</button>
        <button type="button" class="btn nemko-btn-default nemko-btn-cancel text-sm m-0" id="authorizer-cancel-btn">Cancel</button>
      </div>

    </div>
  </div>
</div>

<!-- AUTHORIZATION DETAILS MODAL -->
<div class="modal nemko-modal qualification-details-modal" id="authorizationDetailsModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title text-lg font-semibold">Qualification Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body custom-scroll-view">
        <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">
          
          
          <div class="row gy-3">
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Qualification ID</label>
                <input type="text" class="form-control" id="auth-qual-id" readonly />
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Requested by</label>
                <input type="text" class="form-control" id="auth-requested-by" readonly />
              </div>
            </div>
          </div>
          <div class="row gy-3">
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Local Unit</label>
                <input type="text" class="form-control" id="auth-local-unit" readonly />
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Email Address</label>
                <input type="email" class="form-control" id="auth-email-address" readonly />
              </div>
            </div>
          </div>

           <div class="row gy-3">
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Qualification</label>
                <input type="text" class="form-control" id="auth-qualification" readonly />
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Qualification Type</label>
                <input type="text" class="form-control" id="auth-qualification-type" readonly />
              </div>
            </div>
          </div>

          <div class="row gy-3">
            <div class="col-12 col-sm-4 col-md-4">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Qualification Level</label>
                <input type="text" class="form-control" id="auth-qual-level" readonly />
              </div>
            </div>
          </div>

           <div class="row gy-3">
            <div class="col-sm-4 col-md-4">
              <div class="w-100 float-start d-flex frm-readonly-row flex-column form-control-col">
                <label class="form-label font-semibold">Status</label>
                <input type="text" class="form-control" id="auth-status" readonly />
              </div>
            </div>
            <div class="col-sm-4 col-md-4">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Report Approver</label>
                <input type="text" class="form-control" id="auth-report-approver" readonly />
              </div>
            </div>
            <div class="col-sm-4 col-md-4">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Conformity Statement</label>
                <input type="text" class="form-control" id="auth-conformity" readonly />
              </div>
            </div>
            <div class="col-sm-4 col-md-4">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Certification Decision</label>
                <input type="text" class="form-control" id="auth-certification" readonly />
              </div>
            </div>
          </div>

          <div class="w-100 float-start d-flex py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">Remarks</label>
              <textarea class="form-control h-px-98 custom-scroll-view" id="auth-remarks"></textarea>
            </div>
          </div>
          <div class="w-100 float-start d-flex py-1" id="auth-limitations-requester-row">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">Limitations by Applicant (reference only)</label>
              <p class="frm-readonly-val form-control h-px-98 overflow-auto custom-scroll-view" id="auth-limitations-requester">—</p>
              <textarea class="form-control h-px-98 custom-scroll-view" id="auth-limitations-requester-textarea" readonly style="display:none;"></textarea>
            </div>
          </div>
          <div class="w-100 float-start d-flex flex-column form-control-col">
            <label for="limitationsTxtarea" class="form-label font-semibold">Final Limitation</label>
            <textarea class="form-control h-px-98 custom-scroll-view" id="limitationsTxtarea"></textarea>
          </div>

          <div class="row gy-3">
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Target Achieve Date</label>
                <input type="text" class="form-control" id="auth-target-date" readonly />
              </div>
            </div>
          </div>

          <div class="row gy-3">
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label for="auth-ver-email" class="form-label font-semibold">Verifier</label>
                <input type="text" class="form-control" id="auth-ver-email" readonly/>
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label for="auth-auth-email" class="form-label font-semibold">Authorizer</label>
                <input type="text" class="form-control" id="auth-auth-email" readonly/>
              </div>
            </div>
          </div>

          <div class="w-100 float-start d-flex frm-readonly-row py-1">
            <!--     <div class="w-100 float-start d-flex flex-column form-control-col"> -->
              <!--     <label class="form-label font-semibold">Approval Date</label> -->
              <!--     <p class="frm-readonly-val" id="auth-approval-date-readonly">—</p> -->
            <!--     </div>-->
        </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="nemko-btn-default nemko-btn-success text-sm" id="auth-modal-authorize-btn">Authorize</button>
        <button type="button" class="nemko-btn-default nemko-btn-reject text-sm" id="auth-modal-reject-btn">Reject</button>
      </div>
    </div>
  </div>
</div>
<!-- REJECT REASON MODAL -->
<div class="modal nemko-modal qualification-details-modal" id="rejectReasonModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title text-lg font-semibold">Add Rejection Reason</h5>
        <button type="button" class="btn-close" id="reject-reason-close-btn" aria-label="Close"></button>
      </div>
      <div class="modal-body custom-scroll-view">
        <div class="w-100 float-start d-flex flex-column form-control-col">
          <textarea class="form-control h-px-98 custom-scroll-view" id="reject-reason-textarea" placeholder="Please provide a reason for rejecting this request!"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="nemko-btn-default nemko-btn-reject text-sm" id="reject-reason-confirm-btn">Reject</button>
      </div>
    </div>
  </div>
</div>
<!-- WITHDRAW REASON MODAL -->
<div class="modal nemko-modal qualification-details-modal" id="withdrawReasonModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title text-lg font-semibold">Add Withdrawal Reason</h5>
        <button type="button" class="btn-close" id="withdraw-reason-close-btn" aria-label="Close"></button>
      </div>
      <div class="modal-body custom-scroll-view">
        <div class="w-100 float-start d-flex flex-column form-control-col">
          <textarea class="form-control h-px-98 custom-scroll-view" id="withdraw-reason-textarea" placeholder="Please provide a reason for withdrawing this qualification!"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn nemko-btn-default nemko-btn-withdraw text-sm" id="withdraw-reason-confirm-btn">Withdraw</button>
      </div>
    </div>
  </div>
</div>
<!-- WITHDRAWN DETAILS MODAL -->

<div class="modal nemko-modal qualification-details-modal" id="withdrawDetailsModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title text-lg font-semibold">Qualification Details</h5>
        <button type="button"  class="btn-close withdraw-back-btn" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body custom-scroll-view">
        <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">
          <div class="row gy-3">
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Qualification ID</label>
                <input type="text" class="form-control" id="wd-qual-id" readonly />
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Requested by</label>
                <input type="text" class="form-control" id="wd-requested-by" readonly />
              </div>
            </div>
          </div>
          <div class="row gy-3">
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Local Unit</label>
                <input type="text" class="form-control" id="wd-local-unit" readonly />
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Email Address</label>
                <input type="email" class="form-control" id="wd-email-address" readonly />
              </div>
            </div>
          </div>

           <div class="row gy-3">
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Qualification</label>
                <input type="text" class="form-control" id="wd-qualification" readonly />
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Qualification Type</label>
                <input type="text" class="form-control" id="wd-qualification-type" readonly />
              </div>
            </div>
          </div>

          <div class="row gy-3">
            <div class="col-12 col-sm-4 col-md-4">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Qualification Level</label>
                <input type="text" class="form-control" id="wd-level" readonly />
              </div>
            </div>
          </div>

         <div class="row gy-3">
            <div class="col-sm-4 col-md-4">
              <div class="w-100 float-start d-flex frm-readonly-row flex-column form-control-col">
                <label class="form-label font-semibold">Status</label>
                <input type="text" class="form-control" id="wd-status" readonly />
              </div>
            </div>
            <div class="col-sm-4 col-md-4">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Report Approver</label>
                <input type="text" class="form-control" id="wd-report-approver" readonly />
              </div>
            </div>
            <div class="col-sm-4 col-md-4">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Conformity Statement</label>
                <input type="text" class="form-control" id="wd-conformity" readonly />
              </div>
            </div>
            <div class="col-sm-4 col-md-4">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Certification Decision</label>
                <input type="text" class="form-control" id="wd-certification" readonly />
              </div>
            </div>
          </div>
           <div class="w-100 float-start d-flex py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">Remarks</label>
              <p class="frm-readonly-val form-control h-px-98 overflow-auto custom-scroll-view" id="wd-remarks">—</p>
            </div>
          </div>
          <div class="w-100 float-start d-flex py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">Limitations by Applicant (reference only)</label>
              <p class="frm-readonly-val form-control h-px-98 overflow-auto custom-scroll-view" id="wd-limitations">—</p>
            </div>
          </div>
          <div class="w-100 float-start d-flex py-1">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">Final Limitations</label>
              <p class="frm-readonly-val form-control h-px-98 overflow-auto custom-scroll-view" id="wd-limitations-final">—</p>
            </div>
          </div>

         <div class="row gy-3">
            <div class="col-12 col-sm-6 col-md-6" id="wd-withdrawn-by-row">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Withdrawn by</label>
                <input type="text" class="form-control" id="wd-withdrawn-by" readonly />
              </div>
            </div>
          </div>
         <div class="w-100 float-start d-flex py-1" id="wd-withdrawn-reason-row">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">Withdrawn Reason</label>
              <p class="frm-readonly-val form-control h-px-98 overflow-auto custom-scroll-view" id="wd-withdrawn-reason-para">—</p>
            </div>
          </div>

          <div class="row gy-3">
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Target Achieve Date</label>
                <input type="text" class="form-control" id="wd-target-date" readonly />
              </div>
            </div>
          </div>

          <div class="row gy-3">
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Qualified Date</label>
                <input type="text" class="form-control" id="wd-qualified-date-readonly" readonly />
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">Withdrawn Date</label>
                <input type="text" class="form-control" id="wd-withdrawn-date-readonly" readonly />
              </div>
            </div>
          </div>

          <div class="row gy-3">
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label for="wd-ver-email" class="form-label font-semibold">Verifier </label>
                <input type="email" class="form-control" id="wd-ver-email" />
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-6">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label for="wd-auth-email" class="form-label font-semibold">Authorizer </label>
                <input type="email" class="form-control" id="wd-auth-email" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" id="wd-withdraw-btn" class="btn nemko-btn-default nemko-btn-withdraw text-sm" style="display:none;">Withdraw</button>
      </div>
    </div>
  </div>
</div>

`;
}
