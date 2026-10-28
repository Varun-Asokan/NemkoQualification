export default class MyQualifications {

    public static allElementsHtml: string = `
    

<div class="sidebar-overlay" id="sidebarOverlay"></div>

  

  <div class="main-wrapper min-h-screen-container has-nemko-sidebar">
    <div class="w-100 float-start">
      <div class="container container-nemko px-3 px-lg-4 clearfix py-3">
                <div class="w-100 float-start nemko-inner-page-wrapper py-5 ps-xl-4">

          <h2 class="inner-page-main-title nm-page-title">My Qualifications</h2>

          <div id="qualificationsToolbar" class="w-100 float-start d-flex justify-content-between align-items-center mb-3 gap-3 flex-wrap">
            <div class="d-flex gap-2">
              <button data-tab-id="authorized-table" type="button" class="btn nemko-tab-btn nemko-tab-btn-active px-3 text-sm">Authorized</button>
              <button data-tab-id="requested-table" type="button" class="btn nemko-tab-btn px-3 text-sm">Requested</button>
            </div>
            <button data-bs-toggle="modal" data-bs-target="#addQualificationModal" type="button" class="btn nemko-btn-default px-3 nemko-btn-primary text-sm">Add Qualification</button>
          </div>

          <!-- ── AUTHORIZED TABLE ── -->
          <div id="authorized-table" style="display:block;"
            class="nemko-data-table-wrapper nemko-data-table-qualification w-100 float-start">
            <div class="nemko-table-top-filter-wrapper w-100 float-start px-4 pt-4 pb-2">
              <div class="nemko-filter-list d-flex flex-column gap-1">
                <label class="font-medium text-sm text-color-3">Search</label>
                <div class="d-flex position-relative">
                  <div class="dropdown search-operator-dd">
                    <button type="button" class="text-transform-btn font-medium text-xs text-color-3"
                            data-bs-toggle="dropdown" aria-expanded="false" data-operator="contains"><u>Ab</u></button>
                    <ul class="dropdown-menu search-operator-menu py-1">
                      <li><a class="search-op-item d-flex align-items-center gap-2 active" data-operator="contains" data-symbol="Ab" data-symbol-type="text-full" data-table-id="authorized-table" href="javascript:void(0)">
                        <span class="op-symbol font-medium text-xs"><u>Ab</u></span><span>Contains</span>
                      </a></li>
                      <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="startswith" data-symbol="Ab" data-symbol-type="text-start" data-table-id="authorized-table" href="javascript:void(0)">
                        <span class="op-symbol font-medium text-xs"><u>A</u>b</span><span>Starts with</span>
                      </a></li>
                      <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="endswith" data-symbol="Ab" data-symbol-type="text-end" data-table-id="authorized-table" href="javascript:void(0)">
                        <span class="op-symbol font-medium text-xs">A<u>b</u></span><span>Ends with</span>
                      </a></li>
                      <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="eq" data-symbol="=" data-symbol-type="math" data-table-id="authorized-table" href="javascript:void(0)">
                        <span class="op-symbol op-symbol-math font-medium text-xs">=</span><span>Equal</span>
                      </a></li>
                      <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="neq" data-symbol="≠" data-symbol-type="math" data-table-id="authorized-table" href="javascript:void(0)">
                        <span class="op-symbol op-symbol-math font-medium text-xs">≠</span><span>Not equal</span>
                      </a></li>
                     
                    </ul>
                  </div>
                  <input type="text" placeholder="Search here..." class="nemko-filter-input nemko-filter-search" />
                </div>
              </div>
              <div class="nemko-filter-list d-flex flex-column gap-1">
                <label class="font-medium text-sm text-color-3">Type</label>
                <select class="nemko-filter-input" data-table-id="authorized-table" data-filter-key="qualificationType">
                  <option value="">All</option>
                  <option value="standard">Standard</option>
                  <option value="scheme">Scheme</option>
                  <option value="test-method">Test Method</option>
                </select>
              </div>
              <div class="nemko-filter-list d-flex flex-column gap-1">
                <label class="font-medium text-sm text-color-3">Status</label>
                <select class="nemko-filter-input" data-table-id="authorized-table" data-filter-key="active">
                  <option value="">All</option>
                  <option value="Yes">Active</option>
                  <option value="No">Inactive</option>
                </select>
              </div>
              <div class="nemko-filter-list d-flex flex-column gap-1">
                <label class="font-medium text-sm text-color-3">Report Approver</label>
                <select class="nemko-filter-input" data-table-id="authorized-table" data-filter-key="report">
                  <option value="">All</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div class="nemko-filter-list d-flex flex-column gap-1">
                <label class="font-medium text-sm text-color-3">Conformity Statement</label>
                <select class="nemko-filter-input" data-table-id="authorized-table" data-filter-key="conformity">
                  <option value="">All</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div class="nemko-filter-list d-flex flex-column gap-1">
                <label class="font-medium text-sm text-color-3">Certification Decision</label>
                <select class="nemko-filter-input" data-table-id="authorized-table" data-filter-key="certificationDecision">
                  <option value="">All</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div class="nemko-filter-list d-flex flex-column gap-1">
                <label class="font-medium text-sm text-color-3">Level</label>
                <select class="nemko-filter-input" id="authorizedLevelFilter" data-table-id="authorized-table" data-filter-key="level">
                  <option value="">All</option>
                </select>
              </div>
            </div>
            <ul class="pagination nemko-pagination justify-content-start align-items-center gap-2 w-100 float-start px-4"></ul>
            <div class="w-100 float-start d-flex flex-column position-relative px-4 pt-2">
              <div class="col-visibility-btn">
                <div class="w-100 dropdown">
                  <svg data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside"
                    class="cursor-pointer" width="28" height="14" viewBox="0 0 14 12" fill="none">
                    <path d="M0 5.66218C0.591383 2.44103 3.41366 0 6.80594 0C10.1982 0 13.0205 2.44103 13.6125 5.66218C13.0211 8.88332 10.1982 11.3244 6.80594 11.3244C3.41366 11.3244 0.591383 8.88332 0 5.66218ZM6.80594 8.80783C7.64021 8.80783 8.44032 8.47641 9.03025 7.88649C9.62017 7.29656 9.95159 6.49645 9.95159 5.66218C9.95159 4.8279 9.62017 4.02779 9.03025 3.43786C8.44032 2.84794 7.64021 2.51652 6.80594 2.51652C5.97166 2.51652 5.17155 2.84794 4.58162 3.43786C3.9917 4.02779 3.66028 4.8279 3.66028 5.66218C3.66028 6.49645 3.9917 7.29656 4.58162 7.88649C5.17155 8.47641 5.97166 8.80783 6.80594 8.80783ZM6.80594 7.54957C6.30537 7.54957 5.8253 7.35072 5.47135 6.99676C5.11739 6.64281 4.91854 6.16274 4.91854 5.66218C4.91854 5.16161 5.11739 4.68154 5.47135 4.32759C5.8253 3.97363 6.30537 3.77478 6.80594 3.77478C7.3065 3.77478 7.78657 3.97363 8.14052 4.32759C8.49448 4.68154 8.69333 5.16161 8.69333 5.66218C8.69333 6.16274 8.49448 6.64281 8.14052 6.99676C7.78657 7.35072 7.3065 7.54957 6.80594 7.54957Z" fill="#696A6E" />
                  </svg>
                  <ul id="authorized-col-visibility" class="dropdown-menu col-visibility-dd-menu px-4 py-12"></ul>
                </div>
              </div>
              <div class="table-responsive nemko-table-container my-qualifcation-table">
                <table class="table">
                  <thead><tr></tr></thead>
                  <tbody>
                    <tr class="nemko-skeleton-row"><td colspan="20"><div class="nemko-skeleton-cell"></div></td></tr>
                    <tr class="nemko-skeleton-row"><td colspan="20"><div class="nemko-skeleton-cell"></div></td></tr>
                    <tr class="nemko-skeleton-row"><td colspan="20"><div class="nemko-skeleton-cell"></div></td></tr>
                    <tr class="nemko-skeleton-row"><td colspan="20"><div class="nemko-skeleton-cell"></div></td></tr>
                    <tr class="nemko-skeleton-row"><td colspan="20"><div class="nemko-skeleton-cell"></div></td></tr>
                    <tr class="nemko-skeleton-row"><td colspan="20"><div class="nemko-skeleton-cell"></div></td></tr>
                    <tr class="nemko-skeleton-row"><td colspan="20"><div class="nemko-skeleton-cell"></div></td></tr>
                    <tr class="nemko-skeleton-row"><td colspan="20"><div class="nemko-skeleton-cell"></div></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <ul class="pagination nemko-pagination justify-content-start align-items-center gap-2 w-100 float-start px-4"></ul>
          </div>

        
          <div id="requested-table" style="display:none;"
            class="nemko-data-table-wrapper nemko-data-table-qualification w-100 float-start">
            <div class="nemko-table-top-filter-wrapper w-100 float-start px-4 pt-4 pb-2">
              <div class="nemko-filter-list d-flex flex-column gap-1">
                <label class="font-medium text-sm text-color-3">Search</label>
                <div class="d-flex position-relative">
                  <div class="dropdown search-operator-dd">
                    <button type="button" class="text-transform-btn font-medium text-xs text-color-3"
                            data-bs-toggle="dropdown" aria-expanded="false" data-operator="contains"><u>Ab</u></button>
                    <ul class="dropdown-menu search-operator-menu py-1">
                      <li><a class="search-op-item d-flex align-items-center gap-2 active" data-operator="contains" data-symbol="Ab" data-symbol-type="text-full" data-table-id="requested-table" href="javascript:void(0)">
                        <span class="op-symbol font-medium text-xs"><u>Ab</u></span><span>Contains</span>
                      </a></li>
                      <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="startswith" data-symbol="Ab" data-symbol-type="text-start" data-table-id="requested-table" href="javascript:void(0)">
                        <span class="op-symbol font-medium text-xs"><u>A</u>b</span><span>Starts with</span>
                      </a></li>
                      <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="endswith" data-symbol="Ab" data-symbol-type="text-end" data-table-id="requested-table" href="javascript:void(0)">
                        <span class="op-symbol font-medium text-xs">A<u>b</u></span><span>Ends with</span>
                      </a></li>
                      <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="eq" data-symbol="=" data-symbol-type="math" data-table-id="requested-table" href="javascript:void(0)">
                        <span class="op-symbol op-symbol-math font-medium text-xs">=</span><span>Equal</span>
                      </a></li>
                      <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="neq" data-symbol="≠" data-symbol-type="math" data-table-id="requested-table" href="javascript:void(0)">
                        <span class="op-symbol op-symbol-math font-medium text-xs">≠</span><span>Not equal</span>
                      </a></li>
                      
                    </ul>
                  </div>
                  <input type="text" placeholder="Search here..." class="nemko-filter-input nemko-filter-search" />
                </div>
              </div>
              <div class="nemko-filter-list d-flex flex-column gap-1">
                <label class="font-medium text-sm text-color-3">Type</label>
                <select class="nemko-filter-input" data-table-id="requested-table" data-filter-key="qualificationType">
                  <option value="">All</option>
                  <option value="standard">Standard</option>
                  <option value="scheme">Scheme</option>
                  <option value="test-method">Test Method</option>
                </select>
              </div>
              <div class="nemko-filter-list d-flex flex-column gap-1">
                <label class="font-medium text-sm text-color-3">Status</label>
                <select class="nemko-filter-input" data-table-id="requested-table" data-filter-key="active">
                  <option value="">All</option>
                  <option value="Yes">Active</option>
                  <option value="No">Inactive</option>
                </select>
              </div>
              <div class="nemko-filter-list d-flex flex-column gap-1">
                <label class="font-medium text-sm text-color-3">Report Approver</label>
                <select class="nemko-filter-input" data-table-id="requested-table" data-filter-key="report">
                  <option value="">All</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div class="nemko-filter-list d-flex flex-column gap-1">
                <label class="font-medium text-sm text-color-3">Conformity Statement</label>
                <select class="nemko-filter-input" data-table-id="requested-table" data-filter-key="conformity">
                  <option value="">All</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div class="nemko-filter-list d-flex flex-column gap-1">
                <label class="font-medium text-sm text-color-3">Certification Decision</label>
                <select class="nemko-filter-input" data-table-id="requested-table" data-filter-key="certificationDecision">
                  <option value="">All</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div class="nemko-filter-list d-flex flex-column gap-1">
                <label class="font-medium text-sm text-color-3">Level</label>
                <select class="nemko-filter-input" id="requestedLevelFilter" data-table-id="requested-table" data-filter-key="level">
                  <option value="">All</option>
                </select>
              </div>
            </div>
            <ul class="pagination nemko-pagination justify-content-start align-items-center gap-2 w-100 float-start px-4"></ul>
            <div class="w-100 float-start d-flex flex-column position-relative px-4 pt-2">
              <div class="col-visibility-btn">
                <div class="w-100 dropdown ">
                  <svg data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside"
                    class="cursor-pointer" width="28" height="14" viewBox="0 0 14 12" fill="none">
                    <path d="M0 5.66218C0.591383 2.44103 3.41366 0 6.80594 0C10.1982 0 13.0205 2.44103 13.6125 5.66218C13.0211 8.88332 10.1982 11.3244 6.80594 11.3244C3.41366 11.3244 0.591383 8.88332 0 5.66218ZM6.80594 8.80783C7.64021 8.80783 8.44032 8.47641 9.03025 7.88649C9.62017 7.29656 9.95159 6.49645 9.95159 5.66218C9.95159 4.8279 9.62017 4.02779 9.03025 3.43786C8.44032 2.84794 7.64021 2.51652 6.80594 2.51652C5.97166 2.51652 5.17155 2.84794 4.58162 3.43786C3.9917 4.02779 3.66028 4.8279 3.66028 5.66218C3.66028 6.49645 3.9917 7.29656 4.58162 7.88649C5.17155 8.47641 5.97166 8.80783 6.80594 8.80783ZM6.80594 7.54957C6.30537 7.54957 5.8253 7.35072 5.47135 6.99676C5.11739 6.64281 4.91854 6.16274 4.91854 5.66218C4.91854 5.16161 5.11739 4.68154 5.47135 4.32759C5.8253 3.97363 6.30537 3.77478 6.80594 3.77478C7.3065 3.77478 7.78657 3.97363 8.14052 4.32759C8.49448 4.68154 8.69333 5.16161 8.69333 5.66218C8.69333 6.16274 8.49448 6.64281 8.14052 6.99676C7.78657 7.35072 7.3065 7.54957 6.80594 7.54957Z" fill="#696A6E" />
                  </svg>
                  <ul id="requested-col-visibility" class="dropdown-menu col-visibility-dd-menu px-4 py-12"></ul>
                </div>
              </div>
              <div class="table-responsive nemko-table-container my-qualifcation-table-requested">
                <table class="table">
                  <thead><tr></tr></thead>
                  <tbody>
                    <tr class="nemko-skeleton-row"><td colspan="20"><div class="nemko-skeleton-cell"></div></td></tr>
                    <tr class="nemko-skeleton-row"><td colspan="20"><div class="nemko-skeleton-cell"></div></td></tr>
                    <tr class="nemko-skeleton-row"><td colspan="20"><div class="nemko-skeleton-cell"></div></td></tr>
                    <tr class="nemko-skeleton-row"><td colspan="20"><div class="nemko-skeleton-cell"></div></td></tr>
                    <tr class="nemko-skeleton-row"><td colspan="20"><div class="nemko-skeleton-cell"></div></td></tr>
                    <tr class="nemko-skeleton-row"><td colspan="20"><div class="nemko-skeleton-cell"></div></td></tr>
                    <tr class="nemko-skeleton-row"><td colspan="20"><div class="nemko-skeleton-cell"></div></td></tr>
                    <tr class="nemko-skeleton-row"><td colspan="20"><div class="nemko-skeleton-cell"></div></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <ul class="pagination nemko-pagination justify-content-start align-items-center gap-2 w-100 float-start px-4"></ul>
          </div>

        </div>
      </div>
    </div>
  </div>


    <!-- ── ADD QUALIFICATION MODAL ── -->
  <div class="modal nemko-modal nemko-modal-default add-qualification-modal" id="addQualificationModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title text-lg font-semibold">New Qualification</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body custom-scroll-view">
          <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">

            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="qualifcationTypeList" class="form-label font-semibold">Qualification Type <span class="text-danger">*</span></label>
              <select class="form-select" id="qualifcationTypeList">
                <option value="" disabled selected>Select type</option>
              </select>
              <div class="invalid-feedback">Qualification type is required.</div>
            </div>

            <div class="quaification-type-standard w-100 float-start" style="display:none;">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label for="Standared" class="form-label font-semibold" id="standardFieldLabel">Qualification Reference</label>
                <div class="d-flex align-items-center gap-2">
                  <input type="text" class="form-control flex-grow-1" id="Standared" data-ref-id="" readonly />
                  <button type="button" class="frm-right-arrow-btn select-standared-modal-btn"></button>
                </div>
                <div class="invalid-feedback">Standard is required.</div>
              </div>
            </div>

            <div class="w-100 float-start d-flex flex-column form-control-col">
              <div class="form-label-cr font-semibold">Qualification Level <span class="text-danger">*</span></div>
              <div class="d-flex flex-column gap-2 align-items-start" id="qualificationLevelRadios">
              </div>
              <div class="invalid-feedback" id="qualificationLevelError" style="display:none;">Qualification level is required.</div>
            </div>

            <div class="w-100 float-start qualificationLevelSub-container" style="display:none;">
              <div class="w-100 float-start d-flex flex-column form-control-col checkbox-list-main">
                <label class="nemko-frm-chkbox d-none align-items-center gap-2">
                  <input class="form-check-input" type="checkbox" value="report-approver" name="qualificationLevelSub">
                  <span class="chkbox-icon"></span>
                  <p class="form-check-label">Report Approver</p>
                </label>
                <label class="nemko-frm-chkbox d-none align-items-center gap-2">
                  <input class="form-check-input" type="checkbox" value="conformity-conformity" name="qualificationLevelSub">
                  <span class="chkbox-icon"></span>
                  <p class="form-check-label">Conformity Statement</p>
                </label>
                <label class="nemko-frm-chkbox d-none align-items-center gap-2">
                  <input class="form-check-input" type="checkbox" value="certification-decision" name="qualificationLevelSub">
                  <span class="chkbox-icon"></span>
                  <p class="form-check-label">Certification Decision</p>
                </label>
              </div>
            </div>

            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="remarksTxtarea" class="form-label font-semibold">Remarks</label>
              <textarea rows="3" style="resize: vertical;" class="form-control custom-scroll-view" id="remarksTxtarea"></textarea>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="limitationsTxtarea" class="form-label font-semibold">Limitations by Applicant (reference only)</label>
              <textarea rows="3" style="resize: vertical;" class="form-control custom-scroll-view" id="limitationsTxtarea"></textarea>
            </div>

            <div class="row gy-3">
              <div class="col-12 col-sm-6">
                <div class="w-100 float-start d-flex flex-column form-control-col">
                  <label for="targetAchieveDate" class="form-label font-semibold">Target Achieve Date</label>
                  <input type="text" class="form-control has-calendar-icon" id="targetAchieveDate" />
                </div>
              </div>
            </div>

            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="toBeVerifiedByIp" class="form-label font-semibold">To Be Verified by <span class="text-danger">*</span></label>
              <div class="d-flex align-items-center gap-2">
                <input type="text" class="form-control flex-grow-1" id="toBeVerifiedByIp" data-emp-ids="" readonly />
                <button type="button" class="frm-right-arrow-btn select-emp-modal-btn"></button>
                <button type="button" class="frm-right-close-btn"></button>
              </div>
              <div class="invalid-feedback">To be verified by is required.</div>
            </div>

            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="toBeAuthorizedByIp" class="form-label font-semibold">To Be Authorized by</label>
              <div class="d-flex align-items-center gap-2">
                <input type="text" class="form-control flex-grow-1" id="toBeAuthorizedByIp" data-emp-ids="" readonly />
                <button type="button" class="frm-right-arrow-btn select-emp-modal-btn"></button>
                <button type="button" class="frm-right-close-btn"></button>
              </div>
              <div class="invalid-feedback">To be authorized by is required.</div>
            </div>

          </div>
        </div>
        <div class="modal-footer gap-2 justify-content-sm-start justify-content-center">
          <button type="button" class="btn nemko-btn-default nemko-btn-save text-sm m-0" id="submitQualificationBtn">Submit</button>
          <button type="button" class="btn nemko-btn-default nemko-btn-cancel text-sm m-0" data-bs-dismiss="modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ── SELECT STANDARD/SCHEME/TESTMETHOD MODAL ── -->
  <div class="modal nemko-modal nemko-modal-default standared-select-modal" id="standardSelectModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title text-lg font-semibold" id="standardSelectModalTitle">Select Standard</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-frm-search-top w-100 float-start">
          <div class="w-100 float-start d-flex flex-column form-control-col">
            <div class="d-flex align-items-center gap-2">
              <input type="text" class="form-control flex-grow-1 modal-search-input" id="selectStandaredSearch" placeholder="Search" />
              <button type="button" class="frm-right-close-btn"></button>
            </div>
          </div>
        </div>
        <div class="modal-body custom-scroll-view pt-0">
          <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm">
            <div class="w-100 float-start d-flex flex-column form-control-col checkbox-list-main" id="standardSelectList">
              <div class="text-center py-3 text-color-3 text-sm">Loading...</div>
            </div>
          </div>
        </div>
        <div class="modal-footer gap-2 justify-content-sm-start justify-content-center">
          <button type="button" class="btn nemko-btn-default nemko-btn-save text-sm m-0" id="standardSelectSaveBtn">Save</button>
          <button type="button" class="btn nemko-btn-default nemko-btn-cancel text-sm m-0" data-bs-dismiss="modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ── SELECT EMPLOYEE MODAL ── -->
  <div class="modal nemko-modal nemko-modal-default select-emp-modal" id="selectEmpModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title text-lg font-semibold">Select Employee</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-frm-search-top w-100 float-start">
          <div class="w-100 float-start d-flex flex-column form-control-col">
            <div class="d-flex align-items-center gap-2">
              <input type="text" class="form-control flex-grow-1 modal-search-input" id="selectEmpSearch" placeholder="Search" />
              <button type="button" class="frm-right-close-btn"></button>
            </div>
          </div>
        </div>
        <div class="modal-body custom-scroll-view pt-0">
          <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm">
            <div class="w-100 float-start d-flex flex-column form-control-col checkbox-list-main" id="empSelectList">
              <div class="text-center py-3 text-color-3 text-sm">Loading...</div>
            </div>
          </div>
        </div>
        <div class="modal-footer gap-2 justify-content-sm-start justify-content-center">
          <button type="button" class="btn nemko-btn-default nemko-btn-save text-sm m-0" id="empSelectSaveBtn">Save</button>
          <button type="button" class="btn nemko-btn-default nemko-btn-cancel text-sm m-0" data-bs-dismiss="modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ── EDIT QUALIFICATION MODAL ── -->
  <div class="modal nemko-modal nemko-modal-default add-qualification-modal qualification-edit-modal" id="editQualificationModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title text-lg font-semibold">Edit Qualification</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body custom-scroll-view">

          <div id="editModalLoading" class="text-center py-4 text-color-3 text-sm font-medium" style="display:none;">Loading...</div>
          <div id="editModalError"   class="text-center py-4 text-sm font-medium" style="display:none;">Could not load qualification.</div>

          <div id="editModalContent" class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">

            <!-- Qualification Type -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editQualifcationTypeList" class="form-label font-semibold">Qualification Type <span class="text-danger">*</span></label>
              <input type="text" class="form-control flex-grow-1" id="editQualifcationTypeList" data-type-key="" disabled />
            </div>

            <!-- Reference field -->
            <div class="quaification-type-standard w-100 float-start">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label for="editStandared" class="form-label font-semibold">Qualification Reference <span class="text-danger">*</span></label>
                <input type="text" class="form-control flex-grow-1" id="editStandared" disabled />
              </div>
            </div>

            <!-- Two-column level layout -->
            <div class="w-100 float-start d-flex flex-column flex-sm-row gap-3">

              <!-- LEFT: Current Qualification Level (readonly) -->
              <div class="flex-bs-1 min-w-0 float-start d-flex flex-column form-control-col">
                <div class="form-label-cr font-semibold">Qualification Level</div>
                <div class="d-flex flex-column gap-2 align-items-start" id="editQualificationLevelCurrentRadios">
                </div>
                <!-- Readonly sub-checkboxes rendered here by JS based on row data -->
                <div class="edit-current-level-subs w-100 float-start d-flex flex-column form-control-col checkbox-list-main mt-2" style="display:none;"></div>
              </div>

              <!-- RIGHT: Updated Qualification Level (interactive) -->
              <div class="flex-bs-1 min-w-0 float-start d-flex flex-column form-control-col">
                <div class="form-label-cr font-semibold">Updated Qualification Level <span class="text-danger">*</span></div>
                <div class="d-flex flex-column gap-2 align-items-start" id="editQualificationLevelUpdatedRadios">
                </div>
                <!-- Dynamic sub-checkboxes for updated level -->
                <div class="edit-updated-level-subs w-100 float-start d-flex flex-column form-control-col checkbox-list-main mt-2" style="display:none;">
                  <label class="nemko-frm-chkbox d-none align-items-center gap-2">
                    <input class="form-check-input" type="checkbox" value="report-approver" name="editQualificationLevelSub">
                    <span class="chkbox-icon"></span>
                    <p class="form-check-label">Report Approver</p>
                  </label>
                  <label class="nemko-frm-chkbox d-none align-items-center gap-2">
                    <input class="form-check-input" type="checkbox" value="conformity-conformity" name="editQualificationLevelSub">
                    <span class="chkbox-icon"></span>
                    <p class="form-check-label">Conformity Statement</p>
                  </label>
                  <label class="nemko-frm-chkbox d-none align-items-center gap-2">
                    <input class="form-check-input" type="checkbox" value="certification-decision" name="editQualificationLevelSub">
                    <span class="chkbox-icon"></span>
                    <p class="form-check-label">Certification Decision</p>
                  </label>
                </div>
              </div>

            </div>

            <!-- Remarks -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editRemarksTxtarea" class="form-label font-semibold">Remarks</label>
              <textarea rows="3" style="resize: vertical;" class="form-control custom-scroll-view" id="editRemarksTxtarea"></textarea>
            </div>

            <!-- Limitations -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editLimitationsTxtarea" class="form-label font-semibold">Limitations by Applicant (reference only)</label>
              <p class="frm-readonly-val" id="editLimitationsPara" style="display:none;">-</p>
              <textarea rows="3" style="resize: vertical;" class="form-control custom-scroll-view" id="editLimitationsTxtarea" disabled></textarea>
            </div>

            <!-- Final Limitations -->
            <div class="w-100 float-start d-flex flex-column form-control-col" id="editFinalLimitationsRow">
              <label for="editFinalLimitationsTxtarea" class="form-label font-semibold">Final Limitations</label>
              <p class="frm-readonly-val" id="editFinalLimitationsPara" style="display:none;">-</p>
              <textarea rows="3" style="resize: vertical;" class="form-control custom-scroll-view" id="editFinalLimitationsTxtarea" disabled></textarea>
            </div>

            <!-- Date fields -->
            <div class="row gy-3">
              <div class="col-12 col-sm-6 col-md-6">
                <div class="w-100 float-start d-flex flex-column form-control-col">
                  <label for="editTargetAchieveDate" class="form-label font-semibold">Target Achieve Date</label>
                  <input type="text" class="form-control has-calendar-icon edit-target-achieve-date-input" id="editTargetAchieveDate" />
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-6">
                <div class="w-100 float-start d-flex flex-column form-control-col">
                  <label for="editQualifiedDate" class="form-label font-semibold">Qualified Date</label>
                  <input type="text" class="form-control has-calendar-icon" id="editQualifiedDate" disabled/>
                </div>
              </div>
            </div>

            <!-- Verified By -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editToBeVerifiedByIp" class="form-label font-semibold">To Be Verified by <span class="text-danger">*</span></label>
              <div class="d-flex align-items-center gap-2">
                <input type="text" class="form-control flex-grow-1" id="editToBeVerifiedByIp" readonly/>
                <button type="button" class="frm-right-arrow-btn select-emp-modal-btn"></button>
                <button type="button" class="frm-right-close-btn"></button>
              </div>
            </div>

            <!-- Authorized By -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editToBeAuthorizedByIp" class="form-label font-semibold">To Be Authorized by</label>
              <div class="d-flex align-items-center gap-2">
                <input type="text" class="form-control flex-grow-1" id="editToBeAuthorizedByIp" readonly/>
                <button type="button" class="frm-right-arrow-btn select-emp-modal-btn"></button>
                <button type="button" class="frm-right-close-btn"></button>
              </div>
            </div>

          </div>
        </div>
        <div class="modal-footer gap-2 justify-content-sm-start justify-content-center">
          <button type="button" class="btn nemko-btn-default nemko-btn-save text-sm m-0">Update</button>
          <button type="button" class="btn nemko-btn-default nemko-btn-cancel text-sm m-0" data-bs-dismiss="modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ── EDIT QUALIFICATION MODAL (REQUESTED TAB) ── -->
  <div class="modal nemko-modal nemko-modal-default add-qualification-modal qualification-edit-modal" id="editQualificationModalRequested" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title text-lg font-semibold">Edit Qualification</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body custom-scroll-view">

          <div id="editModalLoading" class="text-center py-4 text-color-3 text-sm font-medium" style="display:none;">Loading...</div>
          <div id="editModalError"   class="text-center py-4 text-sm font-medium" style="display:none;">Could not load qualification.</div>

          <div id="editModalContent" class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">

            <!-- Qualification Type -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editQualifcationTypeList" class="form-label font-semibold">Qualification Type <span class="text-danger">*</span></label>
              <input type="text" class="form-control flex-grow-1" id="editQualifcationTypeList" data-type-key="" disabled />
            </div>

            <!-- Reference field -->
            <div class="quaification-type-standard w-100 float-start">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label for="editStandared" class="form-label font-semibold">Qualification Reference <span class="text-danger">*</span></label>
                <input type="text" class="form-control flex-grow-1" id="editStandared" disabled />
              </div>
            </div>

            <!-- Two-column level layout -->
            <div class="w-100 float-start d-flex flex-column flex-sm-row gap-3">

              <!-- LEFT: Current Qualification Level (readonly) -->
              <div class="flex-bs-1 min-w-0 float-start d-flex flex-column form-control-col">
                <div class="form-label-cr font-semibold">Qualification Level</div>
                <div class="d-flex flex-column gap-2 align-items-start" id="editQualificationLevelCurrentRadios">
                </div>
                <!-- Readonly sub-checkboxes rendered here by JS based on row data -->
                <div class="edit-current-level-subs w-100 float-start d-flex flex-column form-control-col checkbox-list-main mt-2" style="display:none;"></div>
              </div>

              <!-- RIGHT: Updated Qualification Level (interactive) -->
              <div class="flex-bs-1 min-w-0 float-start d-flex flex-column form-control-col">
                <div class="form-label-cr font-semibold">Updated Qualification Level <span class="text-danger">*</span></div>
                <div class="d-flex flex-column gap-2 align-items-start" id="editQualificationLevelUpdatedRadios">
                </div>
                <!-- Dynamic sub-checkboxes for updated level -->
                <div class="edit-updated-level-subs w-100 float-start d-flex flex-column form-control-col checkbox-list-main mt-2" style="display:none;">
                  <label class="nemko-frm-chkbox d-none align-items-center gap-2">
                    <input class="form-check-input" type="checkbox" value="report-approver" name="editQualificationLevelSub">
                    <span class="chkbox-icon"></span>
                    <p class="form-check-label">Report Approver</p>
                  </label>
                  <label class="nemko-frm-chkbox d-none align-items-center gap-2">
                    <input class="form-check-input" type="checkbox" value="conformity-conformity" name="editQualificationLevelSub">
                    <span class="chkbox-icon"></span>
                    <p class="form-check-label">Conformity Statement</p>
                  </label>
                  <label class="nemko-frm-chkbox d-none align-items-center gap-2">
                    <input class="form-check-input" type="checkbox" value="certification-decision" name="editQualificationLevelSub">
                    <span class="chkbox-icon"></span>
                    <p class="form-check-label">Certification Decision</p>
                  </label>
                </div>
              </div>

            </div>

            <!-- Remarks -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editRemarksTxtarea" class="form-label font-semibold">Remarks</label>
              <textarea rows="3" style="resize: vertical;" class="form-control custom-scroll-view" id="editRemarksTxtarea"></textarea>
            </div>

            <!-- Limitations -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editLimitationsTxtarea" class="form-label font-semibold">Limitations by Applicant (reference only)</label>
              <p class="frm-readonly-val" id="editLimitationsPara" style="display:none;">-</p>
              <textarea rows="3" style="resize: vertical;" class="form-control custom-scroll-view" id="editLimitationsTxtarea" disabled></textarea>
            </div>

            <!-- Final Limitations -->
            <div class="w-100 float-start d-flex flex-column form-control-col" id="editFinalLimitationsRow">
              <label for="editFinalLimitationsTxtarea" class="form-label font-semibold">Final Limitations</label>
              <p class="frm-readonly-val" id="editFinalLimitationsPara" style="display:none;">-</p>
              <textarea rows="3" style="resize: vertical;" class="form-control custom-scroll-view" id="editFinalLimitationsTxtarea" disabled></textarea>
            </div>

            <!-- Rejection Reason -->
            <div class="w-100 float-start d-flex flex-column form-control-col" id="editRejectionReasonRow">
              <label for="editRejectionReasonTxtarea" class="form-label font-semibold">Rejection Reason</label>
              <p class="frm-readonly-val" id="editRejectionReasonPara" style="display:none;">-</p>
              <textarea rows="3" style="resize: vertical;" class="form-control custom-scroll-view" id="editRejectionReasonTxtarea" disabled></textarea>
            </div>

            <!-- Date fields -->
            <div class="row gy-3">
              <div class="col-12 col-sm-6 col-md-6">
                <div class="w-100 float-start d-flex flex-column form-control-col">
                  <label for="editTargetAchieveDateRequested" class="form-label font-semibold">Target Achieve Date</label>
                  <input type="text" class="form-control has-calendar-icon edit-target-achieve-date-input" id="editTargetAchieveDateRequested" />
                </div>
              </div>
            </div>

            <!-- Verified By -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editToBeVerifiedByIp" class="form-label font-semibold">To Be Verified by <span class="text-danger">*</span></label>
              <div class="d-flex align-items-center gap-2">
                <input type="text" class="form-control flex-grow-1" id="editToBeVerifiedByIp" readonly/>
                <button type="button" class="frm-right-arrow-btn select-emp-modal-btn"></button>
                <button type="button" class="frm-right-close-btn"></button>
              </div>
            </div>

            <!-- Authorized By -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editToBeAuthorizedByIp" class="form-label font-semibold">To Be Authorized by</label>
              <div class="d-flex align-items-center gap-2">
                <input type="text" class="form-control flex-grow-1" id="editToBeAuthorizedByIp" readonly/>
                <button type="button" class="frm-right-arrow-btn select-emp-modal-btn"></button>
                <button type="button" class="frm-right-close-btn"></button>
              </div>
            </div>

          </div>
        </div>
        <div class="modal-footer gap-2 justify-content-sm-start justify-content-center">
          <button type="button" class="btn nemko-btn-default nemko-btn-save text-sm m-0">Update</button>
          <button type="button" class="btn nemko-btn-default nemko-btn-cancel text-sm m-0" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-danger nemko-btn-default nemko-btn-delete text-sm m-0 ms-auto">Delete</button>
        </div>
      </div>
    </div>
  </div>



<!-- ── DETAILS QUALIFICATION MODAL ── -->

<div class="modal nemko-modal qualification-details-modal nemko-modal-default" id="detailsQualificationModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title text-lg font-semibold">Qualification Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body custom-scroll-view">
        <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">

          <div id="detailsModalLoading" class="text-center py-4 text-color-3 text-sm font-medium" style="display:none;">Loading...</div>
          <div id="detailsModalError"   class="text-center py-4 text-sm font-medium" style="display:none;">Could not load qualification details.</div>

          <div id="detailsModalContent" style="display:none;">
            <div class="d-flex flex-column gap-3">

              <div class="row gy-3">
                <div class="col-12 col-sm-6 col-md-6">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Qualification ID</label>
                    <input type="text" class="form-control" id="detailsQualificationId" readonly />
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-6">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Requested by</label>
                    <input type="text" class="form-control" id="detailsRequestedBy" readonly />
                  </div>
                </div>
                
              </div>

              <div class="row gy-3">
                <div class="col-12 col-sm-6 col-md-6">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Local Unit</label>
                    <input type="text" class="form-control" id="localUnit" readonly />
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-6">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Email Address</label>
                    <input type="email" class="form-control" id="detailsReqEmail" readonly />
                  </div>
                </div>
                
              </div>

              <div class="row gy-3">
                <div class="col-12 col-sm-6 col-md-6">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Qualification</label>
                    <input type="text" class="form-control" id="detailsQualificationRef" readonly />
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-6">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Qualification Type</label>
                    <input type="text" class="form-control" id="detailsQualificationType" readonly />
                  </div>
                </div>
              </div>

              <div class="row gy-3">
                <div class="col-12 col-sm-6 col-md-6">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Qualification Level</label>
                    <input type="text" class="form-control" id="detailsQualificationLevel" readonly />
                  </div>
                </div>
              </div>

              <div class="row gy-3">
                <div class="col-12 col-sm-4 col-md-4">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Status</label>
                    <input type="text" class="form-control" id="qualificationStatus" readonly />
                  </div>
                </div>
                <div class="col-12 col-sm-4 col-md-4">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Report Approver</label>
                    <input type="text" class="form-control" id="detailsReportApprover" readonly />
                  </div>
                </div>
                <div class="col-12 col-sm-4 col-md-4">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Conformity Statement</label>
                    <input type="text" class="form-control" id="detailsConformityStatement" readonly />
                  </div>
                </div>
                <div class="col-12 col-sm-4 col-md-4">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Certification Decision</label>
                    <input type="text" class="form-control" id="detailsCertificationDecision" readonly />
                  </div>
                </div>
              </div>

              

              <div class="w-100 float-start d-flex py-1" id="detailsRemarksRow">
                <div class="w-100 float-start d-flex flex-column form-control-col">
                  <label class="form-label font-semibold">Remarks</label>
                  <p class="frm-readonly-val" id="detailsRemarks">-</p>
                  <textarea class="form-control h-px-98 custom-scroll-view" id="detailsRemarksTxtarea" readonly style="display:none;"></textarea>
                </div>
              </div>

              <div class="w-100 float-start d-flex flex-column form-control-col" id="detailsLimitationsRow">
                <label class="form-label font-semibold">Limitations by Applicant (reference only)</label>
                <p class="frm-readonly-val" id="detailsLimitationsPara" style="display:none;">-</p>
                <textarea class="form-control h-px-98 custom-scroll-view" id="detailsLimitationsTxtarea" readonly></textarea>
              </div>

              <div class="w-100 float-start d-flex flex-column form-control-col" id="detailsFinalLimitationsRow">
                <label class="form-label font-semibold">Final Limitations</label>
                <p class="frm-readonly-val" id="detailsFinalLimitationsPara" style="display:none;">-</p>
                <textarea class="form-control h-px-98 custom-scroll-view" id="detailsFinalLimitationsTxtarea" readonly></textarea>
              </div>

              <div class="row gy-3" id="detailsWithdrawnByRow" >
                <div class="col-12 col-sm-6 col-md-6">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Withdrawn by</label>
                    <input type="text" class="form-control" id="detailsWithdrawnBy" readonly />
                  </div>
                </div>
              </div>

              <div class="w-100 float-start d-flex flex-column form-control-col" id="detailsWithdrawnReasonRow" style="display:none;">
                <label class="form-label font-semibold">Withdrawn Reason</label>
                <p class="frm-readonly-val" id="detailsWithdrawnReasonPara" style="display:none;">-</p>
                <textarea class="form-control h-px-98 custom-scroll-view" id="detailsWithdrawnReasonTxtarea" readonly></textarea>
              </div>

              <div class="row gy-3">
                <div class="col-12 col-sm-6 col-md-6">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Target Achieve Date</label>
                    <input type="text" class="form-control" id="detailsTargetAchieveDateReadonly" readonly />
                  </div>
                </div>
              </div>

              <div class="row gy-3">
                <div class="col-12 col-sm-6 col-md-6">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Qualified Date</label>
                    <input type="text" class="form-control" id="detailsQualifiedDateReadonly" readonly />
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-6">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Withdrawn Date</label>
                    <input type="text" class="form-control" id="detailsWithdrawnDateReadonly" readonly />
                  </div>
                </div>
              </div>

              <div class="row gy-3">
                <div class="col-12 col-sm-6 col-md-6">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Verified by</label>
                    <input type="text" class="form-control" id="detailsVerifiedBy" readonly />
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-6">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Authorized by</label>
                    <input type="text" class="form-control" id="detailsAuthorizedBy" readonly />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn nemko-btn-default nemko-btn-cancel text-sm m-0" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>


<!-- ── DETAILS QUALIFICATION MODAL (REQUESTED TAB) ── -->

<div class="modal nemko-modal qualification-details-modal nemko-modal-default" id="detailsQualificationModalRequested" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title text-lg font-semibold">Qualification Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body custom-scroll-view">
        <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">

          <div id="detailsModalLoading" class="text-center py-4 text-color-3 text-sm font-medium" style="display:none;">Loading...</div>
          <div id="detailsModalError"   class="text-center py-4 text-sm font-medium" style="display:none;">Could not load qualification details.</div>

          <div id="detailsModalContent" style="display:none;">
            <div class="d-flex flex-column gap-3">

              <div class="row gy-3">
                <div class="col-12 col-sm-6 col-md-6">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Qualification ID</label>
                    <input type="text" class="form-control" id="detailsQualificationId" readonly />
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-6">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Requested by</label>
                    <input type="text" class="form-control" id="detailsRequestedBy" readonly />
                  </div>
                </div>
              </div>

              <div class="row gy-3">
                <div class="col-12 col-sm-6 col-md-6">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Local Unit</label>
                    <input type="text" class="form-control" id="localUnit" readonly />
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-6">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Email Address</label>
                    <input type="email" class="form-control" id="detailsReqEmail" readonly />
                  </div>
                </div>
                
              </div>

              <div class="row gy-3">
                <div class="col-12 col-sm-6 col-md-6">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Qualification</label>
                    <input type="text" class="form-control" id="detailsQualificationRef" readonly />
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-6">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Qualification Type</label>
                    <input type="text" class="form-control" id="detailsQualificationType" readonly />
                  </div>
                </div>
              </div>

              <div class="row gy-3">
                <div class="col-12 col-sm-6 col-md-6">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Qualification Level</label>
                    <input type="text" class="form-control" id="detailsQualificationLevel" readonly />
                  </div>
                </div>
              </div>

              <div class="row gy-3">
                <div class="col-12 col-sm-4 col-md-4">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Status</label>
                    <input type="text" class="form-control" id="qualificationStatus" readonly />
                  </div>
                </div>
                <div class="col-12 col-sm-4 col-md-4">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Report Approver</label>
                    <input type="text" class="form-control" id="detailsReportApprover" readonly />
                  </div>
                </div>
                <div class="col-12 col-sm-4 col-md-4">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Conformity Statement</label>
                    <input type="text" class="form-control" id="detailsConformityStatement" readonly />
                  </div>
                </div>
                <div class="col-12 col-sm-4 col-md-4">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Certification Decision</label>
                    <input type="text" class="form-control" id="detailsCertificationDecision" readonly />
                  </div>
                </div>
              </div>

              

              <div class="w-100 float-start d-flex py-1" id="detailsRemarksRow">
                <div class="w-100 float-start d-flex flex-column form-control-col">
                  <label class="form-label font-semibold">Remarks</label>
                  <p class="frm-readonly-val" id="detailsRemarks">-</p>
                  <textarea class="form-control h-px-98 custom-scroll-view" id="detailsRemarksTxtarea" readonly style="display:none;"></textarea>
                </div>
              </div>

              <div class="w-100 float-start d-flex flex-column form-control-col" id="detailsLimitationsRow">
                <label class="form-label font-semibold">Limitations by Applicant (reference only)</label>
                <p class="frm-readonly-val" id="detailsLimitationsPara" style="display:none;">-</p>
                <textarea class="form-control h-px-98 custom-scroll-view" id="detailsLimitationsTxtarea" readonly></textarea>
              </div>

              <div class="w-100 float-start d-flex flex-column form-control-col" id="detailsFinalLimitationsRow">
                <label class="form-label font-semibold">Final Limitations</label>
                <p class="frm-readonly-val" id="detailsFinalLimitationsPara" style="display:none;">-</p>
                <textarea class="form-control h-px-98 custom-scroll-view" id="detailsFinalLimitationsTxtarea" readonly></textarea>
              </div>

              <div class="row gy-3">
                <div class="col-12 col-sm-6 col-md-6">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Rejected by</label>
                    <input type="text" class="form-control" id="detailsRejectedBy" readonly />
                  </div>
                </div>
              </div>

              <div class="w-100 float-start d-flex flex-column form-control-col" id="detailsRejectionReasonRow">
                <label class="form-label font-semibold">Rejection Reason</label>
                <p class="frm-readonly-val" id="detailsRejectionReasonPara" style="display:none;">-</p>
                <textarea class="form-control h-px-98 custom-scroll-view" id="detailsRejectionReasonTxtarea" readonly></textarea>
              </div>

              <div class="row gy-3">
                <div class="col-12 col-sm-6 col-md-6">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Target Achieve Date</label>
                    <input type="text" class="form-control" id="detailsTargetAchieveDateReadonly" readonly />
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-6">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Rejected Date</label>
                    <input type="text" class="form-control" id="detailsRejectedDateReadonly" readonly />
                  </div>
                </div>
              </div>

              

              <div class="row gy-3">
                <div class="col-12 col-sm-6 col-md-6">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Verified by</label>
                    <input type="text" class="form-control" id="detailsVerifiedBy" readonly />
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-6">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Authorized by</label>
                    <input type="text" class="form-control" id="detailsAuthorizedBy" readonly />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn nemko-btn-default nemko-btn-cancel text-sm m-0" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>


 

    `
}