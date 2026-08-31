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
    


    <div class="nm-chat-body-wrapper d-flex flex-column px-2 gap-3 flex-grow-1 overflow-hidden justify-content-between">
     
      <iframe
        id="copilotFrame"
        src="__KEY_COPILOT_URL__"
        style="width:100%; height:100%; border:none;"
        title="Copilot"
      ></iframe>
    
    </div>
  </div>


  <div class="nm-chatbot-open-btn flex-column align-items-center d-flex" id="chatFab">
    <img src="__KEY_RESOURCE_URL__/resources/images/chatbot-fill.png" />
    
  </div>

  `;
}

// <span class="font-medium text-sm md-text-base text-color-1">Chatbot</span>