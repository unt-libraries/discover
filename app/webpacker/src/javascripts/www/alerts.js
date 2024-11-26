// alert.js
import { setWithExpiry, getWithExpiry } from './utils.js';

/**
 * Manages the display and dismissal of global alerts on the website.
 */
class AlertManager {
  /**
   * Constructs the alert manager setting up the basic properties and initiating event listeners.
   */
  constructor() {
    this.storageKey = `unt_lib.v2.globalAlert`;
    this.expireDays = 3;
    this.alertElement = document.querySelector('#global-alert');
    this.dismissBtn = document.querySelector('#global-alert-dismiss');

    this.init();
  }

  /**
   * Initializes the alert system by attaching DOMContentLoaded event to handle dynamic elements and state checks.
   */
  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.checkAlertVisibility();
      if (this.alertElement && this.dismissBtn) {
        this.attachDismissEvent();
      }
    });
  }

  /**
   * Checks the visibility of the global alert based on local storage settings.
   * If no setting is found or the setting has expired, shows the alert.
   */
  checkAlertVisibility() {
    const globalAlert = getWithExpiry(this.storageKey);
    if (!globalAlert) {
      this.showAlert();
    } else {
      this.hideAlert();
    }
  }

  /**
   * Hides the alert element by setting its display style to 'none'.
   */
  hideAlert() {
    if (this.alertElement) this.alertElement.style.display = 'none';
  }

  /**
   * Shows the alert element by removing 'display: none' style if it exists.
   */
  showAlert() {
    if (this.alertElement) this.alertElement.style.display = '';
  }

  /**
   * Attaches a click event listener to the dismiss button that will store a dismissal record in local storage
   * and hide the alert element. The record expiry is set based on `expireDays`.
   */
  attachDismissEvent() {
    this.dismissBtn.addEventListener('click', () => {
      setWithExpiry(this.storageKey, true, 60 * 1000);
      //setWithExpiry(this.storageKey, true, this.expireDays * 24 * 60 * 60 * 1000);
      this.hideAlert();
    });
  }
}

// Create an instance of AlertManager when the script is loaded
new AlertManager();
