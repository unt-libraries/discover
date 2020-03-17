import moment from 'moment';
import { elAddClass, elHasClass, elRemoveClass } from './_utils';
import { locationMapData } from './data/availability_locations';
import { statusDescData } from './data/availability_statuses';
import { initTooltips } from './_ui';


/**
 * Splits an array into chunks of 50 for more manageable API calls
 * @param {Array} arr
 * @param {number} chunkSize
 * @return {Array}
 */
function chunkArray(arr, chunkSize = 50) {
  const chunkedArray = [];
  while (arr.length) {
    chunkedArray.push(arr.splice(0, chunkSize));
  }
  return chunkedArray;
}

/**
 * Gets the elements for "fake" items that exist when there are no items to check on Sierra
 * @return {NodeList}
 */
function getNoApiElements() {
  return document.querySelectorAll('[data-no-api-request]');
}

/**
 * Crawls the DOM to find IDs for every item
 * @return {Array}
 */
function getItemsIDs() {
  const itemEls = document.querySelectorAll('[data-item-id]:not([data-item-id=""])');
  const itemsArray = Array.from(itemEls);

  const itemBibs = itemsArray.map((el) => el.dataset.itemId.replace(/\D/g, ''));
  return chunkArray(itemBibs, 50);
}

/**
 * Filters the items that were not returned by the Sierra API to determine what is missing
 * @param {Array} foundItems
 * @param {Array} allItems
 * @return {Object}
 */
function findMissing(foundItems = [], allItems) {
  const foundIDs = foundItems.map((el) => el.id);
  return allItems.filter((el) => !foundIDs.includes(el));
}

/**
 * Searches the mapped location data to find the closest matching key
 * @param {string} locationCode
 * @return {(Object|boolean)}
 */
function getLocationData(locationCode) {
  // Return an exact match if one exists
  if (Object.hasOwnProperty.call(locationMapData, locationCode)) {
    return locationMapData[locationCode];
  }

  // Create new array of wildcard keys that start with the same letter as locationCode then sort
  const wildcardMatches = Object.keys(locationMapData).filter((key) => key[0] === locationCode[0] && key.endsWith('*'));
  wildcardMatches.sort((a, b) => b.length - a.length);

  // Try to match a wildcard starting with the longest value
  let wildcardMatch = false;
  for (let i = 0; i < wildcardMatches.length; i += 1) {
    const wildcard = wildcardMatches[i];
    if (locationCode.startsWith(wildcard.slice(0, -1))) {
      wildcardMatch = locationMapData[wildcard];
      break;
    }
  }

  return wildcardMatch;
}

/**
 * Appends required query string parameters to an Aeon URL that require the Sierra API call.
 * @param {(HTMLElement|Element)} itemEl
 * @param {Object} itemLocation
 */
function updateAeonRequestUrl(itemEl, itemLocation) {
  const locationCode = itemLocation.code.startsWith('w4m') ? 'UNTMUSIC' : 'UNTSPECCOLL';
  const locationName = itemLocation.name;
  const linkEl = itemEl.querySelector('.request-aeon');
  const aeonUrl = new URL(linkEl.href);
  const queryString = aeonUrl.search;
  const params = new URLSearchParams(queryString);

  aeonUrl.search = params.toString();

  params.append('Location', locationName);
  params.append('Site', locationCode);
  aeonUrl.search = params.toString();
  linkEl.href = aeonUrl.toString();
}

/**
 * FUNCTIONS FOR `SHOW` VIEWS
 */

/**
 * Accesses the mapped location data to determine the URL to use for linkage
 * @param {Object} itemLocation
 * @return {(string|boolean)}
 */
function createShowLocationLink(itemLocation) {
  const locationData = getLocationData(itemLocation.code);
  if (locationData && locationData.url) {
    return `<a href="${locationData.url}" title="${locationData.title}" target="_blank">${itemLocation.name}</a>`;
  }
  return itemLocation.name;
}

/**
 * Accesses the mapped item status to add a tooltip and create an element
 * @param {Object} itemStatus
 * @return {(string|boolean)}
 */
function createShowStatusElement(itemStatus) {
  const statusCode = itemStatus.code;
  const statusDueDate = itemStatus.duedate;
  const statusDisplay = itemStatus.display;
  const statusDesc = statusDescData[statusCode].desc;

  // If the item is checked out
  if (statusDueDate) {
    const dueDate = moment(itemStatus.duedate).format('MMM DD, YYYY');
    return `Checked out</br>Due ${dueDate}`;
  }

  if (statusDesc) {
    return `<span class="tooltip-nolink" data-toggle="tooltip" data-title="${statusDesc}">${statusDisplay}</span>`;
  }
  return statusDisplay;
}

/**
 * Updates the status element for an item, including due date
 * @param {(HTMLElement|Element)} itemEl
 * @param {Object} itemStatus
 */
function updateShowStatusElement(itemEl, itemStatus = null) {
  const availabilityEl = itemEl.querySelector('.blacklight-availability.result__value');

  if (!itemStatus) {
    availabilityEl.innerText = 'ASK AT SERVICE DESK';
    return;
  }

  availabilityEl.dataset.statusCode = itemStatus.code;
  availabilityEl.innerHTML = createShowStatusElement(itemStatus);

  // Show the Request column if this isn't an online only record
  if (itemStatus.code !== 'w') {
    const availTableBody = itemEl.parentNode;
    const availTable = availTableBody.parentNode;
    const availRows = availTableBody.querySelectorAll('.item-row');
    const requestEls = availTable.querySelectorAll('.blacklight-request.d-none');
    let requestColumn = false;

    availRows.forEach((el) => {
      if (el.dataset.itemRequestability) {
        requestColumn = true;
      }
    });

    if (requestColumn) {
      requestEls.forEach((el) => {
        elRemoveClass(el, 'd-none');
      });
    }
  }
}

/**
 * Updates the location element for an item and calls function to update Aeon URL if necessary
 * @param {(HTMLElement|Element)} itemEl
 * @param {Object} itemLocation
 */
function updateShowLocationElement(itemEl, itemLocation) {
  if (!itemLocation) return;

  const locationEl = itemEl.querySelector('.blacklight-location.result__value');

  locationEl.dataset.locationCode = itemLocation.code;

  // Aeon request URLs must be updated to include data from the Sierra API call
  if (itemEl.dataset.itemRequestability === 'aeon') updateAeonRequestUrl(itemEl, itemLocation);

  locationEl.innerHTML = createShowLocationLink(itemLocation);
}

/**
 * Calls UI update functions for items returned by the Sierra API as well as those missing
 * @param {Array} foundItems
 * @param {Array} missingItems
 */
function updateShowUI(foundItems = [], missingItems = []) {
  foundItems.forEach((item) => {
    const itemEl = document.querySelector(`[data-item-id='${item.id}']`);
    if (itemEl === null) return;
    updateShowStatusElement(itemEl, item.status);
    updateShowLocationElement(itemEl, item.location);
  });

  missingItems.forEach((item) => {
    const itemEl = document.querySelector(`[data-item-id='${item}']`);
    updateShowStatusElement(itemEl);
    console.log(`Item ${item} not returned by the API`);
  });

  initTooltips();
}

function updateShowNoApiItems() {
  const noApiElements = getNoApiElements();

  noApiElements.forEach((item) => {
    const locationEl = item.querySelector('.blacklight-location.result__value');
    const locationCode = locationEl.dataset.itemLocation;
    const locationData = getLocationData(locationCode);
    locationEl.innerText = `Ask at the ${locationData.title} service desk`;
  });

  initTooltips();
}

/**
 * FUNCTIONS FOR `INDEX` VIEWS
 */

function updateIndexStatusElement(itemEl, item = null) {
  const availabilityEl = itemEl.querySelector('.blacklight-availability.result__value');
  const availabilityBtn = availabilityEl.querySelector('.btn');
  const availabilityText = availabilityEl.querySelector('.availability-text');
  const itemStatus = item.status;
  const itemLocation = item.location;

  if (!itemStatus) {
    availabilityBtn.innerText = 'Not Available';
    availabilityText.innerText = 'ASK AT SERVICE DESK';
    elRemoveClass(availabilityText, 'd-none');
    return;
  }

  const statusCode = itemStatus.code;
  const statusDueDate = itemStatus.duedate;

  availabilityEl.dataset.statusCode = statusCode;

  if (statusDescData[statusCode]) {
    const statusDesc = statusDescData[statusCode].desc;
    const statusBtnClass = statusDescData[statusCode].btnClass;
    const statusDisplay = statusDescData[statusCode].label;

    if (statusCode !== 'w') {
      const callNumberEl = itemEl.querySelector('.blacklight-call-number.result__value');
      elRemoveClass(callNumberEl, 'd-none');
    }

    if (statusBtnClass) {
      elRemoveClass(availabilityBtn, 'btn-outline-secondary');
      elAddClass(availabilityBtn, statusBtnClass);
    }

    // If the item is checked out
    if (statusDueDate) {
      const dueDate = moment(itemStatus.duedate).format('MMM DD, YYYY');
      availabilityBtn.innerText = 'Checked Out';
      availabilityText.innerText = `Due ${dueDate}`;
      elRemoveClass(availabilityText, 'd-none');
      return;
    }

    if (statusDesc) {
      availabilityBtn.innerText = statusDisplay;
      availabilityBtn.dataset.toggle = 'tooltip';
      availabilityBtn.dataset.title = statusDesc;
    }
  } else {
    availabilityBtn.innerText = itemStatus.display;
  }

  if (itemLocation) {
    const locationData = getLocationData(itemLocation.code);

    availabilityEl.dataset.locationCode = itemLocation.code;

    // Aeon request URLs must be updated to include data from the Sierra API call
    if (itemEl.dataset.itemRequestability === 'aeon') updateAeonRequestUrl(itemEl, itemLocation);

    // availabilityBtn.append(` - ${locationData.title}`);
    availabilityBtn.append(` - ${itemLocation.name}`);
  }
}

/**
 * Calls UI update functions for items returned by the Sierra API as well as those missing
 * @param {Array} foundItems
 * @param {Array} missingItems
 */
function updateIndexUI(foundItems = [], missingItems = []) {
  foundItems.forEach((item) => {
    const itemEl = document.querySelector(`[data-item-id='${item.id}']`);
    updateIndexStatusElement(itemEl, item);
    // updateIndexLocationElement(itemEl, item.location);
  });

  missingItems.forEach((item) => {
    const itemEl = document.querySelector(`[data-item-id='${item}']`);
    updateIndexStatusElement(itemEl);
    console.log(`Item ${item} not returned by the API`);
  });

  initTooltips();
}

function updateIndexNoApiItems() {
  const noApiElements = getNoApiElements();

  noApiElements.forEach((item) => {
    const availabilityTextEl = item.querySelector('.availability-text');
    const locationCode = availabilityTextEl.dataset.itemLocation;
    const locationData = getLocationData(locationCode);
    availabilityTextEl.innerText = `Ask at the ${locationData.title} service desk`;
  });

  initTooltips();
}

/**
 * Entry point to update availability of items through the Sierra API.
 */
function checkAvailability() {
  const bodyEl = document.querySelector('body');
  const pageContext = bodyEl.dataset.blacklightContext;
  const itemBibs = getItemsIDs();

  if (pageContext === 'show') {
    updateShowNoApiItems();
  } else if (pageContext === 'index') {
    updateIndexNoApiItems();
  }

  itemBibs.forEach((chunk) => {
    const request = new XMLHttpRequest();
    request.open('POST', '/availability/items', true);
    request.setRequestHeader('Content-Type', 'application/json');

    const tokenEl = document.querySelector('meta[name="csrf-token"]');
    const token = tokenEl.getAttribute('content');

    request.setRequestHeader('X-CSRF-Token', token);

    const data = `{"item_id": [${chunk}]}`;
    request.onload = function () {
      if (this.status >= 200 && this.status < 400) {
        const responseJSON = JSON.parse(this.response);
        const foundItems = responseJSON.entries;
        const missingItems = findMissing(foundItems, chunk);
        if (pageContext === 'show') {
          updateShowUI(foundItems, missingItems);
        } else if (pageContext === 'index') {
          updateIndexUI(foundItems, missingItems);
        }
      } else {
        console.log('Error from API');
        console.log(this.response);
      }
    };
    request.send(data);
  });
}

export {
  checkAvailability,
};
