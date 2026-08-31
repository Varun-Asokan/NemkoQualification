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
          <li id="nav-admin-li" class="nav-item me-lg-3" style="display:none">
            <a class="nav-link fhd-text-lg-combo" href="__KEY_ADMIN_URL__">Admin</a>
          </li>
          <li class="nav-item me-lg-3">
            <a class="nav-link fhd-text-lg-combo" href="/_layouts/15/SignOut.aspx">Signout</a>
          </li>
        </ul>
        <div class="d-none d-lg-flex align-items-center gap-3">
          <div class="d-flex align-items-center gap-1 flex-shrink-0">
            <div class="nav-avatar-wrapper border rounded-circle">
              <img class="nav-avatar" src="__KEY_RESOURCE_URL__/resources/images/avatar.png" />
            </div>
            <p id="nav-user-name" class="text-color-6 font-medium fhd-text-lg-combo"></p>
          </div>
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