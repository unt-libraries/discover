import { locationData } from './data/availability_locations';
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
  let exactMatch = {};
  // Set an exact match if one exists
  if (Object.hasOwnProperty.call(locationData, locationCode)) {
    exactMatch = locationData[locationCode];
  }

  // Create new array of wildcard keys that start with the same letter as locationCode then sort
  const wildcardMatches = Object.keys(locationData).filter((key) => key[0] === locationCode[0] && key.endsWith('*'));
  wildcardMatches.sort((a, b) => b.length - a.length);

  // Try to match a wildcard starting with the longest value
  let wildcardMatch = {};
  for (let i = 0; i < wildcardMatches.length; i += 1) {
    const wildcard = wildcardMatches[i];
    if (locationCode.startsWith(wildcard.slice(0, -1))) {
      wildcardMatch = locationData[wildcard];
      break;
    }
  }

  // Fill in missing properties from wildcard if necessary
  return { ...wildcardMatch, ...exactMatch };
}

function getStatusData(statusCode) {
  return statusDescData[statusCode];
}

/**
 * Appends required query string parameters to an Aeon URL that require the Sierra API call.
 * @param {string} itemURL
 * @param {Object} itemLocation
 * @return {string} new URL string
 */
function updateAeonRequestUrl(itemURL, itemLocation) {
  const locationCode = itemLocation.code.startsWith('w4m') ? 'UNTMUSIC' : 'UNTSPECCOLL';
  const locationName = itemLocation.name;
  const aeonUrl = new URL(itemURL);
  const queryString = aeonUrl.search;
  const params = new URLSearchParams(queryString);

  aeonUrl.search = params.toString();

  params.append('Location', locationName);
  params.append('Site', locationCode);
  aeonUrl.search = params.toString();
  return aeonUrl.toString();
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
