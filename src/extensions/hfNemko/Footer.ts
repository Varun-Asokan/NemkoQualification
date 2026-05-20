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
          <ul class="nm-footer-list">
            <li><a href="#">Nemko.Com</a></li>
            <li><a href="#">Standards.No/lec&amp;En Standards</a></li>
            <li><a href="#">Viva Engage/Yammer</a></li>
            <li><a href="#">Eng. Workbench/Us&amp;Ca Standards</a></li>
            <li><a href="#">Improvement Tool</a></li>
          </ul>
        </div>
        <div class="col-6 col-sm-5 col-lg-2">
          <ul class="nm-footer-list">
            <li><a href="#">Internet</a></li>
            <li><a href="#">My Nemko</a></li>
            <li><a href="#">Saleforce</a></li>
            <li><a href="#">Digital Library</a></li>
          </ul>
        </div>
        <div class="col-6 col-sm-7 col-lg-2">
          <ul class="nm-footer-list">
            <li><a href="#">Our Nemko</a></li>
            <li><a href="#">Docstore</a></li>
            <li><a href="#">NGMS User Guide</a></li>
            <li><a href="#">NGQA Node To NGMS Page ID Cross Ref</a></li>
          </ul>
        </div>
        <div class="col-6 col-sm-5 col-lg-2">
          <ul class="nm-footer-list">
            <li><a href="#">NGMS User Video</a></li>
            <li><a href="#">NGQA SP Site</a></li>
            <li><a href="#">Nemko Work Instruction (IT &amp; Bs</a></li>
            <li><a href="#">NGMS Issues Tracker</a></li>
          </ul>
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