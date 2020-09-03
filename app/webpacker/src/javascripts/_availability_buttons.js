import moment from 'moment';
import {
  callSierraApi, findMissing, getItemsIDs, getLocationData, getPlaceholderItemsElements,
  getServiceDeskData, getStatusData, itemsFromPromises,
} from './_availability_util';
import { elAddClass, elRemoveClass, removeElement } from './_utils';

/**
 * FUNCTIONS FOR `INDEX` VIEWS
 */

function updateStatusElement(itemEl, item = null) {
  if (itemEl === null) return;
  const availabilityEl = itemEl.querySelector('.blacklight-availability.result__value');
  const availabilityBtn = availabilityEl.querySelector('.availability-btn');
  const availabilityText = availabilityEl.querySelector('.availability-text');
  let itemStatus = null;
  let itemLocation = null;

  if (item) {
    itemStatus = item.status;
    itemLocation = item.location;
  }

  if (!itemStatus) {
    removeElement(itemEl);
    return;
  }

  const statusCode = itemStatus.code;
  const isOnlineItem = statusCode === 'w';
  const statusDueDate = itemStatus.duedate;
  const statusData = getStatusData(statusCode);

  availabilityEl.dataset.statusCode = statusCode;

  if (statusData) {
    const statusDesc = statusData.desc;
    const statusBtnClass = statusData.btnClass;
    const statusDisplay = statusData.label;

    // Hide the button if it's online, we already have buttons for that
    if (isOnlineItem) {
      elAddClass(availabilityEl, 'd-none');
      elAddClass(itemEl, 'm-0', 'p-0');
      return;
    }

    if (statusBtnClass) {
      elRemoveClass(availabilityBtn,'disabled');
      elAddClass(availabilityBtn, statusBtnClass);
    }

    // If the item is checked out
    if (statusDueDate) {
      const dueDate = moment(itemStatus.duedate).format('MMM DD, YYYY');
      availabilityBtn.innerText = 'Checked Out';
      availabilityText.innerText = `Due ${dueDate}`;
      availabilityBtn.setAttribute('ga-event-label', availabilityBtn.innerText);
      elRemoveClass(availabilityText, 'd-none');
      elRemoveClass(availabilityBtn, 'available');
      elAddClass(availabilityBtn, 'checked-out');
    }

    if (statusDesc && !statusDueDate) {
      availabilityBtn.innerText = statusDisplay;
      availabilityBtn.dataset.toggle = 'tooltip';
      availabilityBtn.dataset.title = statusDesc;
      availabilityBtn.setAttribute('ga-event-label', availabilityBtn.innerText);
    }
  } else {
    availabilityBtn.innerText = itemStatus.display;
    availabilityBtn.setAttribute('ga-event-label', availabilityBtn.innerText);
  }

  if (itemLocation) {
    const locationData = getLocationData(itemLocation.code);
    const locationText = locationData.abbr ? locationData.abbr : locationData.name;

    availabilityEl.dataset.locationCode = itemLocation.code;

    if (locationText && !isOnlineItem) {
      availabilityBtn.append(` - ${locationText}`);
      availabilityBtn.setAttribute('ga-event-label', availabilityBtn.innerText);

      // Check for location tooltip that would override status tooltip
      if (locationData.statusText) {
        availabilityBtn.dataset.title = locationData.statusText;
      }
      if (locationData.btnClass) elAddClass(availabilityBtn, `location-${locationData.btnClass}`);
    }
  }
}

/**
 * If no buttons remain but "more" items exist, hide "more" button and show "check availability"
 */
function checkForNoButtons() {
  const buttonContainers = document.querySelectorAll('.item-availability');

  buttonContainers.forEach((container) => {
    const buttons = container.querySelectorAll('div.result__field');

    if (buttons.length === 0) {
      const moreButton = container.querySelector('div.more-items-available');
      if (moreButton !== null) {
        if (moreButton.parentNode) {
          removeElement(moreButton);
        }
      }

      const checkButton = container.querySelector('.check-availability');
      elRemoveClass(checkButton, 'd-none');
    }
  });
}

/**
 * Remove duplicate buttons within availability section
 */
function combineDuplicates() {
  const buttonContainers = document.querySelectorAll('.item-availability');

  buttonContainers.forEach((container) => {
    const availInfo = container.querySelectorAll('.result__field');
    if (availInfo.length === 0) return;

    const usedText = [];
    availInfo.forEach((infoEl) => {
      const { innerText } = infoEl;
      if (usedText.includes(innerText)) {
        removeElement(infoEl);
      } else {
        usedText.push(innerText);
      }
    });
  });
}

function updateUIError(items, error = undefined) {
  const documentsEl = document.querySelector('#documents');

  items.forEach((item) => {
    const itemEls = documentsEl.querySelectorAll(`[data-item-id='${item}']`);
    if (itemEls.length === 0) return;

    if (error === 107) {
      itemEls.forEach((node) => {
        removeElement(node);
      });
    } else {
      itemEls.forEach((node) => {
        const availabilityEl = node.querySelector('.blacklight-availability.result__value');
        const availabilityBtn = availabilityEl.querySelector('.availability-btn');
        availabilityBtn.innerText = 'Ask at the Service Desk';
      });
    }
  });
}

/**
 * Calls UI update functions for items returned by the Sierra API as well as those missing
 * @param {Array} foundItems
 * @param {Array} missingItems
 */
function updateUI(foundItems = [], missingItems = []) {
  const documentsEl = document.querySelector('#documents');

  foundItems.forEach((item) => {
    const itemEls = documentsEl.querySelectorAll(`[data-item-id='${item.id}']`);
    if (itemEls.length === 0) return;
    itemEls.forEach((node) => {
      updateStatusElement(node, item);
    });
  });

  missingItems.forEach((item) => {
    const itemEls = documentsEl.querySelectorAll(`[data-item-id='${item}']`);
    if (itemEls.length === 0) return;
    itemEls.forEach((node) => {
      updateStatusElement(node);
    });
    // console.log(`Item ${item} not returned by the API`);
  });
}

/**
 * Update UI elements for items that are "fake" and should not be included in the API call
 */
function updateNoApiItems() {
  const noApiElements = getPlaceholderItemsElements();

  noApiElements.forEach((item) => {
    const availabilityTextEl = item.querySelector('.availability-text');
    const locationCode = availabilityTextEl.dataset.itemLocation;
    const serviceDesk = getServiceDeskData(locationCode);
    availabilityTextEl.innerHTML = `Ask at the <a href="${serviceDesk.url}" target="_blank">${serviceDesk.name}</a>`;
  });
}

function revealButtonContainers() {
  const documentsList = document.querySelector('#documents');
  const buttonContainers = documentsList.querySelectorAll('.item-availability');

  buttonContainers.forEach((node) => {
    const parent = node.parentNode;
    const loading = parent.querySelector('.item-loading-spinner');
    if (loading === null) return;

    loading.addEventListener('transitionend', () => {
      removeElement(loading);
      elAddClass(node, 'show');
    });
    elAddClass(loading, 'hide');
  });
}

/**
 * Main function for checking availability on Index view.
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
    })
    .finally(() => {
      checkForNoButtons();
      combineDuplicates();
      revealButtonContainers();
    });
}

export {
  // eslint-disable-next-line import/prefer-default-export
  checkAvailability,
};
