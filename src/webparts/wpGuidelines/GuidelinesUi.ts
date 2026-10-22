export default class Guidelines {

  public static allElementsHtml: string = `

  <div class="sidebar-overlay" id="sidebarOverlay"></div>
  
    <div class="main-wrapper min-h-screen-container has-nemko-sidebar">
      <div class="w-100 float-start">
        <div class="container container-nemko px-3 px-lg-4 clearfix py-3">
          <div class="w-100 float-start nemko-inner-page-wrapper py-4 ps-xl-4">
            <h2 class="inner-page-main-title nm-page-title">Guidelines</h2>
            <div class="w-100 float-start guidelines-accordion-wrapper d-flex flex-column gap-4">
              <div class="accordion d-flex flex-column gap-2" id="guidelines-accordion">
              </div>
              <p class="text-sm font-normal text-color-17 my-2 px-3">For any other specific questions, you can contact Kenny Ho for clarification and coordination.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  public static guidelinesContent: string = `
    <div class="accordion-item py-1 __KEY_OPEN_CLASS__">
      <h2 class="accordion-header">
        <button class="accordion-button font-semibold text-base" type="button"
          data-bs-toggle="collapse" data-bs-target="#__KEY_COLLAPSE_ID__"
          aria-expanded="__KEY_ARIA_EXPANDED__" aria-controls="__KEY_COLLAPSE_ID__">
          __KEY_NUMBER__. __KEY_TITLE__
        </button>
      </h2>
      <div id="__KEY_COLLAPSE_ID__" class="accordion-collapse collapse __KEY_SHOW_CLASS__" data-bs-parent="#guidelines-accordion">
        <div class="accordion-body d-flex flex-column gap-3">
          __KEY_DESCRIPTION__
        </div>
      </div>
    </div>
  `;
}
