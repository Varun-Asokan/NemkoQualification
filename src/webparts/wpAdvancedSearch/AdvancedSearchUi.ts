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
            <div class="w-100 float-start d-flex justify-content-between align-items-center gap-4 flex-wrap px-4 py-4">
              <div class="d-flex gap-3 gap-lg-4 flex-grow-1 min-w-0">
                <button data-tab-id="advanced-search-table" type="button"
                  class="nemko-btn-default nemko-tab-btn nemko-tab-btn-active px-2 px-sm-3 text-base">advanced
                  search</button>
                <button data-tab-id="database-table" type="button"
                  class="nemko-btn-default nemko-tab-btn px-2 px-sm-3 text-base">database</button>
              </div>
              <button type="button"
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
                            <input type="text" class="form-control flex-grow-1" id="f-standard">
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
                            <input type="text" class="form-control flex-grow-1" id="f-scheme">
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
                            <input type="text" class="form-control flex-grow-1" id="f-testmethod">
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
                            <input type="text" class="form-control flex-grow-1" id="f-employee">
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
                            <input type="text" class="form-control flex-grow-1" id="f-office">
                            <button type="button" class="frm-right-arrow-btn field-select-btn" data-bs-toggle="modal"
                              data-bs-target="#sharedSelectModal" data-field="office"></button>
                            <button type="button" class="frm-right-close-btn field-clear-btn" data-field="office"></button>
                          </div>
                        </div>
                      </div>
                      <div class="col-12 col-sm-6 col-md-4">
                        <div class="d-flex gap-2">
                          <div class="flex-shrink-0 float-start d-flex flex-column form-control-col min-w-120">
                            <label for="" class="form-label">Status</label>
                            <select class="form-select" id="">
                              <option>All</option>
                              <option>Active</option>
                              <option>Inactive</option>
                            </select>
                          </div>
                          <div class="flex-grow-1 min-w-0 float-start d-flex flex-column form-control-col">
                            <label for="" class="form-label">level</label>
                            <select class="form-select" id="">
                              <option>All</option>
                              <option>Employee</option>
                              <option>Test Associate</option>
                              <option>Project Handle</option>
                              <option>Verifier</option>
                              <option>Verifier Assessor</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="row gy-4">
                      <div class="col-12 col-sm-4 col-md-4">
                        <div class="w-100 float-start" id="conformity_statement" style="display: none;">
                          <div class="w-100 float-start d-flex flex-column form-control-col">
                            <label for="" class="form-label">conformity Statement</label>
                            <select class="form-select" id="">
                              <option>Yes</option>
                              <option>No</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div class="col-12 col-sm-8 col-md-6 col-xxl-4">
                        <div class="d-flex gap-2 flex-wrap">
                          <div class="flex-bs-1" id="report_approver" style="display: none;">
                            <div class="w-100 float-start d-flex flex-column form-control-col">
                              <label for="" class="form-label text-nowrap">Report Approver</label>
                              <select class="form-select" id="">
                                <option>Yes</option>
                                <option>No</option>
                              </select>
                            </div>
                          </div>
                          <div class="flex-bs-1" id="certificate_decision" style="display: none;">
                            <div class="w-100 float-start d-flex flex-column form-control-col">
                              <label for="" class="form-label text-nowrap">Certification Decision</label>
                              <select class="form-select" id="">
                                <option>Yes</option>
                                <option>No</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="d-flex gap-2 flex-shrink-0 mt-xxl-3 pt-xxl-1">
                    <button type="button"
                      class="btn nemko-btn-default nemko-btn-save text-xs m-0">Search</button>
                    <button type="button"
                      class="btn nemko-btn-default nemko-btn-cancel text-xs m-0">Reset All</button>
                  </div>
                </div>
              </div>

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
                    <tbody><tr></tr></tbody>
                  </table>
                </div>
              </div>

              <!-- Advanced Search pagination -->
              <ul class="pagination nemko-pagination justify-content-end align-items-center gap-2 w-100 float-start px-4"></ul>
            </div>

            <!-- ── DATABASE TAB ── -->
            <div id="database-table"
              class="nemko-data-table-wrapper nemko-data-table-qualification w-100 float-start" style="display: none;">

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
                    <div class="w-100 float-start px-4">
                      <button type="button" data-bs-toggle="modal" data-bs-target="#createStandaredModal"
                        class="nemko-btn-default nemko-btn-save text-base md-text-lg m-0 px-3 text-capitalize btn-lg-content">New Standard</button>
                      <button
                        id="import-standard-btn"
                        type="button"
                        class="nemko-btn-default nemko-btn-secondary px-3 text-base lg-text-lg import-trigger-btn">
                        Import Standard
                      </button>
                    </div>
                    <div class="w-100 float-start px-4 pt-px-12">
                      <div class="row">
                        <div class="col-12 col-sm-6 col-xl-4 col-xxl-3">
                          <div class="nemko-filter-list d-flex flex-column gap-1">
                            <label class="font-medium text-sm text-color-3">title search</label>
                            <div class="d-flex position-relative">
                              <button type="button" class="text-transform-btn font-medium text-xs text-color-3">Ab</button>
                              <input type="text" placeholder="search for title or category"
                                class="nemko-filter-input nemko-filter-search" data-table="standared-table" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
                    <ul class="pagination nemko-pagination justify-content-end align-items-center gap-2 w-100 float-start px-4"></ul>
                  </div>
                </div>

                <!-- ── Schemes Tab ── -->
                <div class="w-100 float-start db-tab-view" id="db-tab-schemes" style="display: none;">
                  <div class="w-100 float-start d-flex flex-column gap-2" id="schemes-table">
                    <div class="w-100 float-start px-4">
                      <button type="button" data-bs-toggle="modal" data-bs-target="#createSchemeModal"
                        class="nemko-btn-default nemko-btn-save text-base md-text-lg m-0 px-3 text-capitalize btn-lg-content">New Scheme</button>
                      <button
                        id="import-scheme-btn"
                        type="button"
                        class="nemko-btn-default nemko-btn-secondary px-3 text-base lg-text-lg import-trigger-btn">
                        Import Scheme
                      </button>
                    </div>
                    <div class="w-100 float-start px-4 pt-px-12">
                      <div class="row">
                        <div class="col-12 col-sm-6 col-xl-4 col-xxl-3">
                          <div class="nemko-filter-list d-flex flex-column gap-1">
                            <label class="font-medium text-sm text-color-3">search</label>
                            <div class="d-flex position-relative">
                              <button type="button" class="text-transform-btn font-medium text-xs text-color-3">Ab</button>
                              <input type="text" placeholder="search for title or category"
                                class="nemko-filter-input nemko-filter-search" data-table="schemes-table" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
                    <ul class="pagination nemko-pagination justify-content-end align-items-center gap-2 w-100 float-start px-4"></ul>
                  </div>
                </div>

                <!-- ── Test Method Tab ── -->
                <div class="w-100 float-start db-tab-view" id="db-tab-test-method" style="display: none;">
                  <div class="w-100 float-start d-flex flex-column gap-2" id="test-method-table">
                    <div class="w-100 float-start px-4">
                      <button type="button" data-bs-toggle="modal" data-bs-target="#createTestmethodModal"
                        class="nemko-btn-default nemko-btn-save text-base md-text-lg m-0 px-3 text-capitalize btn-lg-content">New Test Method</button>
                        <button
                          id="import-test-method-btn"
                          type="button"
                          class="nemko-btn-default nemko-btn-secondary px-3 text-base lg-text-lg import-trigger-btn">
                          Import Test Method
                        </button>
                    </div>
                    <div class="w-100 float-start px-4 pt-px-12">
                      <div class="row">
                        <div class="col-12 col-sm-6 col-xl-4 col-xxl-3">
                          <div class="nemko-filter-list d-flex flex-column gap-1">
                            <label class="font-medium text-sm text-color-3">title search</label>
                            <div class="d-flex position-relative">
                              <button type="button" class="text-transform-btn font-medium text-xs text-color-3">Ab</button>
                              <input type="text" placeholder="search for title"
                                class="nemko-filter-input nemko-filter-search" data-table="test-method-table" />
                            </div>
                          </div>
                        </div>
                        <div class="col-12 col-sm-6 col-xl-4 col-xxl-3">
                          <div class="nemko-filter-list d-flex flex-column gap-1">
                            <label class="font-medium text-sm text-color-3">category search</label>
                            <select class="nemko-filter-input bg-white" data-table="test-method-table" data-filter-key="pdctCategory">
                              <option value="">All</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
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
                    <ul class="pagination nemko-pagination justify-content-end align-items-center gap-2 w-100 float-start px-4"></ul>
                  </div>
                </div>

                <!-- ── Offices Tab ── -->
                

                <!-- ── Employees Tab ── -->
                <div class="w-100 float-start db-tab-view" id="db-tab-employees" style="display: none;">
                  <div class="w-100 float-start d-flex flex-column gap-2" id="employees-table">
                    <div class="w-100 float-start px-4 pt-px-12">
                      <div class="row">
                        <div class="col-12 col-sm-6">
                          <div class="nemko-filter-list d-flex gap-2 align-items-center">
                            <div class="d-flex position-relative flex-grow-1 overflow-hidden">
                              <button type="button" class="text-transform-btn font-medium text-xs text-color-3">Ab</button>
                              <input type="text" placeholder="search for employee or location"
                                class="nemko-filter-input nemko-filter-search" data-table="employees-table" />
                            </div>
                            <button type="button"
                              class="nemko-btn-default nemko-btn-reject text-base md-text-lg flex-shrink-0 px-3 db-employee-toggle-btn">Active All</button>
                          </div>
                        </div>
                      </div>
                    </div>
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
                    <ul class="pagination nemko-pagination justify-content-end align-items-center gap-2 w-100 float-start px-4"></ul>
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
          <button type="button" class="nemko-btn-default nemko-btn-cancel text-base md-text-lg import-modal-close-btn">Cancel</button>
        </div>
      </div>
    </div>
  </div>
<!-- INFORMATION MODAL -->


  <div class="modal fade nemko-modal nemko-modal-default information-modal" id="informationModal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false" aria-labelledby="informationModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fhd-text-xl-combo">Information</h5>
          <button type="button" class="btn-close info-modal-dismiss-btn" aria-label="Close"></button>
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
          <button type="button" id="info-modal-ok-btn"  class="nemko-btn-default nemko-btn-save text-base md-text-lg" data-bs-dismiss="modal">Ok</button>
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
            id="sharedModalSave">Save</button>
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
              <label for="standaredTitle" class="form-label">Standard title</label>
              <input type="text" class="form-control" id="standaredTitle" />
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
              <select class="form-select" id="pdctCategoryStd">
                <option value="" selected disabled>Select a category</option>
              </select>
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
          <h5 class="modal-title fhd-text-xl-combo">Edit Standard</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body custom-scroll-view">
          <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">
            <input type="hidden" id="editStandaredId" />
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editStandaredTitle" class="form-label">Standard title</label>
              <input type="text" class="form-control" id="editStandaredTitle" />
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
              <select class="form-select" id="editPdctCategoryStd">
                <option value="" disabled>Select a category</option>
              </select>
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
              <label for="schemeNameIp" class="form-label">Scheme name</label>
              <input type="text" class="form-control" id="schemeNameIp" />
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
          <h5 class="modal-title fhd-text-xl-combo">Edit Scheme</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body custom-scroll-view">
          <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">
            <input type="hidden" id="editSchemeId" />
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editSchemeNameIp" class="form-label">Scheme name</label>
              <input type="text" class="form-control" id="editSchemeNameIp" />
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
              <label for="methodNameIp" class="form-label">method name</label>
              <input type="text" class="form-control" id="methodNameIp" />
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="pdctCategoryScheme" class="form-label">product category</label>
              <select class="form-select" id="pdctCategoryTm">
                <option value="" selected disabled>Select a category</option>
              </select>
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
          <h5 class="modal-title fhd-text-xl-combo">Edit Test Method</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body custom-scroll-view">
          <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">
            <input type="hidden" id="editTestmethodId" />
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editMethodNameIp" class="form-label">method name</label>
              <input type="text" class="form-control" id="editMethodNameIp" />
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editPdctCategoryTm" class="form-label">product category</label>
              <select class="form-select" id="editPdctCategoryTm">
                <option value="" disabled>Select a category</option>
              </select>
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
