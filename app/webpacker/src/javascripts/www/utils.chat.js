// Changes from source noted below with "EDITED"
import { setWithExpiry, getWithExpiry } from './utils.js';

/**
 * Manages the display and loading of the chat widget.
 * Check against sprinshare's api to see if chat is online and
 * store value for 15 minutes before checking again.
 */
class chatManager {
  /**
   * Constructor.
   */
  constructor() {
    this.storageKey = `unt_lib.v2.chatActive`;
    this.now = new Date();
    this.expireTime = (5 * 60000); // 5 minutes
    this.apiUrl = "https://api2.libanswers.com/1.0/chat/widgets/status/26930"; // no cors errors on local.
    // this.apiUrl = "https://unt.libanswers.com/api/1.0/chat/widgets/status/26930"; // cors errors on local.
    this.widgetUrl = "https://unt.libanswers.com/load_chat.php?hash=9279f20504044072454e342f7472f5d665421500906281355ba7d5cffe62aa0a";
    this.chatBtn = document.querySelector('#global-chat-btn');
    this.chatBtnText = document.querySelector('#global-chat-btn-text');
    this.offCanvasAsUs = document.querySelector('#offcanvas-ask-us');
    // autorun
    this.init();
  }

  /**
   * Initializes on content load.
   */
  init() {
    document.addEventListener('DOMContentLoaded', () => {
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
          // chat is not avaialable, do nothing.
          // 'false' state will expire within 15 min.
          // and a re-checxxk will result in null
          //this.loadChat(); // testing.
          this.offlineStatus();
          this.showBtn();
        }
      }

    });
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
   * Note offlines status.
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
    const askUsText = window.wwwJsShims.chat.ask_us_text; // EDITED to use config on window object
    // create html from askUsText ready to insert in the dom
    //const parser = new DOMParser();
   // const parsedHtml = parser.parseFromString(askUsText, 'text/html');
    // return the parsed html
    return askUsText;
  }

  /**
   * Set storage with current chat status and a 15 minute expirary.
   * @param {boolean} active - true if chat is active, false if not.
   * @returns {boolean} - true if chat is active, false if not.
   */
  setStorage(active) {
    setWithExpiry(this.storageKey, active, this.expireTime, true);
  }

  /**
   * Check storage if chat is currently active. returning true or null.
   * @returns {boolean | null} - true if chat is active, null if not.
   */
  checkStorage() {
    const storageVal = getWithExpiry(this.storageKey, true);
    return storageVal;
  }


}

// Create an instance of chatManager when the script is loaded
new chatManager();
