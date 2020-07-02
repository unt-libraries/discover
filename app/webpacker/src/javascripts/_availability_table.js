import moment from 'moment';
import {
  callSierraApi, findMissing, getItemsIDs, getLocationData, getPlaceholderItemsElements,
  getStatusData, updateAeonRequestUrl,
} from './_availability_util';
import { elRemoveClass, removeAllChildren } from './_utils';

/**
 * FUNCTIONS FOR `SHOW` VIEWS
 */

/**
 * Accesses the mapped location data to determine the URL to use for linkage
 * @param {Object} itemLocation
 * @return {(HTMLElement)}
 */
function createShowLocationLink(itemLocation) {
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
 * @return {(HTMLElement)}
 */
function createShowStatusElement(itemStatus) {
  const statusCode = itemStatus.code;
  const statusDueDate = itemStatus.duedate;
  const statusData = getStatusData(statusCode);
  const newEl = document.createElement('span');

  // If the item is checked out
  if (statusDueDate) {
    const dueDate = moment(itemStatus.duedate).format('MMM DD, YYYY');
    newEl.innerHTML = `Checked out</br>Due ${dueDate}`;
    return newEl;
  }

  if (statusData && statusData.label) {
    newEl.textContent = statusData.label;
  } else {
    newEl.textContent = itemStatus.display;
  }

  if (statusData && statusData.desc) {
    newEl.classList.add('tooltip-nolink');
    newEl.dataset.title = statusData.desc;
    newEl.dataset.toggle = 'tooltip';
  }

  return newEl;
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
  removeAllChildren(availabilityEl);
  availabilityEl.appendChild(createShowStatusElement(itemStatus));

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

  // Check for location tooltip that would override status tooltip
  if (getLocationData(itemLocation.code).statusText) {
    const statusSpan = itemEl.querySelector('.blacklight-availability .tooltip-nolink');
    statusSpan.dataset.title = getLocationData(itemLocation.code).statusText;
  }

  // Aeon request URLs must be updated to include data from the Sierra API call
  if (itemEl.dataset.itemRequestability === 'aeon') updateAeonRequestUrl(itemEl, itemLocation);

  locationEl.appendChild(createShowLocationLink(itemLocation));
}

function updateShowUIError(items) {
  items.forEach((item) => {
    const itemEl = document.querySelector(`[data-item-id='${item}']`);
    if (itemEl === null) return;
    const availabilityEl = itemEl.querySelector('.blacklight-availability.result__value');
    availabilityEl.innerText = 'Ask at the Service Desk';
  });
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
}

function updateShowNoApiItems() {
  const noApiElements = getPlaceholderItemsElements();

  noApiElements.forEach((item) => {
    const locationEl = item.querySelector('.blacklight-location.result__value');
    const locationCode = locationEl.dataset.itemLocation;
    const locationData = getLocationData(locationCode);
    locationEl.innerText = `Ask at the ${locationData.name} service desk`;
  });
}

function checkAvailability() {
  const itemBibs = getItemsIDs();

  updateShowNoApiItems();

  itemBibs.forEach((chunk) => {
    callSierraApi(chunk, (response) => {
      if (response.httpStatus) {
        console.log(`Sierra API error ${response.code}: ${response.name}`);
        updateShowUIError(chunk);
      } else {
        const foundItems = response.entries;
        const missingItems = findMissing(foundItems, chunk);
        updateShowUI(foundItems, missingItems);
      }
    });
  });
}

export {
  // eslint-disable-next-line import/prefer-default-export
  checkAvailability,
};
