import { currentSite } from "../../GlobalVars";

export default class HfNemkoFooter {

  public static _FirstSite: string = `/sites/` + currentSite();

  public static footerHTML: string = `
  
   <!-- Widget start here -->
<footer class="w-100 float-start py-4">
    <div class="container container-nemko px-3 px-lg-4 clearfix">
      <div class="row g-4">
        <div class="col-6 col-lg-2 d-none d-lg-block">
          <p class="nm-footer-heading">Supporting Links</p>
        </div>
        <div class="col-6 col-sm-7 col-lg-3">
          <ul class="nm-footer-list" id="footer-col-0"></ul>
        </div>
        <div class="col-6 col-sm-5 col-lg-2">
          <ul class="nm-footer-list" id="footer-col-1"></ul>
        </div>
        <div class="col-6 col-sm-7 col-lg-2">
          <ul class="nm-footer-list" id="footer-col-2"></ul>
        </div>
        <div class="col-6 col-sm-5 col-lg-2">
          <ul class="nm-footer-list" id="footer-col-3"></ul>
        </div>
        <div class="col-12 col-lg-1 text-center text-lg-end">
          <a href="#" class="footer-logo">
            <img src="__KEY_RESOURCE_URL__/resources/images/logo.png" />
          </a>
        </div>
      </div>
    </div>
  </footer>
  <!-- Widget end here -->

  `;
}