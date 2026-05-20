import { currentSite } from "../../GlobalVars";
export default class HfNemkoHeader {

  public static _FirstSite: string = `/sites/` + currentSite();

  public static headerHTML: string = `
<nav class="navbar navbar-expand-lg navbar-light bg-white fixed-top nemko-header py-3 ">
    <div class="container container-nemko px-3 px-lg-4">
      <div class="d-flex align-items-center navbar-mob-top">


        <div class="ms-auto me-3 me-sm-3 d-flex d-lg-none align-items-center gap-3">
          <div class="nav-avatar-wrapper border rounded-circle">
            <img class="nav-avatar" src="__KEY_RESOURCE_URL__/resources/images/avatar.png" />
          </div>
          <a class="flex-shrink-0" href="#">
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.35206 18.242C5.78721 18.7922 6.34171 19.2364 6.97367 19.541C7.60564 19.8455 8.29855 20.0025 9.00006 20C9.70158 20.0025 10.3945 19.8455 11.0264 19.541C11.6584 19.2364 12.2129 18.7922 12.6481 18.242C10.2271 18.5697 7.77303 18.5697 5.35206 18.242ZM15.7501 7V7.704C15.7501 8.549 15.9901 9.375 16.4421 10.078L17.5501 11.801C18.5611 13.375 17.7891 15.514 16.0301 16.011C11.4338 17.3127 6.56635 17.3127 1.97006 16.011C0.211062 15.514 -0.560938 13.375 0.450062 11.801L1.55806 10.078C2.01128 9.36919 2.25178 8.54531 2.25106 7.704V7C2.25106 3.134 5.27306 0 9.00006 0C12.7271 0 15.7501 3.134 15.7501 7Z" fill="#5E99AB" />
            </svg>
          </a>
        </div>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
      </div>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav ms-auto me-0 my-2 my-lg-0 mt-lg-0 mt-3">
          <li class="nav-item me-lg-3">
            <a class="nav-link fhd-text-lg-combo" href="__KEY_HOME_URL__">Home</a>
          </li>
          <li class="nav-item me-lg-3">
            <a class="nav-link fhd-text-lg-combo" href="__KEY_ADMIN_URL__">Admin</a>
          </li>
          <li class="nav-item me-lg-3">
            <a class="nav-link fhd-text-lg-combo" href="#">Signout</a>
          </li>
        </ul>
        <div class="d-none d-lg-flex align-items-center gap-3">
          <div class="d-flex align-items-center gap-1 flex-shrink-0">
            <div class="nav-avatar-wrapper border rounded-circle">
              <img class="nav-avatar" src="__KEY_RESOURCE_URL__/resources/images/avatar.png" />
            </div>
            <p class="text-color-6 font-medium fhd-text-lg-combo">sohana</p>
          </div>
          <a class="flex-shrink-0" href="#">
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.35206 18.242C5.78721 18.7922 6.34171 19.2364 6.97367 19.541C7.60564 19.8455 8.29855 20.0025 9.00006 20C9.70158 20.0025 10.3945 19.8455 11.0264 19.541C11.6584 19.2364 12.2129 18.7922 12.6481 18.242C10.2271 18.5697 7.77303 18.5697 5.35206 18.242ZM15.7501 7V7.704C15.7501 8.549 15.9901 9.375 16.4421 10.078L17.5501 11.801C18.5611 13.375 17.7891 15.514 16.0301 16.011C11.4338 17.3127 6.56635 17.3127 1.97006 16.011C0.211062 15.514 -0.560938 13.375 0.450062 11.801L1.55806 10.078C2.01128 9.36919 2.25178 8.54531 2.25106 7.704V7C2.25106 3.134 5.27306 0 9.00006 0C12.7271 0 15.7501 3.134 15.7501 7Z" fill="#5E99AB" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </nav>
`;


  public static sidebarModeLeft: string = `
  <button class="btn-hamburger d-flex d-lg-none" id="sidebarToggle" aria-label="Toggle sidebar">
    <span class="navbar-toggler-icon"></span>
  </button>
`;

public static homeModeLeft: string = `
  <a class="navbar-brand" id="headerLogo" href="__KEY_HOME_URL__">
    <img src="__KEY_RESOURCE_URL__/resources/images/logo.png" />
  </a>
`;
}