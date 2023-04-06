import { locationData as locationDataRaw } from './data/availability_locations';
import { statusDescData as statusDescDataRaw } from './data/availability_statuses';
import { serviceDeskData } from './data/service_desks';

interface LocationData {
  [key: string]: {
    name?: string;
    abbr?: string;
    linkText?: string;
    url?: string;
    btnClass?: string;
  };
}

interface StatusData {
  [key: string]: {
    label: string;
    desc: string;
    btnClass: string;
  };
}

interface ApiEntry {
  id: string;
  location: {
    code: string;
    name: string;
  };
  status: {
    code: string;
    display: string;
  };
  holdCount: number;
}

interface ItemType {
  id: string;
  status: string;
  location: string;
}

const locationData: LocationData = locationDataRaw;
const statusDescData: StatusData = statusDescDataRaw;

/**
 * Splits an array into chunks of a specified size for more manageable API calls.
 * @param arr - The input array to be chunked.
 * @param chunkSize - The size of the chunks to be created (default: 50).
 * @returns An array containing the chunked arrays.
 */
function chunkArray(arr: any[], chunkSize = 50): any[][] {
  const chunkedArray = [];
  while (arr.length) {
    chunkedArray.push(arr.splice(0, chunkSize));
  }
  return chunkedArray;
}

/**
 * Gets the elements for "fake" items that exist when there are no items to check on Sierra.
 * @returns A NodeList of elements with the 'data-no-api-request' attribute.
 */
// eslint-disable-next-line no-undef
function getPlaceholderItemsElements(): NodeListOf<Element> {
  return document.querySelectorAll('[data-no-api-request]');
}

/**
 * Crawls the DOM to find IDs for every item.
 * @returns An array of chunked item IDs.
 */
function getItemsIDs(): string[][] {
  const itemEls: NodeListOf<HTMLElement> = document.querySelectorAll('[data-item-id]:not([data-item-id=""])');
  const itemsArray: HTMLElement[] = Array.from(itemEls);

  const itemBibs = itemsArray.map((el: HTMLElement) => el.dataset.itemId?.replace(/\D/g, ''));
  return chunkArray(itemBibs, 50);
}

/**
 * Filters the items that were not returned by the Sierra API to determine what is missing.
 * @param foundItems - The items found in the API response.
 * @param allItems - The items present in the DOM.
 * @returns An array containing the missing items.
 */
// eslint-disable-next-line default-param-last
function findMissing(foundItems: ApiEntry[] = [], allItems: string[]): string[] {
  const foundIDs = foundItems.map((el) => {
    if (el !== undefined) {
      return el.id;
    }
    return null;
  });
  return allItems.filter((el) => !foundIDs.includes(el));
}

/**
 * Searches the mapped location data to find the closest matching key.
 * @param locationCode - The location code to match.
 * @returns An object containing location data (merged from exact and wildcard matches).
 */
function getLocationData(locationCode: string): LocationData[keyof LocationData] {
  let exactMatch = {};
  if (Object.hasOwnProperty.call(locationData, locationCode)) {
    exactMatch = locationData[locationCode];
  }

  const wildcardMatches = Object.keys(locationData).filter((key) => key[0] === locationCode[0] && key.endsWith('*'));
  wildcardMatches.sort((a, b) => b.length - a.length);

  let wildcardMatch = {};
  for (let i = 0; i < wildcardMatches.length; i += 1) {
    const wildcard = wildcardMatches[i];
    if (locationCode.startsWith(wildcard.slice(0, -1))) {
      wildcardMatch = locationData[wildcard];
      break;
    }
  }

  return { ...wildcardMatch, ...exactMatch };
}

/**
 * Retrieves status data for a given status code.
 * @param statusCode - The status code to search for.
 * @returns The status data object for the provided status code.
 */
function getStatusData(statusCode: string): StatusData[keyof StatusData] | undefined {
  return statusDescData[statusCode];
}

// Define a new interface for ServiceDeskData
interface ServiceDeskData {
  [key: string]: {
    name: string;
    url: string;
  };
}

/**
 * Retrieves service desk data for a given location code.
 * @param locationCode - The location code to search for.
 * @returns The service desk data object for the provided location code.
 */
function getServiceDeskData(locationCode: string): ServiceDeskData[keyof ServiceDeskData] {
  let serviceDesk;
  Object.entries(serviceDeskData).forEach(([key, value]) => {
    if (locationCode.startsWith(key)) {
      serviceDesk = value;
    }
  });

  if (serviceDesk === undefined) {
    serviceDesk = serviceDeskData.default;
  }
  return serviceDesk;
}

/**
 * Appends required query string parameters to an Aeon URL that require the Sierra API call.
 * @param itemURL - The item URL to be updated.
 * @param itemLocation - The item location data.
 * @returns The updated URL string with added query parameters.
 */
function updateAeonRequestUrl(
  itemURL: string,
  itemLocation: { code: string, name: string },
): string {
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
 * Transforms fulfilled Promises from API response to an array of data objects.
 * @param result - An array of Promises from API response.
 * @returns An array of item data returned by the Sierra API.
 */
function itemsFromPromises(result: Array<any>): any[] {
  return result
    .filter((response) => response.status === 'fulfilled')
    .map((item) => item.value.entries)
    .flat(1);
}

/**
 * Entry point to update availability of items through the Sierra API.
 * @param itemBibs - An array of item bib numbers.
 * @returns A Promise resolving to the Sierra API response.
 */
async function callSierraApi(itemBibs: string[]): Promise<any> {
  const tokenEl = document.querySelector('meta[name="csrf-token"]');

  if (!tokenEl) {
    throw new Error('Token element not found');
  }

  const token = tokenEl.getAttribute('content');

  if (!token) {
    throw new Error('Token content is null');
  }

  const data = {
    item_id: itemBibs,
  };

  // @ts-ignore
  const response: Response = await fetch('/availability/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': token,
    },
    body: JSON.stringify(data),
  }).catch((e) => console.log(e));

  if (!response.ok) {
    console.log('Error from API');
    console.log(await response.text());
    throw new Error(response.statusText);
  }

  const jsonResponse = await response.json();

  if (jsonResponse.httpStatus) {
    throw jsonResponse;
  }

  return jsonResponse;
}

export {
  callSierraApi,
  findMissing,
  getItemsIDs,
  getLocationData,
  getServiceDeskData,
  getStatusData,
  getPlaceholderItemsElements,
  itemsFromPromises,
  updateAeonRequestUrl,
};
