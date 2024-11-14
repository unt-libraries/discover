import moment from 'moment';
import {
  callSierraApi, findMissing, getItemsIDs, getLocationData, getPlaceholderItemsElements,
  getServiceDeskData, getStatusData, itemsFromPromises,
} from './_availability_util';
import {
  StatusData, LocationData, ApiEntry,
} from './@typings/interfaces.d';

/**
 * FUNCTIONS FOR `INDEX` VIEWS
 */
function updateStatusElement(itemEl: HTMLElement, item: ApiEntry | null = null): void {
  if (itemEl === null) return;
  const availabilityEl: HTMLElement | null = itemEl.querySelector('.blacklight-availability.result__value');
  if (availabilityEl === null) return;
  const availabilityBtn: HTMLElement | null = availabilityEl.querySelector('.availability-btn');
  const availabilityText: HTMLElement | null = availabilityEl.querySelector('.availability-text');
  let itemStatus;
  let itemLocation;
  let holdCount = 0;
  let onHold;

  if (item) {
    itemStatus = item.status;
    itemLocation = item.location;
    holdCount = item.holdCount;
    onHold = holdCount > 0;
  }

  if (!itemStatus) {
    itemEl.remove();
    return;
  }

  const statusCode = itemStatus.code;
  const isOnlineItem = statusCode === 'w' || (itemLocation && itemLocation.code.endsWith('www'));
  const statusDueDate = itemStatus.duedate;
  const statusData: StatusData[keyof StatusData] | null = getStatusData(statusCode);

  if (availabilityEl) {
    availabilityEl.dataset.statusCode = statusCode;
  }

  if (statusData) {
    let statusDesc;
    let statusBtnClass: string;
    let statusDisplay;

    if (onHold && statusCode === '-') {
      statusDesc = `${holdCount} other patron${holdCount > 1 ? 's have' : ' has'} requested this item and ${holdCount > 1 ? 'are' : ' is'} queued to check it out before it becomes available.`;
      statusBtnClass = 'checked-out';
      statusDisplay = 'On Hold';
    } else {
      statusDesc = statusData.desc;
      statusBtnClass = statusData.btnClass;
      statusDisplay = statusData.label;
    }

    // Hide the button if it's online, we already have buttons for that
    if (isOnlineItem) {
      availabilityEl.classList.add('d-none');
      itemEl.classList.add('m-0', 'p-0');
      return;
    }

    if (statusBtnClass && availabilityBtn) {
      availabilityBtn.classList.remove('disabled');
      availabilityBtn.classList.add(statusBtnClass);
    }

    // If the item is checked out
    if (statusDueDate && availabilityBtn && availabilityText) {
      const dueDate = moment(itemStatus.duedate).format('MMM DD, YYYY');
      availabilityBtn.innerText = 'Checked Out';
      availabilityText.innerText = `Due ${dueDate}`;
      availabilityBtn.setAttribute('ga-event-label', availabilityBtn.innerText);
      availabilityText.classList.remove('d-none');
      availabilityBtn.classList.remove('available');
      availabilityBtn.classList.add('checked-out');
    }

    if (statusDesc && !statusDueDate && availabilityBtn) {
      availabilityBtn.innerText = statusDisplay;
      availabilityBtn.dataset.toggle = 'tooltip';
      availabilityBtn.dataset.title = statusDesc;
      availabilityBtn.setAttribute('ga-event-label', availabilityBtn.innerText);
    }
  } else {
    // eslint-disable-next-line no-lonely-if
    if (availabilityBtn) {
      availabilityBtn.innerText = itemStatus.display;
      availabilityBtn.setAttribute('ga-event-label', itemStatus.display);
    }
  }

  if (itemLocation) {
    const locationData: LocationData[keyof LocationData] = getLocationData(itemLocation.code);
    const locationText: string = locationData.abbr ? locationData.abbr : (locationData.name || '');

    availabilityEl.dataset.locationCode = itemLocation.code;

    if (locationText && !isOnlineItem) {
      availabilityBtn?.append(` - ${locationText}`);
      availabilityBtn?.setAttribute('ga-event-label', availabilityBtn.innerText);

      // Check for location tooltip that would override status tooltip
      if ((locationData.statusText || locationData.modalText) && availabilityBtn) {
        if (locationData.modalText) {
          availabilityBtn.dataset.title = locationData.modalText;
          const elIcon = document.createElement('i');
          elIcon.classList.add('icon', 'fal', `fa-info-circle`);
          elIcon.style.marginLeft = '0.25em';
          availabilityBtn?.append(elIcon);
        } else {
          availabilityBtn.dataset.title = locationData.statusText;
        }
      }
      if (locationData.btnClass) availabilityBtn?.classList.add(`location-${locationData.btnClass}`);
    }
  }
}

/**
 * If no buttons remain but "more" items exist, hide "more" button and show "check availability"
 */
function checkForNoButtons(): void {
  const buttonContainers = document.querySelectorAll('.item-availability');

  buttonContainers.forEach((container: Element) => {
    const buttons = container.querySelectorAll('div.result__field');

    if (buttons.length === 0) {
      const moreButton = container.querySelector('div.more-items-available');
      if (moreButton !== null) {
        if (moreButton.parentNode) {
          moreButton.remove();
        }
      }

      const checkButton = container.querySelector('.check-availability');
      if (checkButton) {
        checkButton.classList.remove('d-none');
      }
    }
  });
}

/**
 * Checks if the buttons include an online button, indicating that this is an online only item
 * @returns {boolean}
 */
function isOnlineOnly(item: Element): boolean {
  const parent = item.parentNode;
  if (parent) {
    const onlineButtons = parent.querySelectorAll('[data-online].result__field');
    return onlineButtons.length > 0;
  }
  return false;
}

/**
 * Remove duplicate buttons within availability section
 */
function combineDuplicates(): void {
  const buttonContainers = document.querySelectorAll('.item-availability');

  buttonContainers.forEach((container: Element) => {
    const availInfo = container.querySelectorAll('.result__field');
    if (availInfo.length === 0) return;

    const usedText: string[] = [];
    availInfo.forEach((infoEl: Element) => {
      const { textContent } = infoEl;
      if (textContent) {
        if (usedText.includes(textContent)) {
          infoEl.remove();
        } else {
          usedText.push(textContent);
        }
      }
    });
  });
}

function updateUIError(items: string[], error?: number): void {
  const documentsEl = document.querySelector('#documents');
  if (documentsEl === null) return;

  items.forEach((item: string) => {
    const itemEls: NodeListOf<HTMLElement> = documentsEl.querySelectorAll(`[data-item-id='${item}']`);
    if (itemEls && itemEls.length === 0) return;

    if (error === 107) {
      itemEls.forEach((node: HTMLElement) => {
        node.remove();
      });
    } else {
      itemEls.forEach((node: HTMLElement) => {
        const availabilityEl: HTMLElement | null = node.querySelector('.blacklight-availability.result__value');
        const availabilityBtn: HTMLElement | null | undefined = availabilityEl?.querySelector('.availability-btn');
        if (availabilityBtn) {
          availabilityBtn.innerText = 'Ask at the Service Desk';
        }
      });
    }
  });
}

/**
 * Calls UI update functions for items returned by the Sierra API as well as those missing
 * @param {Array} foundItems
 * @param {Array} missingItems
 */
function updateUI(foundItems: ApiEntry[] = [], missingItems: string[] = []): void {
  const documentsEl = document.querySelector('#documents');
  if (documentsEl === null) return;

  foundItems.forEach((item: ApiEntry) => {
    if (item === undefined) return;
    const itemEls: NodeListOf<HTMLElement> = documentsEl.querySelectorAll(`[data-item-id='${item.id}']`);
    if (itemEls.length === 0) return;
    itemEls.forEach((node: HTMLElement) => {
      updateStatusElement(node, item);
    });
  });

  missingItems.forEach((item: string) => {
    const itemEls: NodeListOf<HTMLElement> = documentsEl.querySelectorAll(`[data-item-id='${item}']`);
    if (itemEls.length === 0) return;
    itemEls.forEach((node: HTMLElement) => {
      updateStatusElement(node);
    });
  });
}

/**
 * Update UI elements for items that are "fake" and should not be included in the API call
 */
function updateNoApiItems(): void {
  const noApiElements = getPlaceholderItemsElements();

  noApiElements.forEach((item: HTMLElement) => {
    if (isOnlineOnly(item)) {
      item.remove();
      return;
    }

    const availabilityTextEl: HTMLElement | null = item.querySelector('.availability-text');
    const locationCode: string = availabilityTextEl?.dataset.itemLocation || '';
    const serviceDesk = getServiceDeskData(locationCode);
    if (availabilityTextEl) {
      availabilityTextEl.innerHTML = `Contact <a href="${serviceDesk.url}" target="_blank">${serviceDesk.name}</a>`;
    }
  });
}

function revealButtonContainers(): void {
  const documentsList: HTMLElement | null = document.querySelector('#documents');
  if (documentsList === null) return;
  const buttonContainers: NodeListOf<HTMLElement> = documentsList.querySelectorAll('.item-availability');

  buttonContainers.forEach((node: HTMLElement) => {
    const parent: ParentNode | null = node.parentNode;
    const loading: HTMLElement | null | undefined = parent?.querySelector('.item-loading-spinner');
    if (!loading) return;

    loading.addEventListener('transitionend', () => {
      loading.remove();
      node.classList.add('show');
    });
    loading.classList.add('hide');
  });
}

/**
 * Main function for checking availability on Index view.
 * @returns {Promise<void>}
 */
async function checkAvailability(): Promise<void> {
  const chunkedItemBibs: string[][] = getItemsIDs();
  let allItemBibs: string[] = chunkedItemBibs.flat();

  updateNoApiItems();

  // Create a map of chunked bib numbers that will return promises
  const promises: Promise<ApiEntry[]>[] = chunkedItemBibs.map(async (chunk: string[]) => {
    try {
      return await callSierraApi(chunk);
    } catch (error: any) {
      // Update items that returned a Sierra API error and remove them from further UI updates
      // console.log(`Sierra API error ${error.code}: ${error.name}`);
      updateUIError(chunk, error.code);
      allItemBibs = allItemBibs.filter((el) => !chunk.includes(el));
      return error;
    }
  });

  await Promise.allSettled(promises)
    .then((result: PromiseSettledResult<ApiEntry[]>[]) => {
      let foundItems: ApiEntry[] = itemsFromPromises(result);

      // Error from the Sierra API
      if (foundItems[0] === undefined) {
        foundItems = [];
      }

      const missingItems: string[] = findMissing(foundItems, allItemBibs);
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
