import moment from 'moment';

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

  const itemBibs = itemsArray.map(el => el.dataset.itemId.replace(/\D/g, ''));
  return chunkArray(itemBibs, 50);
}

function findMissing(foundItems = [], allItems) {
  const foundIDs = foundItems.map(el => el.id);
  return allItems.filter(el => !foundIDs.includes(el));
}

function updateUI(foundItems = [], missingItems = []) {
  foundItems.forEach((item) => {
    const itemEl = document.querySelector(`[data-item-id='${item.id}']`);

    // Update the location field if the API returned location data
    if (item.location) {
      const locationEl = itemEl.querySelector('.blacklight-location.result__value');
      locationEl.dataset.locationCode = item.location.code;
      locationEl.innerText = item.location.name;
    }

    // Update the status field whether or not the API returned status data
    const availabilityEl = itemEl.querySelector('.blacklight-availability.result__value');
    if (item.status) {
      availabilityEl.dataset.statusCode = item.status.code;

      // If the item is checked out
      if (item.status.duedate) {
        const dueDate = moment(item.status.duedate).format('MMM DD, YYYY');
        availabilityEl.innerText = `Checked out\nDue ${dueDate}`;
      } else {
        availabilityEl.innerText = item.status.display;
      }

      // Show the Request column if this isn't an online only record
      if (item.status.code !== 'w') {
        const availTableBody = itemEl.parentNode;
        const availTable = availTableBody.parentNode;
        const requestEls = availTable.querySelectorAll('.blacklight-request.d-none');

        if (requestEls) {
          requestEls.forEach((node) => {
            node.classList.remove('d-none');
          });
        }
      }
    } else {
      availabilityEl.innerText = 'ASK AT SERVICE DESK';
    }
  });

  // Update the data for items that were not found by the API
  missingItems.forEach((item) => {
    const itemEl = document.querySelector(`[data-item-id='${item}']`);
    const locationEl = itemEl.querySelector('.blacklight-location.result__value');
    const availabilityEl = itemEl.querySelector('.blacklight-availability.result__value');
    availabilityEl.innerText = 'ASK AT SERVICE DESK';
    console.log(`Item ${item.id} not returned by the API`);
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
