import moment from 'moment';
import { elRemoveClass } from './_utils';
import { locationMapUrls } from './data/_availability_data';

function chunkArray(arr, chunkSize) {
  const chunkedArray = [];
  while (arr.length) {
    chunkedArray.push(arr.splice(0, chunkSize));
  }
  return chunkedArray;
}

function getItemsIDs() {
  const itemEls = document.querySelectorAll('[data-item-id]');
  const itemsArray = Array.from(itemEls);

  const itemBibs = itemsArray.map((el) => el.dataset.itemId.replace(/\D/g, ''));
  return chunkArray(itemBibs, 50);
}

function findMissing(foundItems = [], allItems) {
  const foundIDs = foundItems.map((el) => el.id);
  return allItems.filter((el) => !foundIDs.includes(el));
}

function getLocationUrl(locationCode) {
  if (Object.hasOwnProperty.call(locationMapUrls, locationCode)) {
    return locationMapUrls[locationCode].url;
  }
  return false;
}

function updateStatusElement(itemEl, itemStatus) {
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

    availRows.forEach((node) => {
      if (node.dataset.itemRequestability) {
        requestColumn = true;
      }
    });

    if (requestColumn) {
      requestEls.forEach((node) => {
        elRemoveClass(node, 'd-none');
      });
    }
  }
}

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
    updateLocationElement(itemEl);
    console.log(`Item ${item} not returned by the API`);
  });
}

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
