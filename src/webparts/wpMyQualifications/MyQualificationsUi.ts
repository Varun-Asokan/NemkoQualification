export default class MyQualifications {

    public static allElementsHtml: string = `
    

<div class="sidebar-overlay" id="sidebarOverlay"></div>

  

  <div class="main-wrapper min-h-screen-container has-nemko-sidebar">
    <div class="w-100 float-start">
      <div class="container container-nemko px-3 px-lg-4 clearfix py-3">
                <div class="w-100 float-start nemko-inner-page-wrapper py-5 ps-xl-4">

          <h2 class="inner-page-main-title font-bold mb-3" style="font-size: 2.8rem;">Qualifications</h2>

          <div class="w-100 float-start d-flex justify-content-between align-items-center mb-3 gap-3 flex-wrap">
            <div class="d-flex gap-2">
              <button data-tab-id="authorized-table" type="button" class="btn nemko-tab-btn nemko-tab-btn-active px-3 text-base md-text-lg">Authorized</button>
              <button data-tab-id="requested-table" type="button" class="btn nemko-tab-btn px-3 text-base md-text-lg">Requested</button>
            </div>
            <button data-bs-toggle="modal" data-bs-target="#addQualificationModal" type="button" class="btn nemko-btn-default px-3 nemko-btn-primary text-base md-text-lg">Add Qualification</button>
          </div>

          <!-- ── AUTHORIZED TABLE ── -->
          <div id="authorized-table" style="display:block;"
            class="nemko-data-table-wrapper nemko-data-table-qualification w-100 float-start">
            <div class="nemko-table-top-filter-wrapper w-100 float-start px-4 pt-4 pb-2">
              <div class="nemko-filter-list d-flex flex-column gap-1">
                <label class="font-medium text-sm text-color-3">Search</label>
                <div class="d-flex position-relative">
                  <button type="button" class="text-transform-btn font-medium text-xs text-color-3">Ab</button>
                  <input type="text" placeholder="Search here..." class="nemko-filter-input nemko-filter-search" />
                </div>
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
                <label class="font-medium text-sm text-color-3">Report</label>
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
                <label class="font-medium text-sm text-color-3">Level</label>
                <select class="nemko-filter-input" data-table-id="authorized-table" data-filter-key="level">
                  <option value="">All</option>
                  <option value="Employee">Employee</option>
                  <option value="1 - Test Associate">1-Test Associate</option>
                  <option value="2 - Project Handler">2-Project Handler</option>
                  <option value="3 - Verifier">3-Verifier</option>
                  <option value="4 - Verifier Assessor">4-Verifier Assessor</option>
                </select>
              </div>
            </div>
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
                  <tbody><tr></tr></tbody>
                </table>
              </div>
            </div>
            <ul class="pagination nemko-pagination justify-content-end align-items-center gap-2 w-100 float-start px-4"></ul>
          </div>

        
          <div id="requested-table" style="display:none;"
            class="nemko-data-table-wrapper nemko-data-table-qualification w-100 float-start">
            <div class="nemko-table-top-filter-wrapper w-100 float-start px-4 pt-4 pb-2">
              <div class="nemko-filter-list d-flex flex-column gap-1">
                <label class="font-medium text-sm text-color-3">Search</label>
                <div class="d-flex position-relative">
                  <button type="button" class="text-transform-btn font-medium text-xs text-color-3">Ab</button>
                  <input type="text" placeholder="Search here..." class="nemko-filter-input nemko-filter-search" />
                </div>
              </div>
            </div>
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
                  <tbody><tr></tr></tbody>
                </table>
              </div>
            </div>
            <ul class="pagination nemko-pagination justify-content-end align-items-center gap-2 w-100 float-start px-4"></ul>
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
          <h5 class="modal-title fhd-text-xl-combo">new qualification</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body custom-scroll-view">
          <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">

            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="qualifcationTypeList" class="form-label font-semibold">Qualification Type</label>
              <select class="form-select" id="qualifcationTypeList">
                <option value="type">Type</option>
                <option value="standard">Standard</option>
                <option value="scheme">Scheme</option>
                <option value="testMethod">Test Method</option>
              </select>
            </div>

            <div class="quaification-type-standard w-100 float-start" style="display:none;">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label for="Standared" class="form-label font-semibold" id="standardFieldLabel">Standard</label>
                <div class="d-flex align-items-center gap-2">
                  <input type="text" class="form-control flex-grow-1" id="Standared" readonly />
                  <button type="button" class="frm-right-arrow-btn select-standared-modal-btn"></button>
                </div>
              </div>
            </div>

            <div class="w-100 float-start d-flex flex-column form-control-col">
              <div class="form-label-cr font-semibold">Qualification Level</div>
              <div class="d-flex flex-column gap-2 align-items-start">
                <label class="nemko-frm-radio d-flex align-items-center gap-2">
                  <input class="form-check-input" type="radio" name="qualificationLevel" value="employee">
                  <span class="radio-icon radio-icon-lg"></span>
                  <p class="form-check-label">Employee</p>
                </label>
                <label class="nemko-frm-radio d-flex align-items-center gap-2">
                  <input class="form-check-input" type="radio" name="qualificationLevel" value="1_test_associate">
                  <span class="radio-icon radio-icon-lg"></span>
                  <p class="form-check-label">1 - Test Associate</p>
                </label>
                <label class="nemko-frm-radio d-flex align-items-center gap-2">
                  <input class="form-check-input" type="radio" name="qualificationLevel" value="2_project_handler">
                  <span class="radio-icon radio-icon-lg"></span>
                  <p class="form-check-label">2 - project handler</p>
                </label>
                <label class="nemko-frm-radio d-flex align-items-center gap-2">
                  <input class="form-check-input" type="radio" name="qualificationLevel" value="3_verifier">
                  <span class="radio-icon radio-icon-lg"></span>
                  <p class="form-check-label">3 - verifier</p>
                </label>
                <label class="nemko-frm-radio d-flex align-items-center gap-2">
                  <input class="form-check-input" type="radio" name="qualificationLevel" value="4_verifier_assessor">
                  <span class="radio-icon radio-icon-lg"></span>
                  <p class="form-check-label">4 - verifier assessor</p>
                </label>
              </div>
            </div>

            <div class="w-100 float-start qualificationLevelSub-container" style="display:none;">
              <div class="w-100 float-start d-flex flex-column form-control-col checkbox-list-main">
                <label class="nemko-frm-chkbox d-none align-items-center gap-2">
                  <input class="form-check-input" type="checkbox" value="report-approver" name="qualificationLevelSub">
                  <span class="chkbox-icon"></span>
                  <p class="form-check-label">report approver</p>
                </label>
                <label class="nemko-frm-chkbox d-none align-items-center gap-2">
                  <input class="form-check-input" type="checkbox" value="conformity-conformity" name="qualificationLevelSub">
                  <span class="chkbox-icon"></span>
                  <p class="form-check-label">conformity statement</p>
                </label>
                <label class="nemko-frm-chkbox d-none align-items-center gap-2">
                  <input class="form-check-input" type="checkbox" value="certification-decision" name="qualificationLevelSub">
                  <span class="chkbox-icon"></span>
                  <p class="form-check-label">certification Decision</p>
                </label>
              </div>
            </div>

            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="remarksTxtarea" class="form-label font-semibold">remarks</label>
              <textarea class="form-control h-px-90 custom-scroll-view" id="remarksTxtarea"></textarea>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="limitationsTxtarea" class="form-label font-semibold">Limitations</label>
              <textarea class="form-control h-px-90 custom-scroll-view" id="limitationsTxtarea"></textarea>
            </div>

            <div class="row gy-3">
              <div class="col-12 col-sm-6">
                <div class="w-100 float-start d-flex flex-column form-control-col">
                  <label for="targetAchieveDate" class="form-label font-semibold">target achieve date</label>
                  <input type="text" class="form-control has-calendar-icon" id="targetAchieveDate" />
                </div>
              </div>
            </div>

            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="toBeVerifiedByIp" class="form-label font-semibold">to be verified by</label>
              <div class="d-flex align-items-center gap-2">
                <input type="text" class="form-control flex-grow-1" id="toBeVerifiedByIp" readonly />
                <button type="button" class="frm-right-arrow-btn select-emp-modal-btn"></button>
                <button type="button" class="frm-right-close-btn"></button>
              </div>
            </div>

            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="toBeAuthorizedByIp" class="form-label font-semibold">to be authorized by</label>
              <div class="d-flex align-items-center gap-2">
                <input type="text" class="form-control flex-grow-1" id="toBeAuthorizedByIp" readonly />
                <button type="button" class="frm-right-arrow-btn select-emp-modal-btn"></button>
                <button type="button" class="frm-right-close-btn"></button>
              </div>
            </div>

          </div>
        </div>
        <div class="modal-footer gap-2 justify-content-sm-start justify-content-center">
          <button type="button" class="btn nemko-btn-default nemko-btn-save text-base md-text-lg m-0" id="submitQualificationBtn">Submit</button>
          <button type="button" class="btn nemko-btn-default nemko-btn-cancel text-base md-text-lg m-0" data-bs-dismiss="modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ── SELECT STANDARD/SCHEME/TESTMETHOD MODAL ── -->
  <div class="modal nemko-modal nemko-modal-default standared-select-modal" id="standardSelectModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fhd-text-xl-combo" id="standardSelectModalTitle">Select Standard</h5>
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
          <button type="button" class="btn nemko-btn-default nemko-btn-save text-base md-text-lg m-0" id="standardSelectSaveBtn">Save</button>
          <button type="button" class="btn nemko-btn-default nemko-btn-cancel text-base md-text-lg m-0" data-bs-dismiss="modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ── SELECT EMPLOYEE MODAL ── -->
  <div class="modal nemko-modal nemko-modal-default select-emp-modal" id="selectEmpModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fhd-text-xl-combo">Select Employee</h5>
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
          <button type="button" class="btn nemko-btn-default nemko-btn-save text-base md-text-lg m-0" id="empSelectSaveBtn">Save</button>
          <button type="button" class="btn nemko-btn-default nemko-btn-cancel text-base md-text-lg m-0" data-bs-dismiss="modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ── EDIT QUALIFICATION MODAL ── -->
  <div class="modal nemko-modal nemko-modal-default add-qualification-modal" id="editQualificationModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fhd-text-xl-combo">Edit Qualification</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body custom-scroll-view">
          <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">

            <!-- Qualification Type -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editQualifcationTypeList" class="form-label font-semibold">Qualification Type</label>
              <select class="form-select" id="editQualifcationTypeList">
                <option value="" selected disabled>Select Type</option>
                <option value="standard">Standard</option>
                <option value="scheme">Scheme</option>
                <option value="testMethod">Test Method</option>
              </select>
            </div>

            <!-- Standard field -->
            <div class="quaification-type-standard w-100 float-start">
              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label for="editStandared" class="form-label font-semibold">Standard</label>
                <div class="d-flex align-items-center gap-2">
                  <input type="text" class="form-control flex-grow-1" id="editStandared" />
                  <button type="button" class="frm-right-arrow-btn select-standared-modal-btn"></button>
                </div>
              </div>
            </div>

            <!-- Two-column level layout -->
            <div class="w-100 float-start d-flex flex-column flex-sm-row gap-3">

              <!-- LEFT: Current Qualification Level (readonly) -->
              <div class="flex-bs-1 min-w-0 float-start d-flex flex-column form-control-col">
                <div class="form-label-cr font-semibold">Qualification Level</div>
                <div class="d-flex flex-column gap-2 align-items-start">
                  <label class="nemko-frm-radio d-flex align-items-center gap-2">
                    <input class="form-check-input" type="radio" name="editQualificationLevel" value="employee" disabled>
                    <span class="radio-icon radio-icon-lg"></span>
                    <p class="form-check-label">Employee</p>
                  </label>
                  <label class="nemko-frm-radio d-flex align-items-center gap-2">
                    <input class="form-check-input" type="radio" name="editQualificationLevel" value="1_test_associate" disabled>
                    <span class="radio-icon radio-icon-lg"></span>
                    <p class="form-check-label">1 - Test Associate</p>
                  </label>
                  <label class="nemko-frm-radio d-flex align-items-center gap-2">
                    <input class="form-check-input" type="radio" name="editQualificationLevel" value="2_project_handler" disabled>
                    <span class="radio-icon radio-icon-lg"></span>
                    <p class="form-check-label">2 - project handler</p>
                  </label>
                  <label class="nemko-frm-radio d-flex align-items-center gap-2">
                    <input class="form-check-input" type="radio" name="editQualificationLevel" value="3_verifier" disabled>
                    <span class="radio-icon radio-icon-lg"></span>
                    <p class="form-check-label">3 - verifier</p>
                  </label>
                  <label class="nemko-frm-radio d-flex align-items-center gap-2">
                    <input class="form-check-input" type="radio" name="editQualificationLevel" value="4_verifier_assessor" disabled>
                    <span class="radio-icon radio-icon-lg"></span>
                    <p class="form-check-label">4 - verifier assessor</p>
                  </label>
                </div>
                <!-- Readonly sub-checkboxes rendered here by JS based on row data -->
                <div class="edit-current-level-subs w-100 float-start d-flex flex-column form-control-col checkbox-list-main mt-2" style="display:none !important;"></div>
              </div>

              <!-- RIGHT: Updated Qualification Level (interactive) -->
              <div class="flex-bs-1 min-w-0 float-start d-flex flex-column form-control-col">
                <div class="form-label-cr font-semibold">Updated Qualification Level</div>
                <div class="d-flex flex-column gap-2 align-items-start">
                  <label class="nemko-frm-radio d-flex align-items-center gap-2">
                    <input class="form-check-input" type="radio" name="editQualificationLevelUpdated" value="employee">
                    <span class="radio-icon radio-icon-lg"></span>
                    <p class="form-check-label">Employee</p>
                  </label>
                  <label class="nemko-frm-radio d-flex align-items-center gap-2">
                    <input class="form-check-input" type="radio" name="editQualificationLevelUpdated" value="1_test_associate">
                    <span class="radio-icon radio-icon-lg"></span>
                    <p class="form-check-label">1 - Test Associate</p>
                  </label>
                  <label class="nemko-frm-radio d-flex align-items-center gap-2">
                    <input class="form-check-input" type="radio" name="editQualificationLevelUpdated" value="2_project_handler">
                    <span class="radio-icon radio-icon-lg"></span>
                    <p class="form-check-label">2 - project handler</p>
                  </label>
                  <label class="nemko-frm-radio d-flex align-items-center gap-2">
                    <input class="form-check-input" type="radio" name="editQualificationLevelUpdated" value="3_verifier">
                    <span class="radio-icon radio-icon-lg"></span>
                    <p class="form-check-label">3 - verifier</p>
                  </label>
                  <label class="nemko-frm-radio d-flex align-items-center gap-2">
                    <input class="form-check-input" type="radio" name="editQualificationLevelUpdated" value="4_verifier_assessor">
                    <span class="radio-icon radio-icon-lg"></span>
                    <p class="form-check-label">4 - verifier assessor</p>
                  </label>
                </div>
                <!-- Dynamic sub-checkboxes for updated level -->
                <div class="edit-updated-level-subs w-100 float-start d-flex flex-column form-control-col checkbox-list-main mt-2" style="display:none;">
                  <label class="nemko-frm-chkbox d-none align-items-center gap-2">
                    <input class="form-check-input" type="checkbox" value="report-approver" name="editQualificationLevelSub">
                    <span class="chkbox-icon"></span>
                    <p class="form-check-label">report approver</p>
                  </label>
                  <label class="nemko-frm-chkbox d-none align-items-center gap-2">
                    <input class="form-check-input" type="checkbox" value="conformity-conformity" name="editQualificationLevelSub">
                    <span class="chkbox-icon"></span>
                    <p class="form-check-label">conformity statement</p>
                  </label>
                  <label class="nemko-frm-chkbox d-none align-items-center gap-2">
                    <input class="form-check-input" type="checkbox" value="certification-decision" name="editQualificationLevelSub">
                    <span class="chkbox-icon"></span>
                    <p class="form-check-label">certification Decision</p>
                  </label>
                </div>
              </div>

            </div>

            <!-- Remarks -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editRemarksTxtarea" class="form-label font-semibold">remarks</label>
              <textarea class="form-control h-px-90 custom-scroll-view" id="editRemarksTxtarea"></textarea>
            </div>

            <!-- Limitations -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editLimitationsTxtarea" class="form-label font-semibold">Limitations</label>
              <textarea class="form-control h-px-90 custom-scroll-view" id="editLimitationsTxtarea"></textarea>
            </div>

            <!-- Date fields -->
            <div class="row gy-3">
              <div class="col-12 col-sm-6 col-md-6">
                <div class="w-100 float-start d-flex flex-column form-control-col">
                  <label for="editTargetAchieveDate" class="form-label font-semibold">target achieve date</label>
                  <input type="text" class="form-control has-calendar-icon" id="editTargetAchieveDate" />
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-6">
                <div class="w-100 float-start d-flex flex-column form-control-col">
                  <label for="editQualifiedDate" class="form-label font-semibold">qualified date</label>
                  <input type="text" class="form-control has-calendar-icon" id="editQualifiedDate" />
                </div>
              </div>
            </div>

            <!-- Verified By -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editToBeVerifiedByIp" class="form-label font-semibold">to be verified by</label>
              <div class="d-flex align-items-center gap-2">
                <input type="text" class="form-control flex-grow-1" id="editToBeVerifiedByIp" />
                <button type="button" class="frm-right-arrow-btn select-emp-modal-btn"></button>
                <button type="button" class="frm-right-close-btn"></button>
              </div>
            </div>

            <!-- Authorized By -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editToBeAuthorizedByIp" class="form-label font-semibold">to be authorized by</label>
              <div class="d-flex align-items-center gap-2">
                <input type="text" class="form-control flex-grow-1" id="editToBeAuthorizedByIp" />
                <button type="button" class="frm-right-arrow-btn select-emp-modal-btn"></button>
                <button type="button" class="frm-right-close-btn"></button>
              </div>
            </div>

          </div>
        </div>
        <div class="modal-footer gap-2 justify-content-sm-start justify-content-center">
          <button type="button" class="btn nemko-btn-default nemko-btn-save text-base md-text-lg m-0">Update</button>
          <button type="button" class="btn nemko-btn-default nemko-btn-cancel text-base md-text-lg m-0" data-bs-dismiss="modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>


   
<!-- ── DETAILS QUALIFICATION MODAL ── -->

<div class="modal nemko-modal qualification-details-modal nemko-modal-default" id="detailsQualificationModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title fhd-text-xl-combo">Qualification Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body custom-scroll-view">
        <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">

          <div id="detailsModalLoading" class="text-center py-4 text-color-3 text-sm font-medium" style="display:none;">Loading...</div>
          <div id="detailsModalError"   class="text-center py-4 text-sm font-medium" style="display:none;">Failed to load details.</div>

          <div id="detailsModalContent" style="display:none;">
            <div class="d-flex flex-column gap-3">

              <div class="row gy-3">
                <div class="col-12 col-sm-6 col-md-7">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Req email</label>
                    <input type="email" class="form-control" id="detailsReqEmail" readonly />
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-5">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <div class="form-label-cr font-semibold">approval is rejected</div>
                    <div class="d-flex align-items-center gap-3 mt-1">
                      <label class="nemko-frm-radio d-flex align-items-center gap-1">
                        <input class="form-check-input" type="radio" name="detailsApprovalRejected" value="yes" disabled>
                        <span class="radio-icon"></span>
                        <p class="form-check-label">Yes</p>
                      </label>
                      <label class="nemko-frm-radio d-flex align-items-center gap-1">
                        <input class="form-check-input" type="radio" name="detailsApprovalRejected" value="no" disabled checked>
                        <span class="radio-icon"></span>
                        <p class="form-check-label">No</p>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="row gy-3">
                <div class="col-12 col-sm-6 col-md-7">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">ver email</label>
                    <input type="email" class="form-control" id="detailsVerEmail" readonly />
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-5">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <div class="form-label-cr font-semibold">authorization is rejected</div>
                    <div class="d-flex align-items-center gap-3 mt-1">
                      <label class="nemko-frm-radio d-flex align-items-center gap-1">
                        <input class="form-check-input" type="radio" name="detailsAuthRejected" value="yes" disabled>
                        <span class="radio-icon"></span>
                        <p class="form-check-label">Yes</p>
                      </label>
                      <label class="nemko-frm-radio d-flex align-items-center gap-1">
                        <input class="form-check-input" type="radio" name="detailsAuthRejected" value="no" disabled checked>
                        <span class="radio-icon"></span>
                        <p class="form-check-label">No</p>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="row gy-3">
                <div class="col-12 col-sm-6 col-md-7">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">aut email</label>
                    <input type="email" class="form-control" id="detailsAuthEmail" readonly />
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-5">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">approval date</label>
                    <div class="d-flex align-items-center gap-2 date-picker-input-row">
                      <input type="text" class="form-control flex-grow-1 date-picker-input" id="detailsApprovalDateInput" readonly />
                      
                    </div>
                  </div>
                </div>
              </div>

              <div class="w-100 float-start d-flex frm-readonly-row py-1">
                <div class="w-100 float-start d-flex flex-column form-control-col">
                  <label class="form-label font-semibold">qualification ID</label>
                  <p class="frm-readonly-val" id="detailsQualificationId">-</p>
                </div>
              </div>

              <div class="w-100 float-start d-flex frm-readonly-row py-1">
                <div class="w-100 float-start d-flex flex-column form-control-col">
                  <label class="form-label font-semibold">requested by</label>
                  <p class="frm-readonly-val" id="detailsRequestedBy">-</p>
                </div>
              </div>

              <div class="w-100 float-start d-flex frm-readonly-row py-1">
                <div class="w-100 float-start d-flex flex-column form-control-col">
                  <label class="form-label font-semibold">qualification</label>
                  <p class="frm-readonly-val" id="detailsQualificationRef">-</p>
                </div>
              </div>

              <div class="w-100 float-start d-flex flex-wrap gap-3 frm-readonly-row justify-content-between py-1">
                <div class="d-flex flex-column form-control-col min-w-0">
                  <label class="form-label font-semibold">qualification level</label>
                  <p class="frm-readonly-val" id="detailsQualificationLevel">-</p>
                </div>
                <div class="d-flex flex-column form-control-col min-w-0">
                  <label class="form-label font-semibold">conformity statement</label>
                  <p class="frm-readonly-val" id="detailsConformityStatement">-</p>
                </div>
                <div class="d-flex flex-column form-control-col min-w-0">
                  <label class="form-label font-semibold">report approver</label>
                  <p class="frm-readonly-val" id="detailsReportApprover">-</p>
                </div>
              </div>

              <div class="w-100 float-start d-flex frm-readonly-row py-1">
                <div class="w-100 float-start d-flex flex-column form-control-col">
                  <label class="form-label font-semibold">remarks</label>
                  <p class="frm-readonly-val" id="detailsRemarks">-</p>
                </div>
              </div>

              <div class="w-100 float-start d-flex frm-readonly-row py-1">
                <div class="w-100 float-start d-flex flex-column form-control-col">
                  <label class="form-label font-semibold">limitations (verifier)</label>
                  <p class="frm-readonly-val" id="detailsLimitationsVerifier">-</p>
                </div>
              </div>

              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">limitations</label>
                <textarea class="form-control h-px-98 custom-scroll-view" id="detailsLimitationsTxtarea" readonly></textarea>
              </div>

              <div class="w-100 float-start d-flex frm-readonly-row py-1">
                <div class="w-100 float-start d-flex flex-column form-control-col">
                  <label class="form-label font-semibold">approval date</label>
                  <p class="frm-readonly-val" id="detailsApprovalDateReadonly">-</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn nemko-btn-default nemko-btn-cancel text-base md-text-lg m-0" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>


 

    `
}