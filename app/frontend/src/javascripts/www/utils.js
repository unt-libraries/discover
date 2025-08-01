// utils.js
import Blacklight from 'blacklight-frontend/app/javascript/blacklight/core'; // EDITED to import blacklight-frontend

/**
 * Stores a value with an expiration time into either localStorage or sessionStorage.
 *
 * @param {string} key - The key under which the value will be stored.
 * @param {any} value - The value to be stored.
 * @param {number} ttl - Time to live in milliseconds.
 * @param {string} version - The version of the data being stored. Allows for forced updates.
 * @param {boolean} useSessionStorage - If true, uses sessionStorage instead of localStorage.
 */
export function setWithExpiry(key, value, ttl, version, useSessionStorage = false) {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
    version: version
  };
  const storage = useSessionStorage ? sessionStorage : localStorage;
  storage.setItem(key, JSON.stringify(item));
}

/**
 * Retrieves an item from either localStorage or sessionStorage if it hasn't expired or the version string is mismatched.
 *
 * @param {string} key - The key of the item to retrieve.
 * @param {string} version - The version of the data being stored. Allows for forced updates.
 * @param {boolean} useSessionStorage - If true, uses sessionStorage instead of localStorage.
 * @returns {any|null} Returns the stored item if it hasn't expired; otherwise, null.
 */
export function getWithExpiry(key, version, useSessionStorage = false) {
  const storage = useSessionStorage ? sessionStorage : localStorage;
  const itemStr = storage.getItem(key);
  if (!itemStr) {
    return null;
  }
  const item = JSON.parse(itemStr);
  const now = new Date();
  if (now.getTime() > item.expiry || item.version !== version) {
    storage.removeItem(key);
    return null;
  }
  return item.value;
}

/**
 * Fetch data from a specified source with error handling, timeout, and retry logic.
 * @param {string} url - The URL to fetch data from.
 * @param {object} [options={}] - Configuration options
 * @param {number} [options.timeout=5000] - Timeout in milliseconds.
 * @param {number} [options.retries=0] - Number of retry attempts before giving up.
 * @param {number} [options.retryDelay=500] - Initial delay between retries in milliseconds (will use exponential backoff).
 * @returns {Promise<object[]|false>} - Promise resolving to parsed JSON or false if all attempts fail.
 */
export async function fetchData(url, { timeout = 5000, retries = 0, retryDelay = 500 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    let controller = new AbortController();
    let timeoutId = setTimeout(() => controller.abort(), timeout);
    let shouldRetry = attempt < retries; // Determine if we can attempt another retry after this one

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`HTTP error! Status: ${response.status}`);
        if (shouldRetry) {
          await delay(retryDelay * (2 ** attempt)); // Exponential backoff
          continue; // Retry the fetch
        } else {
          return false;
        }
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Fetch error:', error.message);

      // If this was our last attempt, return false
      if (!shouldRetry) {
        return false;
      }

      // Otherwise, wait before retrying
      await delay(retryDelay * (2 ** attempt));
    }
  }

  // If we exit the loop without returning, something unexpected happened
  return false;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


export function makeSVG(useID, title = '') {
  const svgNS = "http://www.w3.org/2000/svg";
  const xlinkNS = "http://www.w3.org/1999/xlink";
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', "svg-inline--fa fa-lg fa-fw");
  svg.setAttribute('role', 'img');
  svg.setAttribute('xmlns', svgNS);
  svg.setAttribute('viewBox', "0 0 640 640");
  const titleEl = document.createElementNS(svgNS, 'title');
  titleEl.textContent = title;
  const use = document.createElementNS(svgNS, 'use');
  use.setAttributeNS(xlinkNS, 'xlink:href', `#${useID}`);
  svg.appendChild(titleEl);
  svg.appendChild(use);
  return svg;

}

/**
 * Toggle an input between type password and text based on button click.
 */
export function togglePasswordVisibility() {
  const togglePasswordButtons = document.querySelectorAll('[data-untl-toggle="password"]');
  if (!togglePasswordButtons.length) {
    return;
  }
  togglePasswordButtons.forEach(button => {
    button.addEventListener('click', () => {
      const target = button.getAttribute('data-untl-target');
      const input = document.querySelector(target);
      const icon = button.querySelector('svg');
      const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
      input.setAttribute('type', type);
      // set the class of the button to eye-slash if password and eye if text
      icon.classList.toggle('fa-eye-slash', type === 'text');
      icon.classList.toggle('fa-eye', type === 'password');
    });
  });
}
/**
 * Utility function to wait for DOM ready.
 * Executes the callback when the DOM is fully loaded.
 * @param {Function} callback
 */
export function onDomReady(callback) {
    Blacklight.onLoad(callback); // EDITED: to use Blacklight.onLoad
}

/**
 * Opt-in for Bootstrap tooltips.
 * Binds to a wrapper element, allowing for dynamic content insertion.
 * @param {string} selector - The CSS selector for tooltips.
 */
export function optInTooltips(selector = '[data-bs-toggle="tooltip"]') {
  if (typeof bootstrap === 'undefined') {
    console.warn('Bootstrap is not defined.');
    return;
  }
  new bootstrap.Tooltip('body', { selector });

  // EDITED as this is only necessary for Blacklight and Turbo
  // Destroy all tooltips before Turbolinks cache
  document.addEventListener("turbo:before-cache", function () {
    const tooltips = document.querySelectorAll(selector);
    tooltips.forEach(tooltip => {
      const bsTooltip = bootstrap.Tooltip.getInstance(tooltip);
      if (bsTooltip) {
        bsTooltip.dispose();
      }
    });
  });
}

/**
 * Opt-in for Bootstrap popovers.
 * Binds to a wrapper element, allowing for dynamic content insertion.
 * @param {string} container - The container selector for popovers.
 * @param {string} selector - The CSS selector for popovers.
 */
export function optInPopovers(
  container = '#main-container',
  selector = '[data-bs-toggle="popover"]'
) {
  if (typeof bootstrap === 'undefined') {
    console.warn('Bootstrap is not defined.');
    return;
  }
  new bootstrap.Popover(container, { selector });
}
