export default class AdminOverride {

    public static allElementsHtml: string = `

<div class="sidebar-overlay" id="sidebarOverlay"></div>

  <div class="main-wrapper min-h-screen-container has-nemko-sidebar">
    <div class="w-100 float-start">
      <div class="container container-nemko px-3 px-lg-4 clearfix py-3">
        <div class="w-100 float-start nemko-inner-page-wrapper py-5 ps-xl-4">

          <h2 class="inner-page-main-title font-bold mb-3" style="font-size: 2.8rem;">Admin Override</h2>

          <div id="adminOverrideToolbar" class="w-100 float-start d-flex justify-content-between align-items-center mb-3 gap-3 flex-wrap">
            <div class="d-flex gap-2"></div>
            <button data-bs-toggle="modal" data-bs-target="#addEmployeeModal" type="button" class="btn nemko-btn-default px-3 nemko-btn-primary text-base md-text-lg">Add Employee</button>
          </div>

          <!-- ── ADMIN OVERRIDE TABLE ── -->
          <div id="admin-override-table" style="display:block;"
            class="nemko-data-table-wrapper nemko-data-table-qualification w-100 float-start">
            <div class="nemko-table-top-filter-wrapper w-100 float-start px-4 pt-4 pb-2">
              <div class="nemko-filter-list d-flex flex-column gap-1">
                <label class="font-medium text-sm text-color-3">Search</label>
                <input type="text" placeholder="Search here..." class="nemko-filter-input nemko-filter-search" />
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
                  <ul id="admin-override-col-visibility" class="dropdown-menu col-visibility-dd-menu px-4 py-12"></ul>
                </div>
              </div>
              <div class="table-responsive nemko-table-container admin-override-table-el">
                <table class="table">
                  <thead><tr></tr></thead>
                  <tbody>
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


  <!-- ── ADD EMPLOYEE MODAL ── -->
  <div class="modal nemko-modal nemko-modal-default add-qualification-modal" id="addEmployeeModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fhd-text-xl-combo">Add Employee</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body custom-scroll-view">
          <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">

            <!-- Employee (single-select search) -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="overrideEmployeeIp" class="form-label font-semibold">Employee <span class="text-danger">*</span></label>
              <div class="d-flex align-items-center gap-2">
                <input type="text" class="form-control flex-grow-1" id="overrideEmployeeIp" data-emp-id="" readonly />
                <button type="button" class="frm-right-arrow-btn select-employee-modal-btn"></button>
                <button type="button" class="frm-right-close-btn"></button>
              </div>
              <div class="invalid-feedback">Employee is required.</div>
            </div>

            <!-- Office (multi-select search, "All" included) -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="overrideOfficeIp" class="form-label font-semibold">Office <span class="text-danger">*</span></label>
              <div class="d-flex align-items-center gap-2">
                <input type="text" class="form-control flex-grow-1" id="overrideOfficeIp" data-office-ids="" readonly />
                <button type="button" class="frm-right-arrow-btn select-office-modal-btn"></button>
                <button type="button" class="frm-right-close-btn"></button>
              </div>
              <div class="invalid-feedback">Office is required.</div>
            </div>

            <!-- Qualification Type -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="overrideQualificationTypeList" class="form-label font-semibold">Qualification Type <span class="text-danger">*</span></label>
              <select class="form-select" id="overrideQualificationTypeList">
                <option value="" disabled selected>Select type</option>
              </select>
              <div class="invalid-feedback">Qualification type is required.</div>
            </div>

            <!-- Qualification Reference (multi-select search, "All" included) -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="overrideReferenceIp" class="form-label font-semibold" id="overrideReferenceFieldLabel">Qualification Reference <span class="text-danger">*</span></label>
              <div class="d-flex align-items-center gap-2">
                <input type="text" class="form-control flex-grow-1" id="overrideReferenceIp" data-ref-ids="" readonly />
                <button type="button" class="frm-right-arrow-btn select-reference-modal-btn"></button>
                <button type="button" class="frm-right-close-btn"></button>
              </div>
              <div class="invalid-feedback">Qualification reference is required.</div>
            </div>

            <!-- Qualification Level(s) — inline multi-select checkboxes -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <div class="form-label-cr font-semibold">Qualification Level(s) <span class="text-danger">*</span></div>
              <div class="w-100 float-start d-flex flex-column form-control-col checkbox-list-main" id="overrideLevelCheckboxes">
              </div>
              <div class="invalid-feedback" id="overrideLevelError" style="display:none;">At least one qualification level is required.</div>
            </div>

            <!-- Role — inline multi-select checkboxes -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <div class="form-label-cr font-semibold">Role <span class="text-danger">*</span></div>
              <div class="w-100 float-start d-flex flex-column form-control-col checkbox-list-main">
                <label class="nemko-frm-chkbox d-flex align-items-center gap-2">
                  <input class="form-check-input" type="checkbox" value="verifier" name="overrideRole">
                  <span class="chkbox-icon"></span>
                  <p class="form-check-label">Verifier</p>
                </label>
                <label class="nemko-frm-chkbox d-flex align-items-center gap-2">
                  <input class="form-check-input" type="checkbox" value="authorizer" name="overrideRole">
                  <span class="chkbox-icon"></span>
                  <p class="form-check-label">Authorizer</p>
                </label>
              </div>
              <div class="invalid-feedback" id="overrideRoleError" style="display:none;">At least one role is required.</div>
            </div>

            <!-- Status — inline single-select radio -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <div class="form-label-cr font-semibold">Status <span class="text-danger">*</span></div>
              <div class="d-flex flex-column gap-2 align-items-start">
                <label class="nemko-frm-radio d-flex align-items-center gap-2">
                  <input class="form-check-input" type="radio" name="overrideStatus" value="active" checked>
                  <span class="radio-icon radio-icon-lg"></span>
                  <p class="form-check-label">Active</p>
                </label>
                <label class="nemko-frm-radio d-flex align-items-center gap-2">
                  <input class="form-check-input" type="radio" name="overrideStatus" value="inactive">
                  <span class="radio-icon radio-icon-lg"></span>
                  <p class="form-check-label">Inactive</p>
                </label>
              </div>
            </div>

          </div>
        </div>
        <div class="modal-footer gap-2 justify-content-sm-start justify-content-center">
          <button type="button" class="btn nemko-btn-default nemko-btn-save text-base md-text-lg m-0" id="submitAdminOverrideBtn">Submit</button>
          <button type="button" class="btn nemko-btn-default nemko-btn-cancel text-base md-text-lg m-0" data-bs-dismiss="modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ── EDIT EMPLOYEE MODAL ── -->
  <div class="modal nemko-modal nemko-modal-default add-qualification-modal qualification-edit-modal" id="editEmployeeModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fhd-text-xl-combo">Edit Employee</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body custom-scroll-view">

          <div id="editEmployeeModalLoading" class="text-center py-4 text-color-3 text-sm font-medium" style="display:none;">Loading...</div>
          <div id="editEmployeeModalError"   class="text-center py-4 text-sm font-medium" style="display:none;">Failed to load record.</div>

          <div id="editEmployeeModalContent" class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">

            <!-- Employee — disabled on edit -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editOverrideEmployeeIp" class="form-label font-semibold">Employee</label>
              <input type="text" class="form-control flex-grow-1" id="editOverrideEmployeeIp" data-emp-id="" disabled />
            </div>

            <!-- Office -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editOverrideOfficeIp" class="form-label font-semibold">Office <span class="text-danger">*</span></label>
              <div class="d-flex align-items-center gap-2">
                <input type="text" class="form-control flex-grow-1" id="editOverrideOfficeIp" data-office-ids="" readonly />
                <button type="button" class="frm-right-arrow-btn select-office-modal-btn"></button>
                <button type="button" class="frm-right-close-btn"></button>
              </div>
            </div>

            <!-- Qualification Type -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editOverrideQualificationTypeList" class="form-label font-semibold">Qualification Type <span class="text-danger">*</span></label>
              <select class="form-select" id="editOverrideQualificationTypeList">
                <option value="" disabled selected>Select type</option>
              </select>
            </div>

            <!-- Qualification Reference -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editOverrideReferenceIp" class="form-label font-semibold" id="editOverrideReferenceFieldLabel">Qualification Reference <span class="text-danger">*</span></label>
              <div class="d-flex align-items-center gap-2">
                <input type="text" class="form-control flex-grow-1" id="editOverrideReferenceIp" data-ref-ids="" readonly />
                <button type="button" class="frm-right-arrow-btn select-reference-modal-btn"></button>
                <button type="button" class="frm-right-close-btn"></button>
              </div>
            </div>

            <!-- Qualification Level(s) -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <div class="form-label-cr font-semibold">Qualification Level(s) <span class="text-danger">*</span></div>
              <div class="w-100 float-start d-flex flex-column form-control-col checkbox-list-main" id="editOverrideLevelCheckboxes">
              </div>
            </div>

            <!-- Role -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <div class="form-label-cr font-semibold">Role <span class="text-danger">*</span></div>
              <div class="w-100 float-start d-flex flex-column form-control-col checkbox-list-main">
                <label class="nemko-frm-chkbox d-flex align-items-center gap-2">
                  <input class="form-check-input" type="checkbox" value="verifier" name="editOverrideRole">
                  <span class="chkbox-icon"></span>
                  <p class="form-check-label">Verifier</p>
                </label>
                <label class="nemko-frm-chkbox d-flex align-items-center gap-2">
                  <input class="form-check-input" type="checkbox" value="authorizer" name="editOverrideRole">
                  <span class="chkbox-icon"></span>
                  <p class="form-check-label">Authorizer</p>
                </label>
              </div>
            </div>

            <!-- Status -->
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <div class="form-label-cr font-semibold">Status <span class="text-danger">*</span></div>
              <div class="d-flex flex-column gap-2 align-items-start">
                <label class="nemko-frm-radio d-flex align-items-center gap-2">
                  <input class="form-check-input" type="radio" name="editOverrideStatus" value="active">
                  <span class="radio-icon radio-icon-lg"></span>
                  <p class="form-check-label">Active</p>
                </label>
                <label class="nemko-frm-radio d-flex align-items-center gap-2">
                  <input class="form-check-input" type="radio" name="editOverrideStatus" value="inactive">
                  <span class="radio-icon radio-icon-lg"></span>
                  <p class="form-check-label">Inactive</p>
                </label>
              </div>
            </div>

          </div>
        </div>
        <div class="modal-footer gap-2 justify-content-sm-start justify-content-center">
          <button type="button" class="btn nemko-btn-default nemko-btn-save text-base md-text-lg m-0" id="updateAdminOverrideBtn">Update</button>
          <button type="button" class="btn nemko-btn-default nemko-btn-cancel text-base md-text-lg m-0" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-danger nemko-btn-default nemko-btn-delete text-base md-text-lg m-0 ms-auto">Delete</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ── SELECT EMPLOYEE MODAL (single-select) ── -->
  <div class="modal nemko-modal nemko-modal-default standared-select-modal" id="selectEmployeeModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fhd-text-xl-combo">Select Employee</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-frm-search-top w-100 float-start">
          <div class="w-100 float-start d-flex flex-column form-control-col">
            <div class="d-flex align-items-center gap-2">
              <input type="text" class="form-control flex-grow-1 modal-search-input" id="selectEmployeeSearch" placeholder="Search" />
              <button type="button" class="frm-right-close-btn"></button>
            </div>
          </div>
        </div>
        <div class="modal-body custom-scroll-view pt-0">
          <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm">
            <div class="w-100 float-start d-flex flex-column form-control-col checkbox-list-main" id="employeeSelectList">
              <div class="text-center py-3 text-color-3 text-sm">Loading...</div>
            </div>
          </div>
        </div>
        <div class="modal-footer gap-2 justify-content-sm-start justify-content-center">
          <button type="button" class="btn nemko-btn-default nemko-btn-save text-base md-text-lg m-0" id="employeeSelectSaveBtn">Save</button>
          <button type="button" class="btn nemko-btn-default nemko-btn-cancel text-base md-text-lg m-0" data-bs-dismiss="modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ── SELECT OFFICE MODAL (single-select, "All" included) ── -->
  <div class="modal nemko-modal nemko-modal-default standared-select-modal" id="selectOfficeModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fhd-text-xl-combo">Select Office</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-frm-search-top w-100 float-start">
          <div class="w-100 float-start d-flex flex-column form-control-col">
            <div class="d-flex align-items-center gap-2">
              <input type="text" class="form-control flex-grow-1 modal-search-input" id="selectOfficeSearch" placeholder="Search" />
              <button type="button" class="frm-right-close-btn"></button>
            </div>
          </div>
        </div>
        <div class="modal-body custom-scroll-view pt-0">
          <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm">
            <div class="w-100 float-start d-flex flex-column form-control-col checkbox-list-main" id="officeSelectList">
              <div class="text-center py-3 text-color-3 text-sm">Loading...</div>
            </div>
          </div>
        </div>
        <div class="modal-footer gap-2 justify-content-sm-start justify-content-center">
          <button type="button" class="btn nemko-btn-default nemko-btn-save text-base md-text-lg m-0" id="officeSelectSaveBtn">Save</button>
          <button type="button" class="btn nemko-btn-default nemko-btn-cancel text-base md-text-lg m-0" data-bs-dismiss="modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ── SELECT QUALIFICATION REFERENCE MODAL (multi-select checkbox, "All" included) ── -->
  <div class="modal nemko-modal nemko-modal-default standared-select-modal" id="selectReferenceModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fhd-text-xl-combo" id="selectReferenceModalTitle">Select Qualification Reference</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-frm-search-top w-100 float-start">
          <div class="w-100 float-start d-flex flex-column form-control-col">
            <div class="d-flex align-items-center gap-2">
              <input type="text" class="form-control flex-grow-1 modal-search-input" id="selectReferenceSearch" placeholder="Search" />
              <button type="button" class="frm-right-close-btn"></button>
            </div>
          </div>
        </div>
        <div class="modal-body custom-scroll-view pt-0">
          <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm">
            <div class="w-100 float-start d-flex flex-column form-control-col checkbox-list-main" id="referenceSelectList">
              <div class="text-center py-3 text-color-3 text-sm">Loading...</div>
            </div>
          </div>
        </div>
        <div class="modal-footer gap-2 justify-content-sm-start justify-content-center">
          <button type="button" class="btn nemko-btn-default nemko-btn-save text-base md-text-lg m-0" id="referenceSelectSaveBtn">Save</button>
          <button type="button" class="btn nemko-btn-default nemko-btn-cancel text-base md-text-lg m-0" data-bs-dismiss="modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>

    `
}
