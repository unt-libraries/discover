import moment from 'moment';
import { elAddClass, elHasClass, elRemoveClass } from './_utils';
import { locationMapData } from './data/availability_locations';
import { statusDescData } from './data/availability_statuses';


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
function getPlaceholderItemsElements() {
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

function getStatusData(statusCode) {
  return statusDescData[statusCode];
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
 * Entry point to update availability of items through the Sierra API.
 * @param {array} itemBibs
 * @param {function} callback
 * @return {JSON}
 */
function callSierraApi(itemBibs, callback) {
  const request = new XMLHttpRequest();
  request.open('POST', '/availability/items', true);
  request.setRequestHeader('Content-Type', 'application/json');

  const tokenEl = document.querySelector('meta[name="csrf-token"]');
  const token = tokenEl.getAttribute('content');

  request.setRequestHeader('X-CSRF-Token', token);

  const data = `{"item_id": [${itemBibs}]}`;
  let response;

  request.onload = function () {
    if (this.status < 200 || this.status > 400) {
      console.log('Error from API');
      console.log(this.response);
      return;
    }
    response = JSON.parse(this.response);

    if (typeof callback === 'function') callback(response);
  };
  request.send(data);
}

export {
  callSierraApi,
  findMissing,
  getItemsIDs,
  getLocationData,
  getStatusData,
  getPlaceholderItemsElements,
  updateAeonRequestUrl,
};
