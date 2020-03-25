import moment from 'moment';
import {
  callSierraApi, findMissing, getItemsIDs, getLocationData, getPlaceholderItemsElements, getStatusData,
  updateAeonRequestUrl,
} from './_availability_util';
import { elAddClass, elRemoveClass } from './_utils';

/**
 * FUNCTIONS FOR `INDEX` VIEWS
 */

function updateIndexStatusElement(itemEl, item = null) {
  const availabilityEl = itemEl.querySelector('.blacklight-availability.result__value');
  const availabilityBtn = availabilityEl.querySelector('.btn');
  const availabilityText = availabilityEl.querySelector('.availability-text');
  let itemStatus = null;
  let itemLocation = null;

  if (item) {
    itemStatus = item.status;
    itemLocation = item.location;
  }

  if (!itemStatus) {
    availabilityBtn.innerText = 'Not Available';
    availabilityText.innerText = 'ASK AT SERVICE DESK';
    elRemoveClass(availabilityText, 'd-none');
    return;
  }

  const statusCode = itemStatus.code;
  const statusDueDate = itemStatus.duedate;
  const statusData = getStatusData(statusCode);

  availabilityEl.dataset.statusCode = statusCode;

  if (statusData) {
    const statusDesc = statusData.desc;
    const statusBtnClass = statusData.btnClass;
    const statusDisplay = statusData.label;

    if (statusCode !== 'w') {
      const callNumberEl = itemEl.querySelector('.blacklight-call-number.result__value');
      elRemoveClass(callNumberEl, 'd-none');
    }

    if (statusBtnClass) {
      elRemoveClass(availabilityBtn, 'loading', 'disabled');
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
    const locationText = locationData.abbr ? locationData.abbr : locationData.name;

    availabilityEl.dataset.locationCode = itemLocation.code;

    // Aeon request URLs must be updated to include data from the Sierra API call
    if (itemEl.dataset.itemRequestability === 'aeon') updateAeonRequestUrl(itemEl, itemLocation);

    if (locationText) {
      availabilityBtn.append(` - ${locationText}`);
    }
  }
}

function updateIndexUIError(items) {
  items.forEach((item) => {
    const itemEl = document.querySelector(`[data-item-id='${item}']`);
    if (itemEl === null) return;
    const availabilityEl = itemEl.querySelector('.blacklight-availability.result__value');
    const availabilityBtn = availabilityEl.querySelector('.btn');
    availabilityBtn.innerText = 'Ask at the Service Desk';
  });
}

/**
 * Calls UI update functions for items returned by the Sierra API as well as those missing
 * @param {Array} foundItems
 * @param {Array} missingItems
 */
function updateIndexUI(foundItems = [], missingItems = []) {
  foundItems.forEach((item) => {
    const itemEl = document.querySelector(`[data-item-id='${item.id}']`);
    if (itemEl === null) return;
    updateIndexStatusElement(itemEl, item);
  });

  missingItems.forEach((item) => {
    const itemEl = document.querySelector(`[data-item-id='${item}']`);
    updateIndexStatusElement(itemEl);
    console.log(`Item ${item} not returned by the API`);
  });
}

function updateIndexNoApiItems() {
  const noApiElements = getPlaceholderItemsElements();

  noApiElements.forEach((item) => {
    const availabilityTextEl = item.querySelector('.availability-text');
    const locationCode = availabilityTextEl.dataset.itemLocation;
    const locationData = getLocationData(locationCode);
    availabilityTextEl.innerText = `Ask at the ${locationData.name} service desk`;
  });
}

function checkAvailability() {
  const itemBibs = getItemsIDs();

  updateIndexNoApiItems();

  itemBibs.forEach((chunk) => {
    callSierraApi(chunk, (response) => {
      if (response.httpStatus) {
        console.log(`Sierra API error ${response.code}: ${response.name}`);
        updateIndexUIError(chunk);
      } else {
        const foundItems = response.entries;
        const missingItems = findMissing(foundItems, chunk);
        updateIndexUI(foundItems, missingItems);
      }
    });
  });
}

export {
  checkAvailability,
};
