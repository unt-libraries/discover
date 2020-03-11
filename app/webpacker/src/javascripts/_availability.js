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
 * Crawls the DOM to find IDs for every item
 * @return {Array}
 */
function getItemsIDs() {
  const itemEls = document.querySelectorAll('[data-item-id]');
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
  for (let i = 0; i < wildcardMatches.length; i++) {
    const wildcard = wildcardMatches[i];
    if (locationCode.startsWith(wildcard.slice(0, -1))) {
      wildcardMatch = locationMapData[wildcard];
      break;
    }
  }

  return wildcardMatch;
}

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

function updateIndexStatusElement(itemEl, itemStatus = null) {
  console.log(itemEl);
  const availabilityEl = itemEl.querySelector('.blacklight-availability.result__value');
  const availabilityBtn = availabilityEl.querySelector('.btn');
  const availabilityText = availabilityEl.querySelector('.availability-text');

  if (!itemStatus) {
    availabilityBtn.innerText = 'Not Available';
    availabilityText.innerText = 'ASK AT SERVICE DESK';
    elRemoveClass(availabilityText, 'd-none');
    return;
  }

  const statusCode = itemStatus.code;
  const statusDueDate = itemStatus.duedate;
  const statusDisplay = itemStatus.display;
  const statusDesc = statusDescData[statusCode].desc;
  const statusBtnClass = statusDescData[statusCode].btnClass;

  availabilityEl.dataset.statusCode = statusCode;

  if (statusBtnClass) {
    elRemoveClass(availabilityBtn, 'btn-outline-secondary');
    elAddClass(availabilityBtn, statusBtnClass);
  }
  // If the item is checked out
  if (statusDueDate) {
    const dueDate = moment(itemStatus.duedate).format('MMM DD, YYYY');
    availabilityBtn.innerText = 'Checked Out';
    availabilityBtn.dataset.toggle = 'tooltip';
    availabilityBtn.dataset.title = statusDesc;
    availabilityText.innerText = `Due ${dueDate}`;
    elRemoveClass(availabilityText, 'd-none');
    return;
  }

  if (statusDesc) {
    availabilityBtn.innerText = statusDisplay;
    availabilityBtn.dataset.toggle = 'tooltip';
    availabilityBtn.dataset.title = statusDesc;
  }
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

function updateIndexLocationElement(itemEl, itemLocation) {
  if (!itemLocation) return;

  const locationEl = itemEl.querySelector('.blacklight-location.result__value');
  const locationData = getLocationData(itemLocation.code);

  locationEl.dataset.locationCode = itemLocation.code;

  // Aeon request URLs must be updated to include data from the Sierra API call
  if (itemEl.dataset.itemRequestability === 'aeon') updateAeonRequestUrl(itemEl, itemLocation);

  if (locationData && locationData.url) {
    locationEl.innerHTML = `<a href="${locationData.url}" title="${locationData.title}" target="_blank">${itemLocation.name}</a>`;
  } else {
    locationEl.innerHTML = itemLocation.name;
  }
}

/**
 * Calls UI update functions for items returned by the Sierra API as well as those missing
 * @param {Array} foundItems
 * @param {Array} missingItems
 */
function updateUI(foundItems = [], missingItems = []) {
  // Update elements for items returned by the API
  foundItems.forEach((item) => {
    const itemEl = document.querySelector(`[data-item-id='${item.id}']`);
    // const itemElNew = document.querySelector(`.new[data-item-id='${item.id}']`);

    if (elHasClass(itemEl, 'new')) {
      updateIndexStatusElement(itemEl, item.status);
      updateIndexLocationElement(itemEl, item.location);
    } else {
      updateShowStatusElement(itemEl, item.status);
      updateShowLocationElement(itemEl, item.location);
    }
  });

  // Update elements for items that were not found by the API
  missingItems.forEach((item) => {
    const itemEl = document.querySelector(`[data-item-id='${item}']`);
    // const itemElNew = document.querySelector(`.new[data-item-id='${item.id}']`);

    if (elHasClass(itemEl, 'new')) {
      updateIndexStatusElement(itemEl);
    } else {
      updateShowStatusElement(itemEl);
    }
    // updateShowLocationElement(itemEl);
    console.log(`Item ${item} not returned by the API`);
  });

  initTooltips();
}

/**
 * Entry point to update availability of items through the Sierra API.
 */
function checkAvailability() {
  const itemBibs = getItemsIDs();

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
        updateUI(foundItems, missingItems);
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
