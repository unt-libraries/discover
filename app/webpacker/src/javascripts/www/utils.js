// utils.js

/**
 * Stores a value with an expiration time into either localStorage or sessionStorage.
 * 
 * @param {string} key - The key under which the value will be stored.
 * @param {any} value - The value to be stored.
 * @param {number} ttl - Time to live in milliseconds.
 * @param {boolean} useSessionStorage - If true, uses sessionStorage instead of localStorage.
 */
export function setWithExpiry(key, value, ttl, useSessionStorage = false) {
    const now = new Date();
    const item = {
        value: value,
        expiry: now.getTime() + ttl,
    };
    const storage = useSessionStorage ? sessionStorage : localStorage;
    storage.setItem(key, JSON.stringify(item));
}

/**
 * Retrieves an item from either localStorage or sessionStorage if it hasn't expired.
 * 
 * @param {string} key - The key of the item to retrieve.
 * @param {boolean} useSessionStorage - If true, uses sessionStorage instead of localStorage.
 * @returns {any|null} Returns the stored item if it hasn't expired; otherwise, null.
 */
export function getWithExpiry(key, useSessionStorage = false) {
    const storage = useSessionStorage ? sessionStorage : localStorage;
    const itemStr = storage.getItem(key);
    if (!itemStr) {
        return null;
    }
    const item = JSON.parse(itemStr);
    const now = new Date();
    if (now.getTime() > item.expiry) {
        storage.removeItem(key);
        return null;
    }
    return item.value;
}

/**
 * Fetch data from a specified source with error handling and timeout.
 * @param {string} url - The URL to fetch data from.
 * @param {number} timeout - Timeout in milliseconds.
 * @returns {Promise<object[]|false>} - Promise resolving to an array of items or false if an error occurs.
 */
export async function fetchData(url, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId); // clear the timeout upon successful fetch
    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`);
      return false;
    }
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Fetch error:', error.message);
    return false;
  }
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
