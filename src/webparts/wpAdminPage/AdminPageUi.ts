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
          </div>
        </div>
      </div>
    </div>
  </div>

    `
}