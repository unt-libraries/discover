import moment from 'moment';
import { elRemoveClass } from './_utils';
import { locationMapUrls } from './data/_availability_data';


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
 * Accesses the mapped location data to determine the URL to use for linkage
 * @param {string} locationCode
 * @return {(string|boolean)}
 */
function getLocationUrl(locationCode) {
  if (Object.hasOwnProperty.call(locationMapUrls, locationCode)) {
    return locationMapUrls[locationCode].url;
  }
  return false;
}

/**
 * Updates the status element for an item, including due date
 * @param {(HTMLElement|Element)} itemEl
 * @param {Object} itemStatus
 */
function updateStatusElement(itemEl, itemStatus = null) {
  const availabilityEl = itemEl.querySelector('.blacklight-availability.result__value');

  if (!itemStatus) {
    availabilityEl.innerText = 'ASK AT SERVICE DESK';
    return;
  }

  availabilityEl.dataset.statusCode = itemStatus.code;

  // If the item is checked out
  if (itemStatus.duedate) {
    const dueDate = moment(itemStatus.duedate).format('MMM DD, YYYY');
    availabilityEl.innerText = `Checked out\nDue ${dueDate}`;
  } else {
    availabilityEl.innerText = itemStatus.display;
  }

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
function updateLocationElement(itemEl, itemLocation) {
  if (!itemLocation) return;

  const locationEl = itemEl.querySelector('.blacklight-location.result__value');

  locationEl.dataset.locationCode = itemLocation.code;

  // Aeon request URLs must be updated to include data from the Sierra API call
  if (itemEl.dataset.itemRequestability === 'aeon') updateAeonRequestUrl(itemEl, itemLocation);

  const locationUrl = getLocationUrl(itemLocation.code);
  if (locationUrl) {
    locationEl.innerHTML = `<a href="${locationUrl}" target="_blank">${itemLocation.name}</a>`;
  } else {
    locationEl.innerText = itemLocation.name;
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

    updateStatusElement(itemEl, item.status);
    updateLocationElement(itemEl, item.location);
  });

  // Update elements for items that were not found by the API
  missingItems.forEach((item) => {
    const itemEl = document.querySelector(`[data-item-id='${item}']`);
    updateStatusElement(itemEl);
    // updateLocationElement(itemEl);
    console.log(`Item ${item} not returned by the API`);
  });
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
