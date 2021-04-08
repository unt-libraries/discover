import moment from 'moment';
import {
  callSierraApi,
  findMissing,
  getItemsIDs,
  getLocationData,
  getPlaceholderItemsElements,
  getServiceDeskData,
  getStatusData,
  itemsFromPromises,
  updateAeonRequestUrl,
} from './_availability_util';
import {
  elAddClass,
  elHasClass,
  elRemoveClass,
  removeAllChildren,
  removeElement,
} from './_utils';

/**
 * FUNCTIONS FOR `SHOW` VIEWS
 */

/**
 * Accesses the mapped location data to determine the URL to use for linkage
 * @param {Object} itemLocation
 * @return {(HTMLElement)}
 */
function createLocationLink(itemLocation) {
  const locationData = getLocationData(itemLocation.code);
  const locationText = locationData.name ? locationData.name : itemLocation.name;
  const linkText = locationData.linkText ? locationData.linkText : itemLocation.name;
  if (locationData && locationData.url) {
    const newEl = document.createElement('a');
    newEl.textContent = locationText;
    newEl.href = locationData.url;
    newEl.title = linkText;
    newEl.target = '_blank';
    newEl.setAttribute('ga-on', 'click');
    newEl.setAttribute('ga-event-category', 'Bib Record');
    newEl.setAttribute('ga-event-action', 'Availability location link click');
    newEl.setAttribute('ga-event-label', locationText);
    return newEl;
  }
  const newEl = document.createElement('span');
  newEl.textContent = locationText;
  return newEl;
}

/**
 * Accesses the mapped item status to add a tooltip and create an element
 * @param {Object} itemStatus
 * @param {int} holdCount
 * @return {(HTMLElement)}
 */
function createStatusElement(itemStatus, holdCount) {
  const statusCode = itemStatus.code;
  const statusDueDate = itemStatus.duedate;
  const statusData = getStatusData(statusCode);
  const newEl = document.createElement('span');
  const statusEl = document.createElement('div');
  const holdEl = document.createElement('div');
  const onHold = holdCount > 0;

  elAddClass(statusEl, 'status-text');

  if (onHold) {
    elAddClass(holdEl, 'hold-text', 'tooltip-nolink');
    holdEl.textContent = `On Hold (${holdCount} ${holdCount > 1 ? 'Holds' : 'Hold'})`;
    holdEl.dataset.title = `${holdCount} other patron${holdCount > 1 ? 's have' : ' has'} requested this item and ${holdCount > 1 ? 'are' : ' is'} queued to check it out before it becomes available.`;
    holdEl.dataset.toggle = 'tooltip';
    newEl.append(holdEl);

    // If the item status is available and not checked out, return the hold message
    if (statusCode === '-' && !statusDueDate) {
      return newEl;
    }
  }

  // If the item is checked out
  if (statusDueDate) {
    const dueDate = moment(itemStatus.duedate).format('MMM DD, YYYY');
    statusEl.innerHTML = `Checked out</br>Due ${dueDate}`;
    newEl.prepend(statusEl);
    return newEl;
  }

  // Use the status label if present, otherwise the item display
  if (statusData && statusData.label) {
    statusEl.textContent = statusData.label;
    newEl.prepend(statusEl);
  } else {
    statusEl.textContent = itemStatus.display;
    newEl.prepend(statusEl);
  }

  // Add a tooltip for the status description if present
  if (statusData && statusData.desc) {
    elAddClass(statusEl, 'tooltip-nolink');
    statusEl.dataset.title = statusData.desc;
    statusEl.dataset.toggle = 'tooltip';
  }

  return newEl;
}

/**
 * Determine whether to show the request column if one of the items is not an online item
 * @param {(HTMLElement|Element)} itemEl
 * @param {Object} itemStatus
 * @return {Boolean} Whether to show the request column
 */
function shouldShowRequestColumn(itemEl, itemStatus) {
  if (itemStatus.code === 'w') return false;
  const availTableBody = itemEl.parentNode;
  const availRows = availTableBody.querySelectorAll('.item-row');
  let requestColumn = false;

  availRows.forEach((el) => {
    if (el.dataset.itemRequestability) {
      requestColumn = true;
    }
  });
  return requestColumn;
}

/**
 * Reveal the request column for all items
 * @param {(HTMLElement|Element)} itemEl
 */
function revealRequestColumn(itemEl) {
  const availTableBody = itemEl.parentNode;
  const availTable = availTableBody.parentNode;
  const requestEls = availTable.querySelectorAll('.blacklight-request.d-none');

  requestEls.forEach((el) => {
    elRemoveClass(el, 'd-none');
  });
}

/**
 * Updates the status element for an item, including due date
 * @param {(HTMLElement|Element|Node)} itemEl
 * @param {Object} itemStatus
 * @param {int} holdCount
 */
function updateStatusElement(itemEl, itemStatus = null, holdCount = 0) {
  const availabilityEl = itemEl.querySelector('.blacklight-availability.result__value');

  if (!itemStatus) {
    availabilityEl.innerText = 'Ask at the Service Desk';
    return;
  }

  availabilityEl.dataset.statusCode = itemStatus.code;
  removeAllChildren(availabilityEl);
  availabilityEl.appendChild(createStatusElement(itemStatus, holdCount));

  // Show the Request column if this isn't an online only record
  if (shouldShowRequestColumn(itemEl, itemStatus)) {
    revealRequestColumn(itemEl);
  }
}

/**
 * Updates the location element for an item and calls function to update Aeon URL if necessary
 * @param {(HTMLElement|Element|Node)} itemEl
 * @param {Object} itemLocation
 */
function updateLocationElement(itemEl, itemLocation) {
  if (!itemLocation) return;

  const locationEl = itemEl.querySelector('.blacklight-location.result__value');

  locationEl.dataset.locationCode = itemLocation.code;

  // Check for location tooltip that would override status tooltip
  if (getLocationData(itemLocation.code).statusText) {
    const statusSpan = itemEl.querySelector('.blacklight-availability .status-text');
    if (statusSpan) {
      statusSpan.dataset.title = getLocationData(itemLocation.code).statusText;
    }
  }

  // Aeon request URLs must be updated to include data from the Sierra API call
  if (itemEl.dataset.itemRequestability === 'aeon') {
    const linkEl = itemEl.querySelector('.request-aeon');
    linkEl.href = updateAeonRequestUrl(linkEl.href, itemLocation);
  } else if (itemEl.dataset.itemRequestability === 'catalog') {
    const linkEl = itemEl.querySelector('.request-catalog');
    linkEl.dataset.aeonUrl = updateAeonRequestUrl(linkEl.dataset.aeonUrl, itemLocation);
  }

  locationEl.appendChild(createLocationLink(itemLocation));
}

function addNoItemsMessage() {
  const itemAvailabilityCard = document.querySelector('.item-availability');
  const cardBody = itemAvailabilityCard.querySelector('.card-body');
  const newEl = document.createElement('div');

  newEl.innerHTML = 'No items found. Please contact the <a target="_blank" href="https://library.unt.edu/willis/service-desk/">Willis Library Service Desk</a> for assistance';
  cardBody.appendChild(newEl);
}

function checkMoreLink() {
  const availTable = document.querySelector('#availabilityTable');
  const moreItemsTable = availTable.querySelector('tbody#moreItems');
  if (moreItemsTable === null) return;
  const moreLessButton = availTable.querySelector('tbody#moreLessButton');

  if (moreItemsTable.childElementCount === 0 && !elHasClass(moreLessButton, 'd-none')) {
    elAddClass(moreLessButton, 'd-none');
  } else {
    elRemoveClass(moreLessButton, 'd-none');
  }
}

function checkEmptyTable() {
  const availTable = document.querySelector('#availabilityTable');
  if (availTable === null) return;
  const primaryItems = availTable.querySelectorAll('tbody#primaryItems .item-row');
  const moreItems = availTable.querySelectorAll('tbody#moreItems .item-row');

  if (primaryItems.length === 0 && moreItems.length === 0) {
    removeElement(availTable);
    addNoItemsMessage();
  }
}

/**
 * Checks if the list of links includes a fulltext link, indicating that this is an online only item
 * @returns {boolean}
 */
function isOnlineOnly() {
  const links = document.querySelectorAll('[data-link-type=\'fulltext\'].link-media-item');
  return links.length > 0;
}

function repositionItemElements() {
  const availTable = document.querySelector('#availabilityTable');
  const primaryItems = availTable.querySelector('#primaryItems');
  const moreItems = availTable.querySelector('#moreItems');
  if (moreItems === null) return;

  const primaryMax = 3;
  const primaryCount = primaryItems.querySelectorAll('.item-row').length;

  if (primaryCount < primaryMax) {
    for (let i = 0; i < 3 - primaryCount; i += 1) {
      const firstItem = moreItems.querySelector('.item-row');
      if (firstItem !== null) {
        firstItem.parentNode.removeChild(firstItem);
        primaryItems.appendChild(firstItem);
      }
    }
  }
}

function updateItemIndices() {
  const availTable = document.querySelector('#availabilityTable');
  if (availTable === null) return;
  const itemRows = availTable.querySelectorAll('.item-row');

  itemRows.forEach((itemEl, index) => {
    // eslint-disable-next-line no-param-reassign
    itemEl.dataset.itemIndex = index;
  });
}

function updateCatalogRequestURLs() {
  const availTable = document.querySelector('#availabilityTable');
  if (availTable === null) return;
  const itemRows = availTable.querySelectorAll('.item-row');

  itemRows.forEach((row) => {
    if (row.dataset.itemRequestability !== 'catalog') return;

    const rowIndex = row.dataset.itemIndex;
    const requestCell = row.querySelector('.blacklight-request.result__value');
    const requestLink = requestCell.querySelector('a');
    const requestUrl = requestLink.href;
    const catalogUrl = new URL(requestUrl);
    const queryString = catalogUrl.search;

    catalogUrl.search = queryString.replace(/(requestItemIndex=)(\d*)/i, `$1${rowIndex}`);
    requestLink.href = catalogUrl.toString();
  });
}

function updateUIError(items, error = undefined) {
  const availabilityTable = document.querySelector('#availabilityTable');
  if (availabilityTable === null) return;

  items.forEach((item) => {
    const itemEl = availabilityTable.querySelector(`[data-item-id='${item}']`);
    if (itemEl === null) return;
    if (error === 107) {
      removeElement(itemEl);
    } else {
      const availabilityEl = itemEl.querySelector('.blacklight-availability.result__value');
      availabilityEl.innerText = 'Ask at the Service Desk';
    }
  });
  if (error === 107) {
    updateItemIndices();
    repositionItemElements();
    updateCatalogRequestURLs();
  }
}

/**
 * Calls UI update functions for items returned by the Sierra API as well as those missing
 * @param {Array} foundItems
 * @param {Array} missingItems
 */
function updateUI(foundItems = [], missingItems = []) {
  const availabilityTable = document.querySelector('#availabilityTable');
  if (availabilityTable === null) return;

  foundItems.forEach((item) => {
    const itemEl = availabilityTable.querySelector(`[data-item-id='${item.id}']`);
    if (itemEl === null) return;
    updateStatusElement(itemEl, item.status, item.holdCount);
    updateLocationElement(itemEl, item.location);
  });

  missingItems.forEach((item) => {
    const itemEl = availabilityTable.querySelector(`[data-item-id='${item}']`);
    if (itemEl === null) return;
    removeElement(itemEl);
    // console.log(`Item ${item} not returned by the API`);
  });

  if (missingItems.length > 0) {
    updateItemIndices();
    repositionItemElements();
    updateCatalogRequestURLs();
  }
}

/**
 * Update UI elements for items that are "fake" and should not be included in the API call
 */
function updateNoApiItems() {
  const noApiElements = getPlaceholderItemsElements();

  noApiElements.forEach((item) => {
    const locationEl = item.querySelector('.blacklight-location.result__value');
    if (locationEl === null) return;
    const availEl = item.querySelector('.blacklight-availability.result__value');

    if (isOnlineOnly()) {
      // Set specific status and location codes to get the data we want.
      const itemStatus = { code: 'w' };
      const itemLoc = { code: 'lwww' };
      updateStatusElement(item, itemStatus);
      updateLocationElement(item, itemLoc);
    } else {
      const locationCode = locationEl.dataset.itemLocation;
      const locationData = getLocationData(locationCode);
      const serviceDesk = getServiceDeskData(locationCode);
      locationData.code = locationCode;
      updateLocationElement(item, locationData);
      availEl.innerHTML = `Unknown: Contact the <a href="${serviceDesk.url}" target="_blank">Service Desk</a>`;
    }
  });
}

/**
 * Main function for checking availability on Show view.
 * @returns {Promise<void>}
 */
async function checkAvailability() {
  const chunkedItemBibs = getItemsIDs();
  let allItemBibs = chunkedItemBibs.flat();

  updateNoApiItems();

  // Create a map of chunked bib numbers that will return promises
  const promises = chunkedItemBibs.map(async (chunk) => {
    try {
      return await callSierraApi(chunk);
    } catch (error) {
      // Update items that returned a Sierra API error and remove them from further UI updates
      // console.log(`Sierra API error ${error.code}: ${error.name}`);
      updateUIError(chunk, error.code);
      allItemBibs = allItemBibs.filter((el) => !chunk.includes(el));
      return error;
    }
  });

  await Promise.allSettled(promises)
    .then((result) => {
      let foundItems = itemsFromPromises(result);

      // Error from the Sierra API
      if (foundItems[0] === undefined) {
        foundItems = [];
      }

      const missingItems = findMissing(foundItems, allItemBibs);
      updateUI(foundItems, missingItems);
    }).finally(() => {
      checkMoreLink();
      checkEmptyTable();
    });
}

export {
  // eslint-disable-next-line import/prefer-default-export
  checkAvailability,
};
