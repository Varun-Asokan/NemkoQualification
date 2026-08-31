export default class AdvancedSearch {

    public static allElementsHtml: string = `
<style>
  .date-picker-input-row .date-picker-icon {
    background-image: url('__KEY_URL_RESOURCE__/resources/images/icons/calendar.svg') !important;
  }
</style>

<div class="sidebar-overlay" id="sidebarOverlay"></div>

    <div class="main-wrapper min-h-screen-container has-nemko-sidebar">
    <div class="w-100 float-start">
      <div class="container container-nemko px-3 px-lg-4 clearfix py-3">
        <div class="w-100 float-start nemko-inner-page-wrapper py-4 ps-xl-4">
          <h2 class="w-100 float-start fhd-text-size-48-combo text-color-9 font-medium mb-3 text-capitalize">
            qualifications Database</h2>
          <div class="w-100 float-start qualification-db-wrapper bg-white">
            <div class="w-100 float-start d-flex justify-content-between align-items-center gap-4 flex-wrap py-4">
              <div class="d-flex gap-3 gap-lg-4 flex-grow-1 min-w-0">
                <button data-tab-id="advanced-search-table" type="button"
                  class="nemko-btn-default nemko-tab-btn nemko-tab-btn-active px-2 px-sm-3 text-base">advanced
                  search</button>
                <button data-tab-id="database-table" type="button"
                  class="nemko-btn-default nemko-tab-btn px-2 px-sm-3 text-base">database</button>
              </div>
              <button type="button" id="export-advanced-search-btn" style="display:none"
                class="nemko-btn-default px-3 nemko-btn-secondary text-xs export-excel-btn">Export To
                Excel</button>
            </div>

            <!-- ── ADVANCED SEARCH TAB ── -->
            <div id="advanced-search-table"
              class="nemko-data-table-wrapper nemko-data-table-qualification w-100 float-start" style="display: block;">
              <div class="w-100 float-start px-4">
                <div class="pb-4 pt-2 advanced-search-filter-wrapper d-flex flex-column flex-xxl-row align-items-center mb-2 gap-3 gap-xl-4">
                  <div class="d-flex flex-column gap-3 flex-grow-1 min-w-0">
                    <div class="row gy-4">
                      <div class="col-12 col-sm-6 col-md-4">
                        <div class="w-100 float-start d-flex flex-column form-control-col">
                          <label for="" class="form-label">standard</label>
                          <div class="d-flex align-items-center gap-2">
                            <div class="nemko-search-select position-relative flex-grow-1">
                              <input type="text" class="form-control w-100" id="f-standard" autocomplete="off">
                              <ul class="nemko-email-suggestions nemko-inline-filter-suggestions list-unstyled position-absolute w-100"
                                data-field="standard" style="display:none;"></ul>
                            </div>
                            <button type="button" class="frm-right-arrow-btn field-select-btn" data-bs-toggle="modal"
                              data-bs-target="#sharedSelectModal" data-field="standard"></button>
                            <button type="button" class="frm-right-close-btn field-clear-btn" data-field="standard"></button>
                          </div>
                        </div>
                      </div>
                      <div class="col-12 col-sm-6 col-md-4">
                        <div class="w-100 float-start d-flex flex-column form-control-col">
                          <label for="" class="form-label">scheme</label>
                          <div class="d-flex align-items-center gap-2">
                            <div class="nemko-search-select position-relative flex-grow-1">
                              <input type="text" class="form-control w-100" id="f-scheme" autocomplete="off">
                              <ul class="nemko-email-suggestions nemko-inline-filter-suggestions list-unstyled position-absolute w-100"
                                data-field="scheme" style="display:none;"></ul>
                            </div>
                            <button type="button" class="frm-right-arrow-btn field-select-btn" data-bs-toggle="modal"
                              data-bs-target="#sharedSelectModal" data-field="scheme"></button>
                            <button type="button" class="frm-right-close-btn field-clear-btn" data-field="scheme"></button>
                          </div>
                        </div>
                      </div>
                      <div class="col-12 col-sm-6 col-md-4">
                        <div class="w-100 float-start d-flex flex-column form-control-col">
                          <label for="" class="form-label">Test method</label>
                          <div class="d-flex align-items-center gap-2">
                            <div class="nemko-search-select position-relative flex-grow-1">
                              <input type="text" class="form-control w-100" id="f-testmethod" autocomplete="off">
                              <ul class="nemko-email-suggestions nemko-inline-filter-suggestions list-unstyled position-absolute w-100"
                                data-field="testmethod" style="display:none;"></ul>
                            </div>
                            <button type="button" class="frm-right-arrow-btn field-select-btn" data-bs-toggle="modal"
                              data-bs-target="#sharedSelectModal" data-field="testmethod"></button>
                            <button type="button" class="frm-right-close-btn field-clear-btn" data-field="testmethod"></button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="row gy-4">
                      <div class="col-12 col-sm-6 col-md-4">
                        <div class="w-100 float-start d-flex flex-column form-control-col">
                          <label for="" class="form-label">employee</label>
                          <div class="d-flex align-items-center gap-2">
                            <div class="nemko-search-select position-relative flex-grow-1">
                              <input type="text" class="form-control w-100" id="f-employee" autocomplete="off">
                              <ul class="nemko-email-suggestions nemko-inline-filter-suggestions list-unstyled position-absolute w-100"
                                data-field="employee" style="display:none;"></ul>
                            </div>
                            <button type="button" class="frm-right-arrow-btn field-select-btn" data-bs-toggle="modal"
                              data-bs-target="#sharedSelectModal" data-field="employee"></button>
                            <button type="button" class="frm-right-close-btn field-clear-btn" data-field="employee"></button>
                          </div>
                        </div>
                      </div>
                      <div class="col-12 col-sm-6 col-md-4">
                        <div class="w-100 float-start d-flex flex-column form-control-col">
                          <label for="" class="form-label">office</label>
                          <div class="d-flex align-items-center gap-2">
                            <div class="nemko-search-select position-relative flex-grow-1">
                              <input type="text" class="form-control w-100" id="f-office" autocomplete="off">
                              <ul class="nemko-email-suggestions nemko-inline-filter-suggestions list-unstyled position-absolute w-100"
                                data-field="office" style="display:none;"></ul>
                            </div>
                            <button type="button" class="frm-right-arrow-btn field-select-btn" data-bs-toggle="modal"
                              data-bs-target="#sharedSelectModal" data-field="office"></button>
                            <button type="button" class="frm-right-close-btn field-clear-btn" data-field="office"></button>
                          </div>
                        </div>
                      </div>
                      <div class="col-12 col-sm-6 col-md-4">
                        <div class="d-flex gap-2">
                          <div class="flex-shrink-0 float-start d-flex flex-column form-control-col min-w-120">
                            <label for="f-status" class="form-label">Status</label>
                            <select class="form-select" id="f-status">
                              <option value="">All</option>
                              <option value="true" selected>Active</option>
                              <option value="false">Inactive</option>
                            </select>
                          </div>
                          <div class="flex-grow-1 min-w-0 float-start d-flex flex-column form-control-col">
                            <label for="f-level" class="form-label">level</label>
                            <select class="form-select" id="f-level">
                              <option value="">All</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="row gy-4">
                      <div class="col-12 col-sm-4 col-md-4">
                        <div class="w-100 float-start" id="conformity_statement" style="display: none;">
                          <div class="w-100 float-start d-flex flex-column form-control-col">
                            <label for="f-conformity" class="form-label">conformity Statement</label>
                            <select class="form-select" id="f-conformity">
                              <option value="">All</option>
                              <option value="true">Yes</option>
                              <option value="false">No</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div class="col-12 col-sm-8 col-md-6 col-xxl-4">
                        <div class="d-flex gap-2 flex-wrap">
                          <div class="flex-bs-1" id="report_approver" style="display: none;">
                            <div class="w-100 float-start d-flex flex-column form-control-col">
                              <label for="f-reportApprover" class="form-label text-nowrap">Report Approver</label>
                              <select class="form-select" id="f-reportApprover">
                                <option value="">All</option>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                              </select>
                            </div>
                          </div>
                          <div class="flex-bs-1" id="certificate_decision" style="display: none;">
                            <div class="w-100 float-start d-flex flex-column form-control-col">
                              <label for="f-certDecision" class="form-label text-nowrap">Certification Decision</label>
                              <select class="form-select" id="f-certDecision">
                                <option value="">All</option>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="d-flex gap-2 flex-shrink-0 mt-xxl-3 pt-xxl-1">
                    <button type="button"
                      class="btn nemko-btn-default nemko-btn-cancel text-xs m-0">Reset All</button>
                  </div>
                </div>
              </div>

              <!-- Advanced Search pagination (top) -->
              <ul class="pagination nemko-pagination justify-content-start align-items-center gap-2 w-100 float-start px-4"></ul>

              <!-- Advanced Search table + col-visibility dropdown -->
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

              <!-- Advanced Search pagination (bottom) -->
              <ul class="pagination nemko-pagination justify-content-start align-items-center gap-2 w-100 float-start px-4"></ul>
            </div>

            <!-- ── DATABASE TAB ── -->
            <div id="database-table"
              class="nemko-data-table-wrapper nemko-data-table-qualification w-100 float-start" style="display: none; pt-3">

              <!-- Database sub-tab navigation -->
              <div class="w-100 float-start px-4">
                <div class="w-100 float-start db-tab-title-wrapper custom-scroll-view custom-scroll-h-view mt-1">
                  <div class="d-flex db-tab-title-container gap-4">
                    <div data-db-tabid="db-tab-standared" class="db-tab-title db-tab-title-active text-base lg-text-lg px-1">
                      <span>Standard</span>
                    </div>
                    <div data-db-tabid="db-tab-schemes" class="db-tab-title text-base lg-text-lg px-1">
                      <span>Schemes</span>
                    </div>
                    <div data-db-tabid="db-tab-test-method" class="db-tab-title text-base lg-text-lg px-1">
                      <span>Test Methods</span>
                    </div>
                    
                    <div data-db-tabid="db-tab-employees" class="db-tab-title text-base lg-text-lg px-1">
                      <span>Employees</span>
                    </div>
                   
                    
                  </div>
                </div>
              </div>

              <!-- Database sub-tab views -->
              <div class="w-100 float-start db-tab-view-wrapper py-3">

                <!-- ── Standard Tab ── -->
                <div class="w-100 float-start db-tab-view" id="db-tab-standared" style="display: block;">
                  <div class="w-100 float-start d-flex flex-column gap-2" id="standared-table">
                    <div class="w-100 float-start px-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <div class="d-flex flex-wrap gap-2">
                        <button type="button" data-bs-toggle="modal" data-bs-target="#createStandaredModal"
                          class="nemko-btn-default nemko-btn-save text-base md-text-lg m-0 px-3 text-capitalize btn-lg-content" style="display:none">New Standard</button>
                        <button
                          id="import-standard-btn"
                          type="button"
                          style="display:none"
                          class="nemko-btn-default nemko-btn-secondary px-3 text-base lg-text-lg import-trigger-btn"
                          data-import-type="standard">
                          Import Standard
                        </button>
                      </div>
                      <button type="button" id="export-standard-btn" style="display:none" class="nemko-btn-default px-3 nemko-btn-secondary text-xs export-excel-btn"
                        data-export-table="standared-table">Export To Excel</button>
                    </div>
                    <div class="w-100 float-start px-4 pt-px-12">
                      <div class="row">
                        <div class="col-12 col-sm-6 col-xl-4 col-xxl-3">
                          <div class="nemko-filter-list d-flex flex-column gap-1">
                            <label class="font-medium text-sm text-color-3">title search</label>
                            <div class="d-flex position-relative">
                              <div class="dropdown search-operator-dd">
                                <button type="button" class="text-transform-btn font-medium text-xs text-color-3"
                                        data-bs-toggle="dropdown" aria-expanded="false" data-operator="contains"><u>Ab</u></button>
                                <ul class="dropdown-menu search-operator-menu py-1">
                                  <li><a class="search-op-item d-flex align-items-center gap-2 active" data-operator="contains" data-symbol="Ab" data-symbol-type="text-full" data-table="standared-table" href="javascript:void(0)">
                                    <span class="op-symbol font-medium text-xs"><u>Ab</u></span><span>Contains</span>
                                  </a></li>
                                  <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="startswith" data-symbol="Ab" data-symbol-type="text-start" data-table="standared-table" href="javascript:void(0)">
                                    <span class="op-symbol font-medium text-xs"><u>A</u>b</span><span>Starts with</span>
                                  </a></li>
                                  <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="endswith" data-symbol="Ab" data-symbol-type="text-end" data-table="standared-table" href="javascript:void(0)">
                                    <span class="op-symbol font-medium text-xs">A<u>b</u></span><span>Ends with</span>
                                  </a></li>
                                  <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="eq" data-symbol="=" data-symbol-type="math" data-table="standared-table" href="javascript:void(0)">
                                    <span class="op-symbol op-symbol-math font-medium text-xs">=</span><span>Equal</span>
                                  </a></li>
                                  <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="neq" data-symbol="≠" data-symbol-type="math" data-table="standared-table" href="javascript:void(0)">
                                    <span class="op-symbol op-symbol-math font-medium text-xs">≠</span><span>Not equal</span>
                                  </a></li>
                                </ul>
                              </div>
                              <input type="text" placeholder="search"
                                class="nemko-filter-input nemko-filter-search" data-table="standared-table" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ul class="pagination nemko-pagination justify-content-start align-items-center gap-2 w-100 float-start px-4"></ul>
                    <div class="w-100 float-start d-flex flex-column position-relative px-4 pt-2">
                      <div class="col-visibility-btn">
                        <div class="w-100 dropdown position-static">
                          <svg data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside"
                            class="cursor-pointer" width="28" height="14" viewBox="0 0 14 12" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 5.66218C0.591383 2.44103 3.41366 0 6.80594 0C10.1982 0 13.0205 2.44103 13.6125 5.66218C13.0211 8.88332 10.1982 11.3244 6.80594 11.3244C3.41366 11.3244 0.591383 8.88332 0 5.66218ZM6.80594 8.80783C7.64021 8.80783 8.44032 8.47641 9.03025 7.88649C9.62017 7.29656 9.95159 6.49645 9.95159 5.66218C9.95159 4.8279 9.62017 4.02779 9.03025 3.43786C8.44032 2.84794 7.64021 2.51652 6.80594 2.51652C5.97166 2.51652 5.17155 2.84794 4.58162 3.43786C3.9917 4.02779 3.66028 4.8279 3.66028 5.66218C3.66028 6.49645 3.9917 7.29656 4.58162 7.88649C5.17155 8.47641 5.97166 8.80783 6.80594 8.80783ZM6.80594 7.54957C6.30537 7.54957 5.8253 7.35072 5.47135 6.99676C5.11739 6.64281 4.91854 6.16274 4.91854 5.66218C4.91854 5.16161 5.11739 4.68154 5.47135 4.32759C5.8253 3.97363 6.30537 3.77478 6.80594 3.77478C7.3065 3.77478 7.78657 3.97363 8.14052 4.32759C8.49448 4.68154 8.69333 5.16161 8.69333 5.66218C8.69333 6.16274 8.49448 6.64281 8.14052 6.99676C7.78657 7.35072 7.3065 7.54957 6.80594 7.54957Z" fill="#696A6E" />
                          </svg>
                          <ul id="standared-col-visibility" class="dropdown-menu col-visibility-dd-menu px-4 py-12"></ul>
                        </div>
                      </div>
                      <div class="table-responsive nemko-table-container">
                        <table class="table"><thead><tr></tr></thead><tbody><tr></tr></tbody></table>
                      </div>
                    </div>
                    <ul class="pagination nemko-pagination justify-content-start align-items-center gap-2 w-100 float-start px-4"></ul>
                  </div>
                </div>

                <!-- ── Schemes Tab ── -->
                <div class="w-100 float-start db-tab-view" id="db-tab-schemes" style="display: none;">
                  <div class="w-100 float-start d-flex flex-column gap-2" id="schemes-table">
                    <div class="w-100 float-start px-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <div class="d-flex flex-wrap gap-2">
                        <button type="button" data-bs-toggle="modal" data-bs-target="#createSchemeModal"
                          class="nemko-btn-default nemko-btn-save text-base md-text-lg m-0 px-3 text-capitalize btn-lg-content" style="display:none">New Scheme</button>
                        <button
                          id="import-scheme-btn"
                          type="button"
                          style="display:none"
                          class="nemko-btn-default nemko-btn-secondary px-3 text-base lg-text-lg import-trigger-btn"
                          data-import-type="scheme">
                          Import Scheme
                        </button>
                      </div>
                      <button type="button" id="export-scheme-btn" style="display:none" class="nemko-btn-default px-3 nemko-btn-secondary text-xs export-excel-btn"
                        data-export-table="schemes-table">Export To Excel</button>
                    </div>
                    <div class="w-100 float-start px-4 pt-px-12">
                      <div class="row">
                        <div class="col-12 col-sm-6 col-xl-4 col-xxl-3">
                          <div class="nemko-filter-list d-flex flex-column gap-1">
                            <label class="font-medium text-sm text-color-3">search</label>
                            <div class="d-flex position-relative">
                              <div class="dropdown search-operator-dd">
                                <button type="button" class="text-transform-btn font-medium text-xs text-color-3"
                                        data-bs-toggle="dropdown" aria-expanded="false" data-operator="contains"><u>Ab</u></button>
                                <ul class="dropdown-menu search-operator-menu py-1">
                                  <li><a class="search-op-item d-flex align-items-center gap-2 active" data-operator="contains" data-symbol="Ab" data-symbol-type="text-full" data-table="schemes-table" href="javascript:void(0)">
                                    <span class="op-symbol font-medium text-xs"><u>Ab</u></span><span>Contains</span>
                                  </a></li>
                                  <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="startswith" data-symbol="Ab" data-symbol-type="text-start" data-table="schemes-table" href="javascript:void(0)">
                                    <span class="op-symbol font-medium text-xs"><u>A</u>b</span><span>Starts with</span>
                                  </a></li>
                                  <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="endswith" data-symbol="Ab" data-symbol-type="text-end" data-table="schemes-table" href="javascript:void(0)">
                                    <span class="op-symbol font-medium text-xs">A<u>b</u></span><span>Ends with</span>
                                  </a></li>
                                  <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="eq" data-symbol="=" data-symbol-type="math" data-table="schemes-table" href="javascript:void(0)">
                                    <span class="op-symbol op-symbol-math font-medium text-xs">=</span><span>Equal</span>
                                  </a></li>
                                  <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="neq" data-symbol="≠" data-symbol-type="math" data-table="schemes-table" href="javascript:void(0)">
                                    <span class="op-symbol op-symbol-math font-medium text-xs">≠</span><span>Not equal</span>
                                  </a></li>
                                </ul>
                              </div>
                              <input type="text" placeholder="search"
                                class="nemko-filter-input nemko-filter-search" data-table="schemes-table" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ul class="pagination nemko-pagination justify-content-start align-items-center gap-2 w-100 float-start px-4"></ul>
                    <div class="w-100 float-start d-flex flex-column position-relative px-4 pt-2">
                      <div class="col-visibility-btn">
                        <div class="w-100 dropdown position-static">
                          <svg data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside"
                            class="cursor-pointer" width="28" height="14" viewBox="0 0 14 12" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 5.66218C0.591383 2.44103 3.41366 0 6.80594 0C10.1982 0 13.0205 2.44103 13.6125 5.66218C13.0211 8.88332 10.1982 11.3244 6.80594 11.3244C3.41366 11.3244 0.591383 8.88332 0 5.66218ZM6.80594 8.80783C7.64021 8.80783 8.44032 8.47641 9.03025 7.88649C9.62017 7.29656 9.95159 6.49645 9.95159 5.66218C9.95159 4.8279 9.62017 4.02779 9.03025 3.43786C8.44032 2.84794 7.64021 2.51652 6.80594 2.51652C5.97166 2.51652 5.17155 2.84794 4.58162 3.43786C3.9917 4.02779 3.66028 4.8279 3.66028 5.66218C3.66028 6.49645 3.9917 7.29656 4.58162 7.88649C5.17155 8.47641 5.97166 8.80783 6.80594 8.80783ZM6.80594 7.54957C6.30537 7.54957 5.8253 7.35072 5.47135 6.99676C5.11739 6.64281 4.91854 6.16274 4.91854 5.66218C4.91854 5.16161 5.11739 4.68154 5.47135 4.32759C5.8253 3.97363 6.30537 3.77478 6.80594 3.77478C7.3065 3.77478 7.78657 3.97363 8.14052 4.32759C8.49448 4.68154 8.69333 5.16161 8.69333 5.66218C8.69333 6.16274 8.49448 6.64281 8.14052 6.99676C7.78657 7.35072 7.3065 7.54957 6.80594 7.54957Z" fill="#696A6E" />
                          </svg>
                          <ul id="schemes-col-visibility" class="dropdown-menu col-visibility-dd-menu px-4 py-12"></ul>
                        </div>
                      </div>
                      <div class="table-responsive nemko-table-container">
                        <table class="table"><thead><tr></tr></thead><tbody><tr></tr></tbody></table>
                      </div>
                    </div>
                    <ul class="pagination nemko-pagination justify-content-start align-items-center gap-2 w-100 float-start px-4"></ul>
                  </div>
                </div>

                <!-- ── Test Method Tab ── -->
                <div class="w-100 float-start db-tab-view" id="db-tab-test-method" style="display: none;">
                  <div class="w-100 float-start d-flex flex-column gap-2" id="test-method-table">
                    <div class="w-100 float-start px-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <div class="d-flex flex-wrap gap-2">
                        <button type="button" data-bs-toggle="modal" data-bs-target="#createTestmethodModal"
                          class="nemko-btn-default nemko-btn-save text-base md-text-lg m-0 px-3 text-capitalize btn-lg-content" style="display:none">New Test Method</button>
                          <button
                            id="import-test-method-btn"
                            type="button"
                            style="display:none"
                            class="nemko-btn-default nemko-btn-secondary px-3 text-base lg-text-lg import-trigger-btn"
                            data-import-type="testmethod">
                            Import Test Method
                          </button>
                      </div>
                      <button type="button" id="export-test-method-btn" style="display:none" class="nemko-btn-default px-3 nemko-btn-secondary text-xs export-excel-btn"
                        data-export-table="test-method-table">Export To Excel</button>
                    </div>
                    <div class="w-100 float-start px-4 pt-px-12">
                      <div class="row">
                        <div class="col-12 col-sm-6 col-xl-4 col-xxl-3">
                          <div class="nemko-filter-list d-flex flex-column gap-1">
                            <label class="font-medium text-sm text-color-3">title search</label>
                            <div class="d-flex position-relative">
                              <div class="dropdown search-operator-dd">
                                <button type="button" class="text-transform-btn font-medium text-xs text-color-3"
                                        data-bs-toggle="dropdown" aria-expanded="false" data-operator="contains"><u>Ab</u></button>
                                <ul class="dropdown-menu search-operator-menu py-1">
                                  <li><a class="search-op-item d-flex align-items-center gap-2 active" data-operator="contains" data-symbol="Ab" data-symbol-type="text-full" data-table="test-method-table" href="javascript:void(0)">
                                    <span class="op-symbol font-medium text-xs"><u>Ab</u></span><span>Contains</span>
                                  </a></li>
                                  <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="startswith" data-symbol="Ab" data-symbol-type="text-start" data-table="test-method-table" href="javascript:void(0)">
                                    <span class="op-symbol font-medium text-xs"><u>A</u>b</span><span>Starts with</span>
                                  </a></li>
                                  <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="endswith" data-symbol="Ab" data-symbol-type="text-end" data-table="test-method-table" href="javascript:void(0)">
                                    <span class="op-symbol font-medium text-xs">A<u>b</u></span><span>Ends with</span>
                                  </a></li>
                                  <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="eq" data-symbol="=" data-symbol-type="math" data-table="test-method-table" href="javascript:void(0)">
                                    <span class="op-symbol op-symbol-math font-medium text-xs">=</span><span>Equal</span>
                                  </a></li>
                                  <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="neq" data-symbol="≠" data-symbol-type="math" data-table="test-method-table" href="javascript:void(0)">
                                    <span class="op-symbol op-symbol-math font-medium text-xs">≠</span><span>Not equal</span>
                                  </a></li>
                                </ul>
                              </div>
                              <input type="text" placeholder="search"
                                class="nemko-filter-input nemko-filter-search" data-table="test-method-table" />
                            </div>
                          </div>
                        </div>
                        <div class="col-12 col-sm-6 col-xl-4 col-xxl-3">
                          <div class="nemko-filter-list d-flex flex-column gap-1">
                            <label class="font-medium text-sm text-color-3">category search</label>
                            <div class="nemko-search-select position-relative">
                              <input type="text" class="form-control nemko-ss-display" data-target="tmCategoryFilter" autocomplete="off" placeholder="All" />
                              <input type="hidden" id="tmCategoryFilter" data-table="test-method-table" data-filter-key="pdctCategory" />
                              <ul class="nemko-email-suggestions list-unstyled position-absolute w-100" style="display:none;"></ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ul class="pagination nemko-pagination justify-content-start align-items-center gap-2 w-100 float-start px-4"></ul>
                    <div class="w-100 float-start d-flex flex-column position-relative px-4 pt-2">
                      <div class="col-visibility-btn">
                        <div class="w-100 dropdown position-static">
                          <svg data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside"
                            class="cursor-pointer" width="28" height="14" viewBox="0 0 14 12" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 5.66218C0.591383 2.44103 3.41366 0 6.80594 0C10.1982 0 13.0205 2.44103 13.6125 5.66218C13.0211 8.88332 10.1982 11.3244 6.80594 11.3244C3.41366 11.3244 0.591383 8.88332 0 5.66218ZM6.80594 8.80783C7.64021 8.80783 8.44032 8.47641 9.03025 7.88649C9.62017 7.29656 9.95159 6.49645 9.95159 5.66218C9.95159 4.8279 9.62017 4.02779 9.03025 3.43786C8.44032 2.84794 7.64021 2.51652 6.80594 2.51652C5.97166 2.51652 5.17155 2.84794 4.58162 3.43786C3.9917 4.02779 3.66028 4.8279 3.66028 5.66218C3.66028 6.49645 3.9917 7.29656 4.58162 7.88649C5.17155 8.47641 5.97166 8.80783 6.80594 8.80783ZM6.80594 7.54957C6.30537 7.54957 5.8253 7.35072 5.47135 6.99676C5.11739 6.64281 4.91854 6.16274 4.91854 5.66218C4.91854 5.16161 5.11739 4.68154 5.47135 4.32759C5.8253 3.97363 6.30537 3.77478 6.80594 3.77478C7.3065 3.77478 7.78657 3.97363 8.14052 4.32759C8.49448 4.68154 8.69333 5.16161 8.69333 5.66218C8.69333 6.16274 8.49448 6.64281 8.14052 6.99676C7.78657 7.35072 7.3065 7.54957 6.80594 7.54957Z" fill="#696A6E" />
                          </svg>
                          <ul id="test-method-col-visibility" class="dropdown-menu col-visibility-dd-menu px-4 py-12"></ul>
                        </div>
                      </div>
                      <div class="table-responsive nemko-table-container">
                        <table class="table"><thead><tr></tr></thead><tbody><tr></tr></tbody></table>
                      </div>
                    </div>
                    <ul class="pagination nemko-pagination justify-content-start align-items-center gap-2 w-100 float-start px-4"></ul>
                  </div>
                </div>

                <!-- ── Offices Tab ── -->
                

                <!-- ── Employees Tab ── -->
                <div class="w-100 float-start db-tab-view" id="db-tab-employees" style="display: none;">
                  <div class="w-100 float-start d-flex flex-column gap-2" id="employees-table">
                    <div class="w-100 float-start px-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                      
                      <button
                        id="import-employee-btn"
                        type="button"
                        style="display:none"
                        class="nemko-btn-default nemko-btn-secondary px-3 text-base lg-text-lg import-trigger-btn"
                        data-import-type="employee">
                        Import Employee
                      </button>
                      <button type="button" id="export-employee-btn" style="display:none" class="nemko-btn-default px-3 nemko-btn-secondary text-xs export-excel-btn"
                              data-export-table="employees-table">Export To Excel</button>
                    </div>
                    <div class="w-100 float-start px-4 pt-px-12">
                      <div class="row">
                        <div class="col-12 col-sm-6">
                          <div class="nemko-filter-list d-flex gap-2 align-items-center">
                            <div class="d-flex position-relative flex-grow-1">
                              <div class="dropdown search-operator-dd">
                                <button type="button" class="text-transform-btn font-medium text-xs text-color-3"
                                        data-bs-toggle="dropdown" aria-expanded="false" data-operator="contains"><u>Ab</u></button>
                                <ul class="dropdown-menu search-operator-menu py-1">
                                  <li><a class="search-op-item d-flex align-items-center gap-2 active" data-operator="contains" data-symbol="Ab" data-symbol-type="text-full" data-table="employees-table" href="javascript:void(0)">
                                    <span class="op-symbol font-medium text-xs"><u>Ab</u></span><span>Contains</span>
                                  </a></li>
                                  <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="startswith" data-symbol="Ab" data-symbol-type="text-start" data-table="employees-table" href="javascript:void(0)">
                                    <span class="op-symbol font-medium text-xs"><u>A</u>b</span><span>Starts with</span>
                                  </a></li>
                                  <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="endswith" data-symbol="Ab" data-symbol-type="text-end" data-table="employees-table" href="javascript:void(0)">
                                    <span class="op-symbol font-medium text-xs">A<u>b</u></span><span>Ends with</span>
                                  </a></li>
                                  <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="eq" data-symbol="=" data-symbol-type="math" data-table="employees-table" href="javascript:void(0)">
                                    <span class="op-symbol op-symbol-math font-medium text-xs">=</span><span>Equal</span>
                                  </a></li>
                                  <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="neq" data-symbol="≠" data-symbol-type="math" data-table="employees-table" href="javascript:void(0)">
                                    <span class="op-symbol op-symbol-math font-medium text-xs">≠</span><span>Not equal</span>
                                  </a></li>
                                </ul>
                              </div>
                              <input type="text" placeholder="search for employee"
                                class="nemko-filter-input nemko-filter-search" data-table="employees-table" />
                            </div>
                            <button type="button"
                              class="nemko-btn-default nemko-btn-reject text-base md-text-lg flex-shrink-0 px-3 db-employee-activate-all-btn">Activate All</button>
                            
                          </div>
                        </div>
                      </div>
                    </div>
                    <ul class="pagination nemko-pagination justify-content-start align-items-center gap-2 w-100 float-start px-4"></ul>
                    <div class="w-100 float-start d-flex flex-column position-relative px-4 pt-2">
                      <div class="col-visibility-btn">
                        <div class="w-100 dropdown position-static">
                          <svg data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside"
                            class="cursor-pointer" width="28" height="14" viewBox="0 0 14 12" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 5.66218C0.591383 2.44103 3.41366 0 6.80594 0C10.1982 0 13.0205 2.44103 13.6125 5.66218C13.0211 8.88332 10.1982 11.3244 6.80594 11.3244C3.41366 11.3244 0.591383 8.88332 0 5.66218ZM6.80594 8.80783C7.64021 8.80783 8.44032 8.47641 9.03025 7.88649C9.62017 7.29656 9.95159 6.49645 9.95159 5.66218C9.95159 4.8279 9.62017 4.02779 9.03025 3.43786C8.44032 2.84794 7.64021 2.51652 6.80594 2.51652C5.97166 2.51652 5.17155 2.84794 4.58162 3.43786C3.9917 4.02779 3.66028 4.8279 3.66028 5.66218C3.66028 6.49645 3.9917 7.29656 4.58162 7.88649C5.17155 8.47641 5.97166 8.80783 6.80594 8.80783ZM6.80594 7.54957C6.30537 7.54957 5.8253 7.35072 5.47135 6.99676C5.11739 6.64281 4.91854 6.16274 4.91854 5.66218C4.91854 5.16161 5.11739 4.68154 5.47135 4.32759CE5.8253 3.97363 6.30537 3.77478 6.80594 3.77478C7.3065 3.77478 7.78657 3.97363 8.14052 4.32759C8.49448 4.68154 8.69333 5.16161 8.69333 5.66218C8.69333 6.16274 8.49448 6.64281 8.14052 6.99676C7.78657 7.35072 7.3065 7.54957 6.80594 7.54957Z" fill="#696A6E" />
                          </svg>
                          <ul id="employees-col-visibility" class="dropdown-menu col-visibility-dd-menu px-4 py-12"></ul>
                        </div>
                      </div>
                      <div class="table-responsive nemko-table-container">
                        <table class="table"><thead><tr></tr></thead><tbody><tr></tr></tbody></table>
                      </div>
                    </div>
                    <ul class="pagination nemko-pagination justify-content-start align-items-center gap-2 w-100 float-start px-4"></ul>
                  </div>
                </div>

                <!-- ── Import Tab ── -->

                 
<!-- IMPORT MODAL -->
 <div class="modal nemko-modal nemko-modal-default edit-temp-doc-modal" id="editTempDocModal" tabindex="-1" aria-labelledby="editTempDocModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fhd-text-xl-combo">Edit template document</h5>
          <button type="button" class="btn-close import-modal-close-btn" aria-label="Close"></button>
        </div>
        <div class="modal-body custom-scroll-view">
          <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <div class="form-label">file<span class="text-danger">*</span></div>
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
          <p id="import-file-error" style="color:red;display:none;width:100%;margin-bottom:8px;"></p>
          <button type="button" class="nemko-btn-default nemko-btn-save text-base md-text-lg">Upload</button>
          <button type="button" class="nemko-btn-default nemko-btn-cancel text-base md-text-lg import-modal-close-btn">Cancel</button>
        </div>
      </div>
    </div>
  </div>
<!-- INFORMATION MODAL - STANDARD -->
  <div class="modal fade nemko-modal nemko-modal-default information-modal" id="informationModalStandard" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fhd-text-xl-combo">Information</h5>
          <button type="button" class="btn-close info-modal-dismiss-btn" aria-label="Close" data-modal-id="informationModalStandard"></button>
        </div>
        <div class="modal-body custom-scroll-view">
          <div class="w-100 float-start d-flex flex-column gap-4">
            <p class="text-color-17 font-medium text-base lg-text-lg xxl-text-size-20 text-capitalize">before uploading the file, make sure its format meets the requirements. the column headers must exactly match the sample below. any deviations may result in import errors.</p>
            <div class="table-responsive w-100 float-start information-table custom-scroll-view custom-scroll-h-view">
              <table class="table table-borderless align-middle table-fixed text-center" style="min-width:2100px;">
                <thead id="info-modal-table-head-standard">
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
                    <th class="text-base md-text-lg">Q</th>
                    <th class="text-base md-text-lg">R</th>
                    <th class="text-base md-text-lg">S</th>
                  </tr>
                </thead>
                <tbody id="info-modal-table-body-standard">
                  <tr>
                    <td>ExternalID</td>
                    <td>Name</td>
                    <td>Standard Family</td>
                    <td>ICS Code</td>
                    <td>IAF</td>
                    <td>NACE</td>
                    <td>Product Category</td>
                    <td>AccreditedCategory</td>
                    <td>Link To WorkBench</td>
                    <td>Description</td>
                    <td>Service Type</td>
                    <td>Publisher</td>
                    <td>Publication Date</td>
                    <td>Start Date</td>
                    <td>Expiration Date</td>
                    <td>Replacing Standard</td>
                    <td>Scheme</td>
                    <td>Business Service</td>
                    <td>Department Responsible</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="modal-footer justify-content-end border-top-0">
          <button type="button" class="info-modal-ok-btn nemko-btn-default nemko-btn-save text-base md-text-lg" data-modal-id="informationModalStandard">Ok</button>
        </div>
      </div>
    </div>
  </div>

  <!-- INFORMATION MODAL - SCHEME -->
  <div class="modal fade nemko-modal nemko-modal-default information-modal" id="informationModalScheme" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fhd-text-xl-combo">Information</h5>
          <button type="button" class="btn-close info-modal-dismiss-btn" aria-label="Close" data-modal-id="informationModalScheme"></button>
        </div>
        <div class="modal-body custom-scroll-view">
          <div class="w-100 float-start d-flex flex-column gap-4">
            <p class="text-color-17 font-medium text-base lg-text-lg xxl-text-size-20 text-capitalize">before uploading the file, make sure its format meets the requirements. the column headers must exactly match the sample below. any deviations may result in import errors.</p>
            <div class="table-responsive w-100 float-start information-table custom-scroll-view custom-scroll-h-view">
              <table class="table table-borderless align-middle table-fixed text-center">
                <thead id="info-modal-table-head-scheme">
                  <tr>
                    <th class="text-base md-text-lg">A</th>
                    <th class="text-base md-text-lg">B</th>
                    <th class="text-base md-text-lg">C</th>

                    
                  </tr>
                </thead>
                <tbody id="info-modal-table-body-scheme">
                  <tr>
                    <td>ExternalID</td>
                    <td>Scheme Name</td>
                    <td>Reference Standard</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="modal-footer justify-content-end border-top-0">
          <button type="button" class="info-modal-ok-btn nemko-btn-default nemko-btn-save text-base md-text-lg" data-modal-id="informationModalScheme">Ok</button>
        </div>
      </div>
    </div>
  </div>

  <!-- INFORMATION MODAL - TEST METHOD -->
  <div class="modal fade nemko-modal nemko-modal-default information-modal" id="informationModalTestmethod" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fhd-text-xl-combo">Information</h5>
          <button type="button" class="btn-close info-modal-dismiss-btn" aria-label="Close" data-modal-id="informationModalTestmethod"></button>
        </div>
        <div class="modal-body custom-scroll-view">
          <div class="w-100 float-start d-flex flex-column gap-4">
            <p class="text-color-17 font-medium text-base lg-text-lg xxl-text-size-20 text-capitalize">before uploading the file, make sure its format meets the requirements. the column headers must exactly match the sample below. any deviations may result in import errors.</p>
            <div class="table-responsive w-100 float-start information-table custom-scroll-view custom-scroll-h-view">
              <table class="table table-borderless align-middle table-fixed text-center">
                <thead id="info-modal-table-head-testmethod">
                  <tr>
                    <th class="text-base md-text-lg">A</th>
                    <th class="text-base md-text-lg">B</th>
                    <th class="text-base md-text-lg">C</th>
                    <th class="text-base md-text-lg">D</th>
    
                  </tr>
                </thead>
                <tbody id="info-modal-table-body-testmethod">
                  <tr>
                    <td>ExternalID</td>
                    <td>Method Name</td>
                    <td>Reference Standard</td>
                    <td>Product Category</td>
        
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="modal-footer justify-content-end border-top-0">
          <button type="button" class="info-modal-ok-btn nemko-btn-default nemko-btn-save text-base md-text-lg" data-modal-id="informationModalTestmethod">Ok</button>
        </div>
      </div>
    </div>
  </div>

  <!-- INFORMATION MODAL - EMPLOYEE -->
  <div class="modal fade nemko-modal nemko-modal-default information-modal" id="informationModalEmployee" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fhd-text-xl-combo">Information</h5>
          <button type="button" class="btn-close info-modal-dismiss-btn" aria-label="Close" data-modal-id="informationModalEmployee"></button>
        </div>
        <div class="modal-body custom-scroll-view">
          <div class="w-100 float-start d-flex flex-column gap-4">
            <p class="text-color-17 font-medium text-base lg-text-lg xxl-text-size-20 text-capitalize">before uploading the file, make sure its format meets the requirements. the column headers must exactly match the sample below. any deviations may result in import errors.</p>
            <div class="table-responsive w-100 float-start information-table custom-scroll-view custom-scroll-h-view">
              <table class="table table-borderless align-middle table-fixed text-center">
                <thead id="info-modal-table-head-employee">
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
                <tbody id="info-modal-table-body-employee">
                  <tr>
                    <td>Full Name</td>
                    <td>Email</td>
                    <td>Personal Status</td>
                    <td>Office Name</td>
                    <td>Approval Manager Email</td>
                    <td>Direct Manager Email</td>
                    <td>Local GM Email</td>
                    <td>Quality Manager Email</td>
                    <td>HR Contact Email</td>
                    <td>Leadership Function</td>
                    <td>AdminAccess</td>
                    <td>Employee Type</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="modal-footer justify-content-end border-top-0">
          <button type="button" class="info-modal-ok-btn nemko-btn-default nemko-btn-save text-base md-text-lg" data-modal-id="informationModalEmployee">Ok</button>
        </div>
      </div>
    </div>
  </div>

                

               

              </div><!-- /db-tab-view-wrapper -->
            </div><!-- /database-table -->

          </div>
        </div>
      </div>
    </div>
  </div>

 

  <!-- ── Shared Select Modal ── -->
  <div class="modal nemko-modal nemko-modal-default" id="sharedSelectModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fhd-text-xl-combo" id="sharedModalTitle">Select</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-frm-search-top w-100 float-start">
          <div class="w-100 float-start d-flex flex-column form-control-col">
            <div class="d-flex align-items-center gap-2">
              <input type="text" class="form-control flex-grow-1 modal-search-input" id="sharedModalSearch"
                placeholder="Search" />
              <button type="button" class="frm-right-close-btn" id="sharedModalSearchClear"></button>
            </div>
          </div>
        </div>
        <div class="modal-body custom-scroll-view pt-0">
          <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm">
            <div class="w-100 float-start d-flex flex-column form-control-col checkbox-list-main" id="sharedModalList">
            </div>
          </div>
        </div>
        <div class="modal-footer gap-2 justify-content-sm-start justify-content-center">
          <button type="button" class="btn nemko-btn-default nemko-btn-save text-base md-text-lg m-0"
            id="sharedModalSave" data-bs-dismiss="modal">Save</button>
          <button type="button" class="btn nemko-btn-default nemko-btn-cancel text-base md-text-lg m-0"
            data-bs-dismiss="modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Create Standard Modal ── -->
  <div class="modal nemko-modal nemko-modal-default" id="createStandaredModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fhd-text-xl-combo">Create Standard</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body custom-scroll-view">
          <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="standardExternalId" class="form-label">External ID<span class="text-danger">*</span></label>
              <input type="text" class="form-control" id="standardExternalId" />
              <div class="invalid-feedback">External ID is required.</div>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="standaredTitle" class="form-label">Standard title<span class="text-danger">*</span></label>
              <input type="text" class="form-control" id="standaredTitle" />
              <div class="invalid-feedback">Title is required.</div>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="standardFamilyName" class="form-label">Standard family<span class="text-danger">*</span></label>
              <input type="text" class="form-control" id="standardFamilyName" />
              <div class="invalid-feedback">Standard family is required.</div>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="icsCode" class="form-label">ICS code</label>
              <input type="text" class="form-control" id="icsCode" />
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="IAF" class="form-label">IAF</label>
              <input type="text" class="form-control" id="IAF" />
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="NACE" class="form-label">NACE</label>
              <input type="text" class="form-control" id="NACE" />
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="pdctCategoryStd" class="form-label">product category</label>
              <div class="nemko-search-select position-relative">
                <input type="text" class="form-control nemko-ss-display" data-target="pdctCategoryStd" autocomplete="off" placeholder="Select a category" />
                <input type="hidden" id="pdctCategoryStd" />
                <ul class="nemko-email-suggestions list-unstyled position-absolute w-100" style="display:none;"></ul>
              </div>
            </div>

            <div class="w-100 float-start d-flex flex-column form-control-col">
              <div class="form-label-cr">accredited standard</div>
              <div class="d-flex align-items-center gap-3">
                <label class="nemko-frm-radio d-flex align-items-center gap-1">
                  <input class="form-check-input" type="radio" name="accreditedRadio">
                  <span class="radio-icon"></span>
                  <p class="form-check-label">Yes</p>
                </label>
                <label class="nemko-frm-radio d-flex align-items-center gap-1">
                  <input class="form-check-input" type="radio" name="accreditedRadio" checked>
                  <span class="radio-icon"></span>
                  <p class="form-check-label">No</p>
                </label>
              </div>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="linkToWorkBench" class="form-label">link to workbench</label>
              <input type="text" class="form-control" id="linkToWorkBench" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="nemko-btn-default nemko-btn-save text-base md-text-lg">Save</button>
          <button type="button" class="nemko-btn-default nemko-btn-cancel text-base md-text-lg" data-bs-dismiss="modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Edit Standard Modal ── -->
  <div class="modal nemko-modal nemko-modal-default" id="editStandaredModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fhd-text-xl-combo">Standard Details</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body custom-scroll-view">
          <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">
            <input type="hidden" id="editStandaredId" />
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">External ID</label>
              <input type="text" class="form-control" id="editStandaredIdReadonly" readonly/>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editStandaredTitle" class="form-label">Standard title<span class="text-danger">*</span></label>
              <input type="text" class="form-control" id="editStandaredTitle" />
              <div class="invalid-feedback">Title is required.</div>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editStandardFamilyName" class="form-label">Standard family<span class="text-danger">*</span></label>
              <input type="text" class="form-control" id="editStandardFamilyName" />
              <div class="invalid-feedback">Standard family is required.</div>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editIcsCode" class="form-label">ICS code</label>
              <input type="text" class="form-control" id="editIcsCode" />
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editIAF" class="form-label">IAF</label>
              <input type="text" class="form-control" id="editIAF" />
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editNACE" class="form-label">NACE</label>
              <input type="text" class="form-control" id="editNACE" />
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editPdctCategoryStd" class="form-label">product category</label>              
              <div class="nemko-search-select position-relative">
                <input type="text" class="form-control nemko-ss-display" data-target="editPdctCategoryStd" autocomplete="off" placeholder="Select a category" />
                <input type="hidden" id="editPdctCategoryStd" />
                <ul class="nemko-email-suggestions list-unstyled position-absolute w-100" style="display:none;"></ul>
              </div>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <div class="form-label-cr">accredited standard</div>
              <div class="d-flex align-items-center gap-3">
                <label class="nemko-frm-radio d-flex align-items-center gap-1">
                  <input class="form-check-input" type="radio" name="editAccreditedRadio">
                  <span class="radio-icon"></span>
                  <p class="form-check-label">Yes</p>
                </label>
                <label class="nemko-frm-radio d-flex align-items-center gap-1">
                  <input class="form-check-input" type="radio" name="editAccreditedRadio" checked>
                  <span class="radio-icon"></span>
                  <p class="form-check-label">No</p>
                </label>
              </div>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editLinkToWorkBench" class="form-label">link to workbench</label>
              <input type="text" class="form-control" id="editLinkToWorkBench" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="nemko-btn-default nemko-btn-save text-base md-text-lg" id="editStandaredSaveBtn">Save</button>
         <button type="button" class="nemko-btn-default nemko-btn-cancel text-base md-text-lg" data-bs-dismiss="modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Create Scheme Modal ── -->
  <div class="modal nemko-modal nemko-modal-default" id="createSchemeModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fhd-text-xl-combo">Create Scheme</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" aria-label="Close"></button>
        </div>
        <div class="modal-body custom-scroll-view">
          <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="schemeExternalId" class="form-label">External ID<span class="text-danger">*</span></label>
              <input type="text" class="form-control" id="schemeExternalId" />
              <div class="invalid-feedback">External ID is required.</div>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="schemeNameIp" class="form-label">Scheme Name<span class="text-danger">*</span></label>
              <input type="text" class="form-control" id="schemeNameIp" />
              <div class="invalid-feedback">Scheme name is required.</div>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="refStandaredTxtarea" class="form-label">reference standard</label>
              <textarea class="form-control h-px-160 custom-scroll-view" id="refStandaredTxtarea"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="nemko-btn-default nemko-btn-save text-base md-text-lg">Save</button>
          <button type="button" class="nemko-btn-default nemko-btn-cancel text-base md-text-lg"  data-bs-dismiss="modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Edit Scheme Modal ── -->
  <div class="modal nemko-modal nemko-modal-default" id="editSchemeModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fhd-text-xl-combo">Scheme Details</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body custom-scroll-view">
          <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">
            <input type="hidden" id="editSchemeId" />
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">External ID</label>
              <input type="text" class="form-control" id="editSchemeIdReadonly" readonly/>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editSchemeNameIp" class="form-label">Scheme name<span class="text-danger">*</span></label>
              <input type="text" class="form-control" id="editSchemeNameIp" />
              <div class="invalid-feedback">Scheme name is required.</div>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editRefStandaredTxtarea" class="form-label">reference standard</label>
              <textarea class="form-control h-px-160 custom-scroll-view" id="editRefStandaredTxtarea"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="nemko-btn-default nemko-btn-save text-base md-text-lg" id="editSchemeSaveBtn">Save</button>
          <button type="button" class="nemko-btn-default nemko-btn-cancel text-base md-text-lg" data-bs-dismiss="modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Create Test Method Modal ── -->
  <div class="modal nemko-modal nemko-modal-default" id="createTestmethodModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fhd-text-xl-combo">Create Test Method</h5>
          <button type="button" class="btn-close " data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body custom-scroll-view">
          <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="testMethodExternalId" class="form-label">External ID<span class="text-danger">*</span></label>
              <input type="text" class="form-control" id="testMethodExternalId" />
              <div class="invalid-feedback">External ID is required.</div>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="methodNameIp" class="form-label">method name<span class="text-danger">*</span></label>
             <input type="text" class="form-control" id="methodNameIp" />
             <div class="invalid-feedback">Method name is required.</div>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="pdctCategoryTm" class="form-label">product category</label>
              <div class="nemko-search-select position-relative">
                <input type="text" class="form-control nemko-ss-display" data-target="pdctCategoryTm" autocomplete="off" placeholder="Select a category" />
                <input type="hidden" id="pdctCategoryTm" />
                <ul class="nemko-email-suggestions list-unstyled position-absolute w-100" style="display:none;"></ul>
              </div>
            </div>

            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="refStandaredTmTxtarea" class="form-label">reference standard</label>
              <textarea class="form-control h-px-160 custom-scroll-view" id="refStandaredTmTxtarea"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="nemko-btn-default nemko-btn-save text-base md-text-lg">Save</button>
          <button type="button" class="nemko-btn-default nemko-btn-cancel text-base md-text-lg" data-bs-dismiss="modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Edit Test Method Modal ── -->
  <div class="modal nemko-modal nemko-modal-default" id="editTestmethodModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fhd-text-xl-combo">Test Method Details</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body custom-scroll-view">
          <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">
            <input type="hidden" id="editTestmethodId" />
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label class="form-label font-semibold">External ID</label>
              <input type="text" class="form-control" id="editTestmethodIdReadonly" readonly/>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editMethodNameIp" class="form-label">method name<span class="text-danger">*</span></label>
              <input type="text" class="form-control" id="editMethodNameIp" />
              <div class="invalid-feedback">Method name is required.</div>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editPdctCategoryTm" class="form-label">product category</label>
              <div class="nemko-search-select position-relative">
                <input type="text" class="form-control nemko-ss-display" data-target="editPdctCategoryTm" autocomplete="off" placeholder="Select a category" />
                <input type="hidden" id="editPdctCategoryTm" />
                <ul class="nemko-email-suggestions list-unstyled position-absolute w-100" style="display:none;"></ul>
              </div>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editRefStandaredTmTxtarea" class="form-label">reference standard</label>
              <textarea class="form-control h-px-160 custom-scroll-view" id="editRefStandaredTmTxtarea"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="nemko-btn-default nemko-btn-save text-base md-text-lg" id="editTestmethodSaveBtn">Save</button>
          <button type="button" class="nemko-btn-default nemko-btn-cancel text-base md-text-lg" data-bs-dismiss="modal">Cancel</button>
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
                <div class="col-12 col-sm-6 col-md-6">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Requested by</label>
                    <input type="text" class="form-control" id="detailsRequestedBy" readonly />
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-6">
                  <div class="w-100 float-start d-flex flex-column form-control-col">
                    <label class="form-label font-semibold">Email address</label>
                    <input type="email" class="form-control" id="detailsReqEmail" readonly />
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
                    <label class="form-label font-semibold">Qualification ID</label>
                    <input type="text" class="form-control" id="detailsQualificationId" readonly />
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
              </div>


              <div class="w-100 float-start d-flex frm-readonly-row py-1">
                <div class="w-100 float-start d-flex flex-column form-control-col">
                  <label class="form-label font-semibold">Active Qualification</label>
                  <p class="frm-readonly-val" id="detailsActiveQualification">-</p>
                </div>
              </div>

              <div class="w-100 float-start d-flex frm-readonly-row py-1">
                <div class="w-100 float-start d-flex flex-column form-control-col">
                  <label class="form-label font-semibold">remarks</label>
                  <p class="frm-readonly-val" id="detailsRemarks">-</p>
                </div>
              </div>

              <div class="w-100 float-start d-flex flex-column form-control-col">
                <label class="form-label font-semibold">limitations</label>
                <textarea class="form-control h-px-98 custom-scroll-view" id="detailsLimitationsTxtarea" readonly></textarea>
              </div>

              <div class="w-100 float-start d-flex frm-readonly-row py-1">
                <div class="w-100 float-start d-flex flex-column form-control-col">
                  <label class="form-label font-semibold">qualified date</label>
                  <p class="frm-readonly-val" id="detailsQualifiedDateReadonly">-</p>
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
        <button type="button" id="qd-withdraw-btn" class="btn btn-danger nemko-btn-default nemko-btn-withdraw text-base md-text-lg" style="display:none;">Withdraw</button>
        <button type="button" class="btn nemko-btn-default nemko-btn-cancel text-base md-text-lg m-0" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>


<!-- ── EMPLOYEE DETAILS MODAL ── -->
<div class="modal fade nemko-modal nemko-modal-default emp-details-modal" id="empDetailsModal" tabindex="-1"
    aria-labelledby="empDetailsModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fhd-text-xl-combo">Employees Overview</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body custom-scroll-view">
          <div class="w-100 float-start d-flex flex-column gap-4">
            <p id="empDetailsName" class="text-color-17 font-bold text-base lg-text-lg xxl-text-size-20 text-capitalize mb-0"></p>
            <div id="emp-details-table"
              class="nemko-data-table-wrapper nemko-data-table-emp-details w-100 float-start">
              <div class="w-100 float-start nemko-filter-list">
                <div class="d-flex position-relative">
                  <div class="dropdown search-operator-dd">
                    <button type="button" class="text-transform-btn font-medium text-xs text-color-3"
                            data-bs-toggle="dropdown" aria-expanded="false" data-operator="contains"><u>Ab</u></button>
                    <ul class="dropdown-menu search-operator-menu py-1">
                      <li><a class="search-op-item d-flex align-items-center gap-2 active" data-operator="contains" data-symbol="Ab" data-symbol-type="text-full" data-table="emp-details-table" href="javascript:void(0)">
                        <span class="op-symbol font-medium text-xs"><u>Ab</u></span><span>Contains</span>
                      </a></li>
                      <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="startswith" data-symbol="Ab" data-symbol-type="text-start" data-table="emp-details-table" href="javascript:void(0)">
                        <span class="op-symbol font-medium text-xs"><u>A</u>b</span><span>Starts with</span>
                      </a></li>
                      <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="endswith" data-symbol="Ab" data-symbol-type="text-end" data-table="emp-details-table" href="javascript:void(0)">
                        <span class="op-symbol font-medium text-xs">A<u>b</u></span><span>Ends with</span>
                      </a></li>
                      <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="eq" data-symbol="=" data-symbol-type="math" data-table="emp-details-table" href="javascript:void(0)">
                        <span class="op-symbol op-symbol-math font-medium text-xs">=</span><span>Equal</span>
                      </a></li>
                      <li><a class="search-op-item d-flex align-items-center gap-2" data-operator="neq" data-symbol="≠" data-symbol-type="math" data-table="emp-details-table" href="javascript:void(0)">
                        <span class="op-symbol op-symbol-math font-medium text-xs">≠</span><span>Not equal</span>
                      </a></li>
                    </ul>
                  </div>
                  <input type="text" placeholder="Search here..." class="nemko-filter-input nemko-filter-search" data-table="emp-details-table">
                </div>
              </div>
              <ul class="pagination nemko-pagination justify-content-start align-items-center gap-2 w-100 float-start px-4"></ul>
              <div class="w-100 float-start d-flex flex-column position-relative pt-2">
                <div class="col-visibility-btn">
                  <div class="w-100 dropdown position-static">
                    <svg data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside"
                      class="cursor-pointer" width="28" height="14" viewBox="0 0 14 12" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M0 5.66218C0.591383 2.44103 3.41366 0 6.80594 0C10.1982 0 13.0205 2.44103 13.6125 5.66218C13.0211 8.88332 10.1982 11.3244 6.80594 11.3244C3.41366 11.3244 0.591383 8.88332 0 5.66218ZM6.80594 8.80783C7.64021 8.80783 8.44032 8.47641 9.03025 7.88649C9.62017 7.29656 9.95159 6.49645 9.95159 5.66218C9.95159 4.8279 9.62017 4.02779 9.03025 3.43786C8.44032 2.84794 7.64021 2.51652 6.80594 2.51652C5.97166 2.51652 5.17155 2.84794 4.58162 3.43786C3.9917 4.02779 3.66028 4.8279 3.66028 5.66218C3.66028 6.49645 3.9917 7.29656 4.58162 7.88649C5.17155 8.47641 5.97166 8.80783 6.80594 8.80783ZM6.80594 7.54957C6.30537 7.54957 5.8253 7.35072 5.47135 6.99676C5.11739 6.64281 4.91854 6.16274 4.91854 5.66218C4.91854 5.16161 5.11739 4.68154 5.47135 4.32759C5.8253 3.97363 6.30537 3.77478 6.80594 3.77478C7.3065 3.77478 7.78657 3.97363 8.14052 4.32759C8.49448 4.68154 8.69333 5.16161 8.69333 5.66218C8.69333 6.16274 8.49448 6.64281 8.14052 6.99676C7.78657 7.35072 7.3065 7.54957 6.80594 7.54957Z"
                        fill="#696A6E" />
                    </svg>
                    <ul id="emp-details-col-visibility" class="dropdown-menu col-visibility-dd-menu px-4 py-12"></ul>
                  </div>
                </div>
                <div class="table-responsive nemko-table-container emp-details-table">
                  <table class="table">
                    <thead><tr></tr></thead>
                    <tbody><tr></tr></tbody>
                  </table>
                </div>
              </div>
              <ul class="pagination nemko-pagination justify-content-start align-items-center gap-2 w-100 float-start px-4"></ul>
            </div>
          </div>
        </div>
        <div class="modal-footer justify-content-end border-top-0">
          <button type="button" class="nemko-btn-default nemko-btn-save text-base md-text-lg"
            data-bs-dismiss="modal">Ok</button>
        </div>
      </div>
    </div>
  </div>

    `
}
