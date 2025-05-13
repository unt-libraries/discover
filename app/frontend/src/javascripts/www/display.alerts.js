// Changes from source noted below with "EDITED"
// alert.js
import { onDomReady, setWithExpiry, getWithExpiry } from './utils.js';
import dayjs from 'dayjs'; // EDITED
import utc from 'dayjs/plugin/utc'; // EDITED

// Extend day.js with the plugins
dayjs.extend(utc); // EDITED to extend utc plugin

/**
 * Manages the display and dismissal of global alerts on the website.
 */
class AlertManager {
  /**
   * Constructs the alert manager setting up the basic properties and initiating event listeners.
   */
  constructor() {
    this.storageKey = window.wwwJsShims.alerts.js_config.storageKey; // EDITED to use window object
    this.expireDays = window.wwwJsShims.alerts.alerts.days_expire_dismiss; // EDITED to use window object
    this.publishOn = window.wwwJsShims.alerts.alerts.publish_on; // EDITED to use window object
    this.hideOn = window.wwwJsShims.alerts.alerts.hide_on; // EDITED to use window object
    this.currentVersion = window.wwwJsShims.alerts.alerts.version; // EDITED to use window object
    this.alertElement = document.querySelector('#global-alert');
    this.dismissBtn = document.querySelector('#global-alert-dismiss');
    // autorun
    onDomReady(() => {
      this.init();
    });
  }

  /**
   * Initializes the alert system.
   */
  init() {
    this.checkAlertVisibility();
    if (this.alertElement && this.dismissBtn) {
      this.attachDismissEvent();
    }
  }

  /**
   * Checks the visibility of the global alert based on local storage settings and publish/hide dates.
   * If no setting is found, the setting has expired, or the alert is within the publish/hide date range, shows the alert.
   */
  checkAlertVisibility() {
    const globalAlert = getWithExpiry(this.storageKey, this.currentVersion);

    // Parse the publish and hide dates using Day.js in UTC
    const publishDate = this.publishOn ? dayjs(this.publishOn).utc() : null;
    const hideDate = this.hideOn ? dayjs(this.hideOn).utc() : null;

    // Get the current date/time in UTC
    const now = dayjs().utc();

    // Check if the alert should be shown based on date conditions
    const isWithinDateRange =
      (!publishDate || now.isAfter(publishDate) || now.isSame(publishDate)) &&
      (!hideDate || now.isBefore(hideDate) || now.isSame(hideDate));

    if (!globalAlert && isWithinDateRange) {
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
      setWithExpiry(
        this.storageKey,
        true,
        this.expireDays * 24 * 60 * 60 * 1000, // X days in the future
        this.currentVersion
      );
      this.hideAlert();
    });
  }
}

// Create an instance of AlertManager when the script is loaded
new AlertManager();
