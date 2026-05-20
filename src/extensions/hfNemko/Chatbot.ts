export default class HfNemkoChatbot {

  public static chatbotHTML: string = `
 
  <div class="nm-chatbot" id="nemko-chatbot">
    <div class="nm-chatbot-header px-3 py-12">
      <img class="nm-chat-logo" src="__KEY_RESOURCE_URL__/resources/images/logo-white.png"/>


      <svg id="chat-close" class="flex-shrink-0 cursor-pointer nm-chat-close-btn" width="14" height="18" viewBox="0 0 14 18" fill="none">
        <path d="M1.88388 4.3869e-05L6.71626 7.57675H6.82706L11.6594 4.3869e-05H13.543L7.92649 8.72732L13.543 17.4546H11.6594L6.82706 9.96311H6.71626L1.88388 17.4546H0.000355154L5.70206 8.72732L0.000355154 4.3869e-05H1.88388Z" fill="#F8F9F9"/>
      </svg>

      <img class="chatbot-icon" src="__KEY_RESOURCE_URL__/resources/images/chatbot.png" />
    </div>

    <div class="nm-chat-body-wrapper d-flex flex-column px-2 gap-3 py-4 flex-grow-1 overflow-hidden justify-content-between">
     
      <div class="nm-chat-body w-100 float-start overflow-auto custom-scroll-view px-2 d-flex flex-column gap-2">
        <p class="nm-chatbot-prompt text-sm md-text-base mb-2">
          Ready To Explore This Site? Select One Of The Suggestions Below To Get Started
        </p>

        
        <button class="nm-suggestion-btn text-sm md-text-base px-3 py-13 lh-sm">What Are The Latest Site Updates</button>
        <button class="nm-suggestion-btn text-sm md-text-base px-3 py-13 lh-sm">summarize key points from files</button>
        <button class="nm-suggestion-btn text-sm md-text-base px-3 py-13 lh-sm">review key points from the latest news post</button>
      </div>

      <div class="nm-chat-footer flex-shrink-0 d-flex flex-column gap-1 p-2">
        <textarea id="chatInput" class="nm-chat-input font-medium text-base md-text-lg p-1" placeholder="Ask a question" maxlength="2000"></textarea>

        <div class="px-1 w-100 float-start d-flex justify-content-between align-items-center nm-chat-actions">
          <span class="nm-char-count text-xs md-text-sm flex-shrink-0" id="charCount">0/2000</span>

          <div class="d-flex align-items-center gap-2">
            <label class="flex-shrink-0 cursor-pointer nm-chat-attachment">
              <input type="file" class="d-none" />
              <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="https://protect.checkpoint.com/v2/r02/___http://www.w3.org/2000/svg">___.YzJlOm5lbWtvZ3JvdXA6YzpvOjNlMjJlMTAyNjA2OWRmNzI5NzFiYjgyM2NhMGQwZmRjOjc6MGYxNzo0MjJjMzE2YzAwYmExMDU5ZTY4NDc3NzAzY2NlOTZjMzJjYTBjMmUwOGM5ZTE3NDUwOWZlODU0NTAxYzdmZDNlOnQ6VDpO;
                <path d="M13.8583 7.71503L7.9248 13.6485C7.10114 14.451 5.99455 14.8968 4.84462 14.8893C3.69469 14.8818 2.59398 14.4217 1.78084 13.6085C0.967703 12.7954 0.507576 11.6947 0.500093 10.5448C0.49261 9.39483 0.938375 8.28823 1.74086 7.46458L7.85162 1.35382C8.39831 0.807129 9.13979 0.5 9.91293 0.5C10.6861 0.5 11.4276 0.807129 11.9742 1.35382C12.5209 1.90052 12.8281 2.64199 12.8281 3.41513C12.8281 4.18828 12.5209 4.92975 11.9742 5.47645L6.03973 11.411C5.76638 11.6843 5.39564 11.8379 5.00907 11.8379C4.6225 11.8379 4.25176 11.6843 3.97842 11.411C3.70507 11.1376 3.55151 10.7669 3.55151 10.3803C3.55151 9.99373 3.70507 9.623 3.97842 9.34965L9.73566 3.59241" stroke="#868686"/>
              </svg>
            </label>
            <span class="seperator-line mx-1"></span>
            <svg class="flex-shrink-0" width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="https://protect.checkpoint.com/v2/r02/___http://www.w3.org/2000/svg">___.YzJlOm5lbWtvZ3JvdXA6YzpvOjNlMjJlMTAyNjA2OWRmNzI5NzFiYjgyM2NhMGQwZmRjOjc6YWYyYTozMDlmNjAzMDJhMTY3NjhkNTRlYTY1ZTY5YWU0MmYzYjUyNDU2MDViN2RjM2EwOWU4YjUyY2UzMTVlZTg5M2IyOnQ6VDpO;
              <path fill-rule="evenodd" clip-rule="evenodd" d="M3.4 3.64286V8.5C3.4 8.85082 3.4691 9.1982 3.60335 9.52231C3.7376 9.84642 3.93438 10.1409 4.18244 10.389C4.43051 10.6371 4.725 10.8338 5.04912 10.9681C5.37323 11.1023 5.72061 11.1714 6.07143 11.1714C6.42225 11.1714 6.76963 11.1023 7.09374 10.9681C7.41785 10.8338 7.71235 10.6371 7.96041 10.389C8.20848 10.1409 8.40526 9.84642 8.53951 9.52231C8.67376 9.1982 8.74286 8.85082 8.74286 8.5V3.64286C8.74286 2.93435 8.4614 2.25486 7.96041 1.75387C7.45942 1.25288 6.77994 0.971429 6.07143 0.971429C5.36292 0.971429 4.68343 1.25288 4.18244 1.75387C3.68145 2.25486 3.4 2.93435 3.4 3.64286ZM6.55714 14.552V17H5.58571V14.552C4.06444 14.4299 2.64494 13.7394 1.60985 12.6179C0.574753 11.4964 -7.839e-06 10.0262 0 8.5V7.28571H0.971428V8.5C0.971428 9.8526 1.50875 11.1498 2.46518 12.1062C3.42162 13.0627 4.71882 13.6 6.07143 13.6C7.42403 13.6 8.72124 13.0627 9.67767 12.1062C10.6341 11.1498 11.1714 9.8526 11.1714 8.5V7.28571H12.1429V8.5C12.1429 10.0262 11.5681 11.4964 10.533 12.6179C9.49792 13.7394 8.07842 14.4299 6.55714 14.552ZM2.42857 3.64286C2.42857 2.67671 2.81237 1.75014 3.49554 1.06697C4.17871 0.3838 5.10528 0 6.07143 0C7.03757 0 7.96415 0.3838 8.64732 1.06697C9.33049 1.75014 9.71429 2.67671 9.71429 3.64286V8.5C9.71429 9.46615 9.33049 10.3927 8.64732 11.0759C7.96415 11.7591 7.03757 12.1429 6.07143 12.1429C5.10528 12.1429 4.17871 11.7591 3.49554 11.0759C2.81237 10.3927 2.42857 9.46615 2.42857 8.5V3.64286Z" fill="#868686"/>
            </svg>
            <button type="button" class="nm-chat-send-btn">
              <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="https://protect.checkpoint.com/v2/r02/___http://www.w3.org/2000/svg">___.YzJlOm5lbWtvZ3JvdXA6YzpvOjNlMjJlMTAyNjA2OWRmNzI5NzFiYjgyM2NhMGQwZmRjOjc6OGNiNzozOGVmOGExZjQwOTE0N2YxYTg1MDU3MTRkYTU5YmY4ZjFkZjM3NWQxMmI4YTdjMjdjMjkyYzE5NTQ3NDJkNmIyOnQ6VDpO;
                <path d="M10.8132 9.25441H3.32555C3.32555 8.99469 3.27172 8.73496 3.16499 8.4913L0.920026 3.41202C0.202242 1.78756 1.91926 0.161216 3.50216 0.964946L16.5177 7.57045C17.8966 8.26935 17.8966 10.2395 16.5177 10.9384L3.50311 17.5439C1.91926 18.3476 0.202242 16.7203 0.920026 15.0968L3.1631 10.0175C3.26912 9.7771 3.3238 9.51718 3.32366 9.25441" stroke="#868686" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>


  <div class="nm-chatbot-open-btn flex-column align-items-center d-flex" id="chatFab">
    <img src="__KEY_RESOURCE_URL__/resources/images/chatbot-fill.png" />
    
  </div>

  `;
}

// <span class="font-medium text-sm md-text-base text-color-1">Chatbot</span>