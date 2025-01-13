// Changes from source noted below with "EDITED"
import { onDomReady, setWithExpiry, getWithExpiry } from './utils.js';

/**
 * Manages the display and loading of the chat widget.
 * Check against springshare's api to see if chat is online and
 * store value for 15 minutes before checking again.
 */
export class ChatManager {
  /**
   * Constructor.
   */
  constructor() {
    this.storageKey = window.wwwJsShims.chat.storageKey; // EDITED to use config on window object
    this.expireTime = (5 * 60000); // 5 minutes
    this.apiUrl = window.wwwJsShims.chat.chat_config.apiURL.concat(window.wwwJsShims.chat.chat_config.endpoint); // EDITED to use config on window object
    this.widgetUrl = window.wwwJsShims.chat.chat_config.widgetUrl; // EDITED to use config on window object
    this.chatBtn = document.querySelector('#global-chat-btn');
    this.chatBtnText = document.querySelector('#global-chat-btn-text');
    this.offCanvasAsUs = document.querySelector('#offcanvas-ask-us');
    this.currentVersion = 'v1.0'; // Update this version as needed to force resets
    // autorun
    onDomReady(() => {
      this.init();
    });
  }

  /**
   * Initializes on content load.
   */
  init() {
    // exit early if no chat button or off canvas element
    if (!this.chatBtn || !this.offCanvasAsUs) return;
    // append fallback text to offCanvasAsUs no matter the circumstances.
    this.offCanvasAsUs.innerHTML = this.getFallbackText();
    // check storage
    const chatStatus = this.checkStorage();
    if (chatStatus === null) {
      // status doesn't exist; it has expired or never existed. Check status.
      this.fetchChatStatus();
    } else {
      if (chatStatus) {
        // chat is available, load the widget
        this.loadChat();
        this.showBtn();
      } else {
        // chat is not available, do nothing.
        // 'false' state will expire within 15 min.
        // and a re-check will result in null
        //this.loadChat(); // testing.
        this.offlineStatus();
        this.showBtn();
      }
    }
  }

  /**
   * Fetch chat status from springshare api using async
   * set storage with the boolean value and return the value.
   */
  async fetchChatStatus() {
    try {
      const response = await fetch(this.apiUrl);
      const data = await response.json();
      let status = false;
      if (data.online) {
        this.setStorage(true);
        this.loadChat();
        this.showBtn();
        status = true;
      } else {
        this.setStorage(false);
        this.offlineStatus();
        this.showBtn();
      }
      return status;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  }

  /**
   * Note offline status.
   */
  offlineStatus() {
    this.chatBtnText.innerHTML = "Chat is offline";
  }

  /**
   * reveal button.
   */
  showBtn() {
    this.chatBtn.classList.remove('d-none');
  }

  /**
   * load chat widget by appending script element to body
   */
  loadChat() {
    const script = document.createElement('script');
    script.src = this.widgetUrl;
    script.async = true;
    document.body.appendChild(script);
  }

  /**
   * fallBack Text
   *
   */
  getFallbackText() {
    return window.wwwJsShims.chat.ask_us_text; // EDITED to use config on window object
  }

  /**
   * Set storage with current chat status and a 5 minute expiry.
   * @param {boolean} active - true if chat is active, false if not.
   * @returns {boolean} - true if chat is active, false if not.
   */
  setStorage(active) {
    setWithExpiry(this.storageKey, active, this.expireTime, this.currentVersion, true);
  }

  /**
   * Check storage if chat is currently active. returning true or null.
   * @returns {boolean | null} - true if chat is active, null if not.
   */
  checkStorage() {
    const storageVal = getWithExpiry(this.storageKey, this.currentVersion, true);
    return storageVal;
  }
}

// Usage example:
// new ChatManager();
