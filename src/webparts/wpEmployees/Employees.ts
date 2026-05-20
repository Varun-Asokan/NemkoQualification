export default class employees {
  public static allElementsHtml: string = `

    <div class="sidebar-overlay" id="sidebarOverlay"></div>
    
    <div class="main-wrapper min-h-screen-container has-nemko-sidebar">
    <div class="w-100 float-start">
      <div class="container container-nemko px-3 px-lg-4 clearfix py-3">
        <div class="w-100 float-start nemko-inner-page-wrapper py-4 ps-xl-4">
          <h2 class="w-100 float-start fhd-text-size-48-combo text-color-9 font-medium text-capitalize m-0 mb-4">
            employees</h2>
          <div class="nemko-data-table-wrapper w-100 float-start pt-4">
            <div id="employees-table" class="w-100 float-start">
              <div
                class="w-100 float-start px-4 d-flex flex-column flex-lg-row justify-content-between align-items-center gap-3 gap-xl-4 pt-3 pb-2">
                <div class="nemko-table-top-filter-wrapper w-100 float-start">
                  <div class="nemko-filter-list d-flex flex-column gap-1">
                    <label class="font-medium text-sm text-color-3">Full name</label>
                    <input type="text" class="nemko-filter-input" />
                  </div>
                  <div class="nemko-filter-list d-flex flex-column gap-1">
                    <label class="font-medium text-sm text-color-3">quality manager</label>
                    <input type="text" class="nemko-filter-input" />
                  </div>
                  <div class="nemko-filter-list d-flex flex-column gap-1">
                    <label class="font-medium text-sm text-color-3">personal status</label>
                    <select class="nemko-filter-input">
                      <option value="all">All</option>
                      <option value="active">Active</option>
                      <option value="retired">Retired</option>
                      <option value="resigned">Resigned</option>
                    </select>
                  </div>
                  <div class="nemko-filter-list d-flex flex-column gap-1">
                    <label class="font-medium text-sm text-color-3">HR contact</label>
                    <input type="text" class="nemko-filter-input" />
                  </div>
                  <div class="nemko-filter-list d-flex flex-column gap-1">
                    <label class="font-medium text-sm text-color-3">office</label>
                    <input type="text" class="nemko-filter-input" />
                  </div>
                  <div class="nemko-filter-list d-flex flex-column gap-1">
                    <label class="font-medium text-sm text-color-3">approval manager</label>
                    <input type="text" class="nemko-filter-input" />
                  </div>
                  <div class="nemko-filter-list d-flex flex-column gap-1">
                    <label class="font-medium text-sm text-color-3">direct manager</label>
                    <input type="text" class="nemko-filter-input" />
                  </div>
                  <div class="nemko-filter-list d-flex flex-column gap-1">
                    <label class="font-medium text-sm text-color-3">local GM</label>
                    <input type="text" class="nemko-filter-input" />
                  </div>
                </div>
                <div class="flex-shrink-0 d-flex gap-2 ao-filter-right-btns">
                  <button type="button" class="btn nemko-btn-default nemko-btn-save text-xs m-0">Search</button>
                  <button type="button" class="btn nemko-btn-default nemko-btn-cancel text-xs m-0">Reset</button>
                </div>
              </div>
              <div class="w-100 float-start d-flex align-items-center gap-2 px-4 py-4 flex-wrap ao-table-top-btn">
                <button type="button" data-bs-toggle="modal" data-bs-target="#empNewModal" class="nemko-btn-default nemko-btn-success text-xs px-3 font-medium">new</button>
                <!-- No data-bs-toggle/target on Edit — controlled entirely by initEditModal -->
                <button type="button" id="emp-edit-btn" class="nemko-btn-default nemko-btn-edit text-xs px-3 font-medium">Edit</button>
                <button type="button" class="nemko-btn-default nemko-btn-cancel text-xs px-3 font-medium">Delete</button>
                <button type="button" class="nemko-btn-default nemko-btn-reject text-xs px-3 font-medium">delete all</button>
              </div>
              <div class="w-100 float-start d-flex flex-column position-relative px-4 pt-2">
                <div class="col-visibility-btn d-none">
                  <div class="w-100 dropdown position-static">
                    <svg data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside"
                      class="cursor-pointer" width="28" height="14" viewBox="0 0 14 12" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M0 5.66218C0.591383 2.44103 3.41366 0 6.80594 0C10.1982 0 13.0205 2.44103 13.6125 5.66218C13.0211 8.88332 10.1982 11.3244 6.80594 11.3244C3.41366 11.3244 0.591383 8.88332 0 5.66218ZM6.80594 8.80783C7.64021 8.80783 8.44032 8.47641 9.03025 7.88649C9.62017 7.29656 9.95159 6.49645 9.95159 5.66218C9.95159 4.8279 9.62017 4.02779 9.03025 3.43786C8.44032 2.84794 7.64021 2.51652 6.80594 2.51652C5.97166 2.51652 5.17155 2.84794 4.58162 3.43786C3.9917 4.02779 3.66028 4.8279 3.66028 5.66218C3.66028 6.49645 3.9917 7.29656 4.58162 7.88649C5.17155 8.47641 5.97166 8.80783 6.80594 8.80783ZM6.80594 7.54957C6.30537 7.54957 5.8253 7.35072 5.47135 6.99676C5.11739 6.64281 4.91854 6.16274 4.91854 5.66218C4.91854 5.16161 5.11739 4.68154 5.47135 4.32759C5.8253 3.97363 6.30537 3.77478 6.80594 3.77478C7.3065 3.77478 7.78657 3.97363 8.14052 4.32759C8.49448 4.68154 8.69333 5.16161 8.69333 5.66218C8.69333 6.16274 8.49448 6.64281 8.14052 6.99676C7.78657 7.35072 7.3065 7.54957 6.80594 7.54957Z"
                        fill="#696A6E" />
                    </svg>
                    <ul id="employees-col-visibility" class="dropdown-menu col-visibility-dd-menu px-4 py-12">
                    </ul>
                  </div>
                </div>
                <div class="table-responsive nemko-table-container employees-table">
                  <table class="table">
                    <thead>
                      <tr></tr>
                    </thead>
                    <tbody>
                      <tr></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <ul
                class="pagination nemko-pagination justify-content-end align-items-center gap-2 w-100 float-start px-4">
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
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ===================== NEW EMPLOYEE MODAL ===================== -->
  <div class="modal nemko-modal emp-new-modal" id="empNewModal" tabindex="-1" aria-labelledby="empNewModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <div class="d-flex align-items-center flex-wrap gap-4">
            <p data-tab-title="new" class="modal-title cursor-pointer fhd-text-xl-combo modal-title-active">employee new</p>
            // <p data-tab-title="edit" class="modal-title cursor-pointer fhd-text-xl-combo">Edit</p>
          </div>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body custom-scroll-view">
          <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="fullName" class="form-label">full name*</label>
              <input type="text" class="form-control" id="fullName" />
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="emailIp" class="form-label">email*</label>
              <input type="email" class="form-control" id="emailIp" />
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="personalStatus" class="form-label">personal status</label>
              <select class="form-select" id="personalStatus">
                <option value="" selected disabled></option>
                <option value="active">Active</option>
                <option value="retired">Retired</option>
                <option value="resigned">Resigned</option>
              </select>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="office" class="form-label">office</label>
              <select class="form-select" id="office">
                <option value="" selected disabled></option>
              </select>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="approvalManager" class="form-label">approval manager</label>
              <input type="text" class="form-control" id="approvalManager" />
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="directManger" class="form-label">direct manger</label>
              <input type="text" class="form-control" id="directManger" />
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="directManagerEmail" class="form-label">direct manager email</label>
              <input type="email" class="form-control" id="directManagerEmail" />
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="localGMList" class="form-label">local GM</label>
              <select class="form-select" id="localGMList">
                <option value="" selected disabled></option>
              </select>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="qualityManger" class="form-label">quality manager</label>
              <input type="text" class="form-control" id="qualityManger" />
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="HR-contact" class="form-label">HR contact</label>
              <input type="text" class="form-control" id="HR-contact" />
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <div class="form-label-cr">leadership function</div>
              <div class="d-flex align-items-center gap-3">
                <label class="nemko-frm-radio d-flex align-items-center gap-1">
                  <input class="form-check-input" type="radio" name="radioDefault2">
                  <span class="radio-icon"></span>
                  <p class="form-check-label">Yes</p>
                </label>
                <label class="nemko-frm-radio d-flex align-items-center gap-1">
                  <input class="form-check-input" type="radio" name="radioDefault2" checked>
                  <span class="radio-icon"></span>
                  <p class="form-check-label">No</p>
                </label>
              </div>
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

  <!-- ===================== EDIT / DETAIL EMPLOYEE MODAL ===================== -->
  <div class="modal nemko-modal emp-edit-modal" id="empEditModal" tabindex="-1" aria-labelledby="empEditModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <div class="d-flex align-items-center flex-wrap gap-4">
            <p data-tab-title="detail" class="modal-title cursor-pointer fhd-text-xl-combo modal-title-active">employee detail</p>
            <p data-tab-title="edit" class="modal-title cursor-pointer fhd-text-xl-combo">Edit</p>
          </div>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body custom-scroll-view">
          <div class="w-100 float-start d-flex flex-column gap-3 nemko-modal-frm py-2">
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editFullName" class="form-label">full name*</label>
              <input type="text" class="form-control" id="editFullName" />
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editEmailIp" class="form-label">email*</label>
              <input type="email" class="form-control" id="editEmailIp" />
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editPersonalStatus" class="form-label">personal status</label>
              <select class="form-select" id="editPersonalStatus">
                <option value="" selected disabled></option>
                <option value="active">Active</option>
                <option value="retired">Retired</option>
                <option value="resigned">Resigned</option>
              </select>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editOffice" class="form-label">office</label>
              <select class="form-select" id="editOffice">
                <option value="" selected disabled></option>
              </select>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editApprovalManager" class="form-label">approval manager</label>
              <input type="text" class="form-control" id="editApprovalManager" />
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editDirectManger" class="form-label">direct manager</label>
              <input type="text" class="form-control" id="editDirectManger" />
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editDirectManagerEmail" class="form-label">direct manager email</label>
              <input type="email" class="form-control" id="editDirectManagerEmail" />
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editLocalGMList" class="form-label">local GM</label>
              <select class="form-select" id="editLocalGMList">
                <option value="" selected disabled></option>
              </select>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editQualityManger" class="form-label">quality manager</label>
              <input type="text" class="form-control" id="editQualityManger" />
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editHRContact" class="form-label">HR contact</label>
              <input type="text" class="form-control" id="editHRContact" />
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <div class="form-label-cr">leadership function</div>
              <div class="d-flex align-items-center gap-3">
                <label class="nemko-frm-radio d-flex align-items-center gap-1">
                  <input class="form-check-input" type="radio" name="editLeadershipFunction">
                  <span class="radio-icon"></span>
                  <p class="form-check-label">Yes</p>
                </label>
                <label class="nemko-frm-radio d-flex align-items-center gap-1">
                  <input class="form-check-input" type="radio" name="editLeadershipFunction" checked>
                  <span class="radio-icon"></span>
                  <p class="form-check-label">No</p>
                </label>
              </div>
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editLocation" class="form-label">location</label>
              <input type="text" class="form-control" id="editLocation" placeholder="Current working location" />
            </div>
            <div class="w-100 float-start d-flex flex-column form-control-col">
              <label for="editEmployeeType" class="form-label">employee type</label>
              <input type="text" class="form-control" id="editEmployeeType" placeholder="e.g. Permanent, Non-Employee" />
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
  `;
}