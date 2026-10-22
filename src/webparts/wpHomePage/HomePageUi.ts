export default class HomePage {

    public static allElementsHtml: string = `

         <div class="main-wrapper min-h-screen-container">
    <div class="w-100 float-start home-page">
      <div class="container container-nemko px-3 px-lg-4 clearfix py-3">
        <div class="nm-hero-section w-100 float-start py-3 mt-4">
          <div id="homePageContent" class="row gy-4">
            
          </div>
        </div>
        <div class="w-100 float-start py-3 mt-5">
          <div class="row gy-4">
            <div class="col-12 col-xl-8 d-flex flex-column offset-xl-2 gap-px-32">
              <h1 class="nm-page-title text-center">Qualification Matrix</h1>
              <div class="w-100 float-start">
                <div class="row justify-content-center qm-link-row">
                  <div class="col-12 col-xs-6 col-sm-4 col-md-3 px-3">
                    <div class="w-100 float-start qm-grid-item-list">
                        <a href="__KEY_ADD_QUALIFICATION_URL__" class="w-100 float-start qm-grid-item d-flex flex-column justify-content-between">
                          <img class="qm-grid-img" src="__KEY_URL_RESOURCE__/resources/images/qualification-matrix/add-qualification.png"/>
                          <div class="w-100 float-start d-flex justify-content-between qm-grid-bottom-content align-self-end p-3 align-items-center gap-1">
                            <p class="text-sm font-medium text-white">Add Qualification</p>
                            <img class="flex-shrink-0" src="__KEY_URL_RESOURCE__/resources/images/icons/readmore-arrow.svg" alt="" />
                          </div>
                      </a>
                    </div>
                  </div>
                  <div class="col-12 col-xs-6 col-sm-4 col-md-3 px-3">
                    <div class="w-100 float-start qm-grid-item-list">
                        <a href="__KEY_MY_QUALIFICATION_URL__" class="w-100 float-start qm-grid-item d-flex flex-column justify-content-between">
                          <img class="qm-grid-img" src="__KEY_URL_RESOURCE__/resources/images/qualification-matrix/my-qualifications.png"/>
                          <div class="w-100 float-start d-flex justify-content-between qm-grid-bottom-content align-self-end p-3 align-items-center gap-1">
                            <p class="text-sm font-medium text-white">My Qualifications</p>
                            <img class="flex-shrink-0" src="__KEY_URL_RESOURCE__/resources/images/icons/readmore-arrow.svg" alt="" />
                          </div>
                      </a>
                    </div>
                  </div>
                  <div class="col-12 col-xs-6 col-sm-4 col-md-3 px-3">
                    <div class="w-100 float-start qm-grid-item-list">
                        __KEY_VERIFICATION_BADGE__
                        <a href="__KEY_MY_VERIFICATION_URL__" class="w-100 float-start qm-grid-item d-flex flex-column justify-content-between">
                          <img class="qm-grid-img" src="__KEY_URL_RESOURCE__/resources/images/qualification-matrix/my-verification.png"/>
                          __KEY_VERIFICATION_PENDING__
                          <div class="w-100 float-start d-flex justify-content-between qm-grid-bottom-content align-self-end p-3 align-items-center gap-1">
                            <p class="text-sm font-medium text-white">My Verification</p>
                            <img class="flex-shrink-0" src="__KEY_URL_RESOURCE__/resources/images/icons/readmore-arrow.svg" alt="" />
                          </div>
                      </a>
                    </div>
                  </div>
                  <div class="col-12 col-xs-6 col-sm-4 col-md-3 px-3">
                    <div class="w-100 float-start qm-grid-item-list">
                        __KEY_AUTHORIZATION_BADGE__
                        <a href="__KEY_MY_AUTHORIZATION_URL__" class="w-100 float-start qm-grid-item d-flex flex-column justify-content-between">
                          __KEY_AUTHORIZATION_PENDING__
                          <img class="qm-grid-img" src="__KEY_URL_RESOURCE__/resources/images/qualification-matrix/my-authorizations.png"/>
                          <div class="w-100 float-start d-flex justify-content-between qm-grid-bottom-content align-self-end p-3 align-items-center gap-1">
                            <p class="text-sm font-medium text-white">My Authorizations</p>
                            <img class="flex-shrink-0" src="__KEY_URL_RESOURCE__/resources/images/icons/readmore-arrow.svg" alt="" />
                          </div>
                      </a>
                    </div>
                  </div>
                  <div class="col-12 col-xs-6 col-sm-4 col-md-3 px-3">
                    <div class="w-100 float-start qm-grid-item-list">
                        <a href="__KEY_ADVANCED_SEARCH_URL__" class="w-100 float-start qm-grid-item d-flex flex-column justify-content-between">
                          <img class="qm-grid-img" src="__KEY_URL_RESOURCE__/resources/images/qualification-matrix/advanced-search.png"/>
                          <div class="w-100 float-start d-flex justify-content-between qm-grid-bottom-content align-self-end p-3 align-items-center gap-1">
                            <p class="text-sm font-medium text-white">Advanced Search</p>
                            <img class="flex-shrink-0" src="__KEY_URL_RESOURCE__/resources/images/icons/readmore-arrow.svg" alt="" />
                          </div>
                      </a>
                    </div>
                  </div>
                  <div class="col-12 col-xs-6 col-sm-4 col-md-3 px-3">
                    <div class="w-100 float-start qm-grid-item-list">
                        <a href="__KEY_GUIDELINES_URL__" class="w-100 float-start qm-grid-item d-flex flex-column justify-content-between">
                          <img class="qm-grid-img" src="__KEY_URL_RESOURCE__/resources/images/qualification-matrix/guidelines.png"/>
                          <div class="w-100 float-start d-flex justify-content-between qm-grid-bottom-content align-self-end p-3 align-items-center gap-1">
                            <p class="text-sm font-medium text-white">Guidelines</p>
                            <img class="flex-shrink-0" src="__KEY_URL_RESOURCE__/resources/images/icons/readmore-arrow.svg" alt="" />
                          </div>
                      </a>
                    </div>
                  </div>
                  <div id="add-new-standard-tile" class="col-12 col-xs-6 col-sm-4 col-md-3 px-3" style="display:none">
                    <div class="w-100 float-start qm-grid-item-list">
                        <a href="__KEY_ADD_NEW_STANDARD_URL__" class="w-100 float-start qm-grid-item d-flex flex-column justify-content-between">
                          <img class="qm-grid-img" src="__KEY_URL_RESOURCE__/resources/images/qualification-matrix/add-new-standared.png"/>
                          <div class="w-100 float-start d-flex justify-content-between qm-grid-bottom-content align-self-end p-3 align-items-center gap-1">
                            <p class="text-sm font-medium text-white">Add New Standard</p>
                            <img class="flex-shrink-0" src="__KEY_URL_RESOURCE__/resources/images/icons/readmore-arrow.svg" alt="" />
                          </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-4">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
    `

  public static homePageContent: string = `
          <div class="col-md-6 d-flex flex-column gap-2">
              <p class="nm-section-heading fhd-text-xl-combo">__KEY_CONTENT_TITLE__</p>
              <p class="nm-body-text font-normal text-sm lg-text-base text-color-8">__KEY_CONTENT_DESCRIPTION__</p>
          </div>
  `

  public static pendingBadgeHtml: string = `
    <div class="notification-badge d-flex justify-content-center align-items-center">
      <svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.84885 16.5268C5.24309 17.0254 5.74545 17.4278 6.318 17.7037C6.89054 17.9796 7.5183 18.1218 8.15386 18.1196C8.78942 18.1218 9.41717 17.9796 9.98972 17.7037C10.5623 17.4278 11.0646 17.0254 11.4589 16.5268C9.26553 16.8237 7.04219 16.8237 4.84885 16.5268ZM14.2692 6.34185V6.97965C14.2692 7.74521 14.4866 8.49354 14.8961 9.13045L15.9 10.6914C16.8159 12.1175 16.1165 14.0553 14.5229 14.5056C10.3587 15.6849 5.94897 15.6849 1.78483 14.5056C0.191217 14.0553 -0.508197 12.1175 0.407746 10.6914L1.41157 9.13045C1.82217 8.48828 2.04006 7.74187 2.03941 6.97965V6.34185C2.03941 2.83933 4.77728 0 8.15386 0C11.5304 0 14.2692 2.83933 14.2692 6.34185Z" fill="white"/>
      </svg>
    </div>
  `

  public static pendingCountHtml: string = `
    <p class="qm-grid-top-content text-end p-3 text-white text-sm font-medium">Pending <span class="lh-sm fhd-text-xl-combo">__KEY_PENDING_COUNT__</span></p>
  `
}