import { enableFetchMocks } from 'jest-fetch-mock';
import { serviceDeskData } from './__mocks__/service_desks';
import { statusDescData } from './__mocks__/availability_statuses';
import { locationData } from './__mocks__/availability_locations';

enableFetchMocks();
jest.mock('../../app/webpacker/src/javascripts/data/service_desks', () => ({
  serviceDeskData,
}));
jest.mock('../../app/webpacker/src/javascripts/data/availability_statuses', () => ({
  statusDescData,
}));
jest.mock('../../app/webpacker/src/javascripts/data/availability_locations', () => ({
  locationData,
}));
import {
  callSierraApi,
  findMissing,
  getItemsIDs,
  getLocationData,
  getServiceDeskData,
  getStatusData,
  getPlaceholderItemsElements,
  itemsFromPromises,
  updateAeonRequestUrl,
} from '../../app/webpacker/src/javascripts/_availability_util';

import mocked = jest.mocked;

window.alert = jest.fn();

describe('callSierraApi', () => {
  beforeEach(() => {
    // @ts-ignore
    fetch.resetMocks();

    // Create a mock token element in the DOM
    const tokenEl = document.createElement('meta');
    tokenEl.name = 'csrf-token';
    tokenEl.content = 'mock-csrf-token';
    document.head.appendChild(tokenEl);
  });

  afterEach(() => {
    // Remove the mock token element from the DOM
    const tokenEl = document.querySelector('meta[name="csrf-token"]');
    if (tokenEl) {
      document.head.removeChild(tokenEl);
    }
  });

  it('should return a successful response', async () => {
    // Mock the fetch response
    const mockResponse = {
      total: 2,
      start: 0,
      entries: [
        {
          id: '12345',
          location: { code: 'x', name: 'Remote Storage' },
          status: { code: '-', display: 'AVAILABLE' },
          holdCount: 0,
        },
        {
          id: '67890',
          location: { code: 'x', name: 'Remote Storage' },
          status: { code: '-', display: 'AVAILABLE' },
          holdCount: 0,
        },
      ],
    };
    // @ts-ignore
    fetch.mockResponseOnce(JSON.stringify(mockResponse));

    // Call the function and check the response
    const response = await callSierraApi(['12345', '67890']);
    expect(response).toEqual(mockResponse);
  });

  it('should call the Sierra API and return the expected response', async () => {
    const itemBibs = ['12345', '67890'];

    const mockedJsonData = {
      items: [
        { id: '12345', available: true },
        { id: '67890', available: false },
      ],
    };

    // @ts-ignore
    fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockedJsonData),
    }));

    const result = await callSierraApi(itemBibs);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/availability/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'mock-csrf-token',
      },
      body: JSON.stringify({ item_id: itemBibs }),
    });
    expect(result).toEqual(mockedJsonData);
  });

  it('should throw an error if the Sierra API returns an error', async () => {
    const itemBibs = ['12345', '67890'];

    // @ts-ignore
    fetch.mockImplementationOnce(() => Promise.resolve({
      ok: false,
      statusText: 'Mocked Error',
      text: () => Promise.resolve('Error message from the API'),
    }));

    await expect(callSierraApi(itemBibs)).rejects.toThrow('Mocked Error');
  });

  it('should throw an error if the Sierra API returns an httpStatus', async () => {
    const itemBibs = ['12345', '67890'];

    const mockedJsonData = {
      httpStatus: 400,
      message: 'Bad Request',
    };

    // @ts-ignore
    fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockedJsonData),
    }));

    await expect(callSierraApi(itemBibs)).rejects.toEqual(mockedJsonData);
  });
});

describe('findMissing', () => {
  it('should return an array of missing items', () => {
    const foundItems = [
      {
        id: '1',
        location: { code: 'x', name: 'Remote Storage' },
        status: { code: '-', display: 'AVAILABLE' },
        holdCount: 0,
      },
      {
        id: '2',
        location: { code: 'x', name: 'Remote Storage' },
        status: { code: '-', display: 'AVAILABLE' },
        holdCount: 0,
      },
    ];
    const allItems = ['1', '2', '3', '4'];

    const missingItems = findMissing(foundItems, allItems);
    expect(missingItems).toEqual(['3', '4']);
  });

  it('should return an empty array if there are no missing items', () => {
    const foundItems = [
      {
        id: '1',
        location: { code: 'x', name: 'Remote Storage' },
        status: { code: '-', display: 'AVAILABLE' },
        holdCount: 0,
      },
      {
        id: '2',
        location: { code: 'x', name: 'Remote Storage' },
        status: { code: '-', display: 'AVAILABLE' },
        holdCount: 0,
      },
      {
        id: '3',
        location: { code: 'x', name: 'Remote Storage' },
        status: { code: '-', display: 'AVAILABLE' },
        holdCount: 0,
      },
      {
        id: '4',
        location: { code: 'x', name: 'Remote Storage' },
        status: { code: '-', display: 'AVAILABLE' },
        holdCount: 0,
      },
    ];
    const allItems = ['1', '2', '3', '4'];

    const missingItems = findMissing(foundItems, allItems);
    expect(missingItems).toEqual([]);
  });

  it('should return all items if the foundItems array is empty', () => {
    const foundItems: any[] = [];
    const allItems = ['1', '2', '3', '4'];

    const missingItems = findMissing(foundItems, allItems);
    expect(missingItems).toEqual(allItems);
  });

  it('should return an empty array if both the foundItems and allItems arrays are empty', () => {
    const foundItems: any[] = [];
    const allItems: any[] = [];

    const missingItems = findMissing(foundItems, allItems);
    expect(missingItems).toEqual([]);
  });
});

describe('getItemsIDs', () => {
  it('returns an empty array when there are no elements with data-item-id attribute', () => {
    document.body.innerHTML = `
    <div id="container"></div>
  `;

    const result = getItemsIDs();
    expect(result).toEqual([]);
  });

  it('returns a single chunk of IDs when the total number of elements with data-item-id attribute is less than or equal to the chunk size', () => {
    document.body.innerHTML = `
    <div id="container">
      <div data-item-id="b12345"></div>
      <div data-item-id="b67890"></div>
      <div data-item-id="b13579"></div>
    </div>
  `;

    const result = getItemsIDs();
    expect(result).toEqual([['12345', '67890', '13579']]);
  });

  it('returns multiple chunks of IDs when the total number of elements with data-item-id attribute is greater than the chunk size', () => {
    const elements = [];
    for (let i = 1; i <= 55; i++) {
      elements.push(`<div data-item-id="b${i.toString().padStart(5, '0')}"></div>`);
    }

    document.body.innerHTML = `
    <div id="container">
      ${elements.join('')}
    </div>
  `;

    const result = getItemsIDs();
    expect(result.length).toBe(2);
    expect(result[0].length).toBe(50);
    expect(result[1].length).toBe(5);
  });

  it('returns an empty array when there are no elements with the data-item-id attribute', () => {
    document.body.innerHTML = `
    <div id="container">
      <div data-item-id=""></div>
      <div data-item-id=""></div>
    </div>
  `;

    const result = getItemsIDs();
    expect(result).toEqual([]);
  });

  it('returns an array with one chunk of item IDs when there are fewer than 50 elements with the data-item-id attribute', () => {
    const items = [];
    for (let i = 1; i <= 10; i++) {
      items.push(`<div data-item-id="b${i}"></div>`);
    }
    document.body.innerHTML = `<div id="container">${items.join('')}</div>`;

    const result = getItemsIDs();
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(10);
  });
});

describe('getLocationData', () => {
  it('should return the correct location data', () => {
    const locationCode = 'czm*';
    const locationData = getLocationData(locationCode);
    expect(locationData).toEqual({
      name: 'Chilton Media Library',
      abbr: 'Media',
      linkText: 'Media Library Directory',
      url: 'https://library.unt.edu/media/#directory',
      btnClass: 'media',
    });
  });

  it('should return an empty object if the location code is not found', () => {
    const locationCode = 'nonexistent';
    const locationData = getLocationData(locationCode);
    expect(locationData).toEqual({});
  });

  it('should return the correct location data for a code with wildcard inheritance', () => {
    const locationCode = 'dcare';
    const locationData = getLocationData(locationCode);
    expect(locationData).toEqual({
      name: 'Dallas Campus Career Development',
      abbr: 'UNT Dallas',
      linkText: 'UNT Dallas Library',
      url: 'https://www.untdallas.edu/library',
    });
  });
});

describe('getServiceDeskData', () => {
  it('should return the correct service desk data', () => {
    const deskCode = 'czm';
    const deskData = getServiceDeskData(deskCode);
    expect(deskData).toEqual({
      name: 'Media Library Service Desk',
      url: 'https://library.unt.edu/media/service-desk/',
    });
  });

  it('should return the default service desk data when the provided code is not found', () => {
    const deskCode = 'nonexistent';
    const deskData = getServiceDeskData(deskCode);
    expect(deskData).toEqual({
      name: 'Willis Library Services Desk',
      url: 'https://library.unt.edu/willis/service-desk/',
    });
  });

  it('should return the correct service desk data when using a default code', () => {
    const deskCode = 'default';
    const deskData = getServiceDeskData(deskCode);
    expect(deskData).toEqual({
      name: 'Willis Library Services Desk',
      url: 'https://library.unt.edu/willis/service-desk/',
    });
  });

  it('should return the correct service desk data when using a code with the special collections prefix', () => {
    const deskCode = 'w4spe';
    const deskData = getServiceDeskData(deskCode);
    expect(deskData).toEqual({
      name: 'Special Collections',
      url: 'https://library.unt.edu/special-collections/',
    });
  });

  it('should return the correct service desk data when using a code with the xspe prefix', () => {
    const deskCode = 'xspe';
    const deskData = getServiceDeskData(deskCode);
    expect(deskData).toEqual({
      name: 'Special Collections',
      url: 'https://library.unt.edu/special-collections/',
    });
  });
});

describe('getStatusData', () => {
  it('should return the correct status data for an available item', () => {
    const statusCode = '-';
    const statusData = getStatusData(statusCode);
    expect(statusData).toEqual({
      label: 'Available',
      desc: 'The item is available for checkout. It should be on the shelf at the listed location; if you can\'t find '
        + 'it, please ask for help at a Service Desk.',
      btnClass: 'available',
    });
  });

  it('should return the correct status data for a library-use-only item', () => {
    const statusCode = 'o';
    const statusData = getStatusData(statusCode);
    expect(statusData).toEqual({
      label: 'Library Use Only',
      desc: 'The item should be available on the shelf at the given location, but it can only be used in the library. It '
        + 'cannot be checked out or requested.',
      btnClass: 'unavailable',
    });
  });

  it('should return the correct status data for a missing item', () => {
    const statusCode = 'y';
    const statusData = getStatusData(statusCode);
    expect(statusData).toEqual({
      label: 'Missing',
      desc: 'We cannot find the item, and we do not know what happened to it. We are no longer looking for it. '
        + 'It cannot be requested.',
      btnClass: 'unavailable',
    });
  });

  it('should return undefined if the status code is not found', () => {
    const statusCode = 'nonexistent';
    const statusData = getStatusData(statusCode);
    expect(statusData).toEqual(undefined);
  });
});

describe('getPlaceholderItemsElements', () => {
  it('should return an empty NodeList when there are no elements with the data-no-api-request attribute', () => {
    document.body.innerHTML = `
      <div id="container"></div>
    `;

    const result = getPlaceholderItemsElements();
    expect(result.length).toBe(0);
  });

  it('should return a NodeList with the correct number of elements with the data-no-api-request attribute', () => {
    document.body.innerHTML = `
      <div id="container">
        <div data-no-api-request></div>
        <div data-no-api-request></div>
        <div data-no-api-request></div>
      </div>
    `;

    const result = getPlaceholderItemsElements();
    expect(result.length).toBe(3);
  });

  it('should return a NodeList with the correct elements with the data-no-api-request attribute', () => {
    document.body.innerHTML = `
      <div id="container">
        <div data-no-api-request id="element1"></div>
        <div data-no-api-request id="element2"></div>
        <div data-no-api-request id="element3"></div>
      </div>
    `;

    const result = getPlaceholderItemsElements();
    expect(result[0].id).toBe('element1');
    expect(result[1].id).toBe('element2');
    expect(result[2].id).toBe('element3');
  });
});

describe('itemsFromPromises', () => {
  it('should return an empty array when there are no fulfilled promises', () => {
    const result = itemsFromPromises([
      { status: 'rejected', reason: 'Error' },
      { status: 'rejected', reason: 'Error' },
    ]);

    expect(result).toEqual([]);
  });

  it('should return an array of item data from fulfilled promises', () => {
    const fulfilledPromise1 = {
      status: 'fulfilled',
      value: { entries: [{ id: '1', status: 'available', location: 'A' }] },
    };
    const fulfilledPromise2 = {
      status: 'fulfilled',
      value: { entries: [{ id: '2', status: 'unavailable', location: 'B' }] },
    };

    const result = itemsFromPromises([fulfilledPromise1, fulfilledPromise2]);

    expect(result).toEqual([
      { id: '1', status: 'available', location: 'A' },
      { id: '2', status: 'unavailable', location: 'B' },
    ]);
  });

  it('should ignore rejected promises and return item data only from fulfilled promises', () => {
    const fulfilledPromise = {
      status: 'fulfilled',
      value: { entries: [{ id: '1', status: 'available', location: 'A' }] },
    };
    const rejectedPromise = { status: 'rejected', reason: 'Error' };

    const result = itemsFromPromises([fulfilledPromise, rejectedPromise]);

    expect(result).toEqual([{ id: '1', status: 'available', location: 'A' }]);
  });
});

describe('updateAeonRequestUrl', () => {
  it('should append Location and Site parameters to the URL', () => {
    const itemURL = 'https://aeon.example.com/request';
    const itemLocation = { code: 'w4m1', name: 'Music Library' };

    const updatedUrl = updateAeonRequestUrl(itemURL, itemLocation);
    const url = new URL(updatedUrl);

    expect(url.searchParams.get('Location')).toBe('Music Library');
    expect(url.searchParams.get('Site')).toBe('UNTMUSIC');
  });

  it('should append UNTSPECCOLL as Site for non-w4m codes', () => {
    const itemURL = 'https://aeon.example.com/request';
    const itemLocation = { code: 'z4m1', name: 'Special Collections' };

    const updatedUrl = updateAeonRequestUrl(itemURL, itemLocation);
    const url = new URL(updatedUrl);

    expect(url.searchParams.get('Location')).toBe('Special Collections');
    expect(url.searchParams.get('Site')).toBe('UNTSPECCOLL');
  });

  it('should not modify existing parameters in the URL', () => {
    const itemURL = 'https://aeon.example.com/request?existingParam=value';
    const itemLocation = { code: 'w4m1', name: 'Music Library' };

    const updatedUrl = updateAeonRequestUrl(itemURL, itemLocation);
    const url = new URL(updatedUrl);

    expect(url.searchParams.get('existingParam')).toBe('value');
  });
});
