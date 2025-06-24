// import { JSDOM } from 'jsdom';
vi.mock('@hotwired/turbo-rails', () => {
  const mockVisit = vi.fn();
  global.Turbo = { visit: mockVisit };
  return {
    default: {},
    Turbo: { visit: mockVisit }
  };
});
import {
  initSearchInteractions,
  searchSelector,
  addSearchContextToLinks,
} from '../src/javascripts/_search';

describe('searchSelector', () => {
  beforeEach(() => {
    document.body.innerHTML =
      `<div id="searchFieldDropdownGroup">
      <button><span id="selected-search-field-label">All Fields</span></button>
      <div class="dropdown-menu">
        <a href="#" class="dropdown-item" data-search-field="text">All Fields</a>
        <a href="#" class="dropdown-item" data-search-field="title">Title</a>
      </div>
      <input type="hidden" id="search_field_hidden" name="search_field" value="text" />
    </div>`;
    searchSelector();
  });

  test('should not throw an error if the component is not on the page', () => {
    document.body.innerHTML = '';
    expect(() => searchSelector()).not.toThrow();
  });

  test('updates the hidden input value when a dropdown item is clicked', () => {
    const hiddenInput = document.getElementById('search_field_hidden') as HTMLInputElement;
    const titleOption = document.querySelector('[data-search-field="title"]') as HTMLElement;

    expect(hiddenInput.value).toBe('text');
    titleOption.click();
    expect(hiddenInput.value).toBe('title');
  });

  test('updates the visible selected label text when a dropdown item is clicked', () => {
    const selectedLabel = document.getElementById('selected-search-field-label') as HTMLElement;
    const titleOption = document.querySelector('[data-search-field="title"]') as HTMLElement;

    expect(selectedLabel.textContent?.trim()).toBe('All Fields');
    titleOption.click();
    expect(selectedLabel.textContent?.trim()).toBe('Title');
  });

  test('should not change the selected search field and search form value if the clicked item is the same as the current one', () => {
    const hiddenInput = document.getElementById('search_field_hidden') as HTMLInputElement;
    const selectedLabel = document.getElementById('selected-search-field-label') as HTMLElement;
    const allFieldsOption = document.querySelector('[data-search-field="text"]') as HTMLElement;

    expect(hiddenInput.value).toBe('text');
    expect(selectedLabel.textContent?.trim()).toBe('All Fields');

    allFieldsOption.click();

    expect(hiddenInput.value).toBe('text');
    expect(selectedLabel.textContent?.trim()).toBe('All Fields');
  });

  test('should change the selected search field and search form value when clicking different dropdown items consecutively', () => {
    const hiddenInput = document.getElementById('search_field_hidden') as HTMLInputElement;
    const selectedLabel = document.getElementById('selected-search-field-label') as HTMLElement;
    const titleOption = document.querySelector('[data-search-field="title"]') as HTMLElement;
    const allFieldsOption = document.querySelector('[data-search-field="text"]') as HTMLElement;

    expect(hiddenInput.value).toBe('text');
    expect(selectedLabel.textContent?.trim()).toBe('All Fields');

    titleOption.click();
    expect(hiddenInput.value).toBe('title');
    expect(selectedLabel.textContent?.trim()).toBe('Title');

    allFieldsOption.click();
    expect(hiddenInput.value).toBe('text');
    expect(selectedLabel.textContent?.trim()).toBe('All Fields');
  });
});

describe('addSearchContextToLinks', () => {
  beforeEach(() => {
    document.body.innerHTML =
      `<input type="text" id="q" />
       <input type="hidden" id="search_field_hidden" value />
       <a class="facet-values-item" href="/catalog?f[field]=value1">Facet Link</a>`;

    addSearchContextToLinks('a.facet-values-item');
  });

  test('calls Turbo.visit with the correctly constructed URL when the search query has a value', () => {
    const queryInput = document.getElementById('q') as HTMLInputElement;
    const searchFieldInput = document.getElementById('search_field_hidden') as HTMLInputElement;
    const facetLink = document.querySelector('.facet-values-item') as HTMLElement;

    const mockTurboVisit = vi.mocked(Turbo.visit);

    queryInput.value = 'maps';
    searchFieldInput.value = 'title';

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    facetLink.dispatchEvent(clickEvent);

    expect(mockTurboVisit).toHaveBeenCalledTimes(1);

    const expectedUrl = 'http://localhost:3000/catalog?f%5Bfield%5D=value1&q=maps&search_field=title';
    expect(mockTurboVisit).toHaveBeenCalledWith(expectedUrl);
  });
});

describe('initSearchInteractions', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="searchFieldDropdownGroup">
        <button id="selected-search-field-label">All Fields</button>
        <div class="dropdown-menu">
          <a class="dropdown-item" data-search-field="text">All Fields</a>
          <a class="dropdown-item" data-search-field="title">Title</a>
        </div>
      </div>
      <input type="hidden" id="search_field_hidden" value="text" />
      <input type="text" id="q" />
      <a class="facet-values-item" href="/catalog?f[field]=value1">Facet Link</a>
      <div class="pre-filter-btn-group">
        <a class="dropdown-item" href="/catalog?f[field]=value2">Pre-filter Link</a>
      </div>
    `;
    vi.resetAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should initialize search field dropdown and attach search context to facet links', () => {
    initSearchInteractions();

    const hiddenInput = document.getElementById('search_field_hidden') as HTMLInputElement;
    const selectedLabel = document.getElementById('selected-search-field-label') as HTMLElement;
    const titleOption = document.querySelector('[data-search-field="title"]') as HTMLElement;

    expect(hiddenInput.value).toBe('text');
    expect(selectedLabel.textContent?.trim()).toBe('All Fields');

    titleOption.click();
    expect(hiddenInput.value).toBe('title');
    expect(selectedLabel.textContent?.trim()).toBe('Title');

    const queryInput = document.getElementById('q') as HTMLInputElement;
    const facetLink = document.querySelector('.facet-values-item') as HTMLElement;

    queryInput.value = 'maps';
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    facetLink.dispatchEvent(clickEvent);

    const expectedUrl = 'http://localhost:3000/catalog?f%5Bfield%5D=value1&q=maps&search_field=title';
    expect(vi.mocked(Turbo.visit)).toHaveBeenCalledWith(expectedUrl);
  });

  it('should attach search context to pre-filter links', () => {
    initSearchInteractions();

    const queryInput = document.getElementById('q') as HTMLInputElement;
    const searchFieldInput = document.getElementById('search_field_hidden') as HTMLInputElement;
    const preFilterLink = document.querySelector('.pre-filter-btn-group .dropdown-item') as HTMLElement;

    queryInput.value = 'maps';
    searchFieldInput.value = 'title';

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    preFilterLink.dispatchEvent(clickEvent);

    const expectedUrl = 'http://localhost:3000/catalog?f%5Bfield%5D=value2&q=maps&search_field=title';
    expect(vi.mocked(Turbo.visit)).toHaveBeenCalledWith(expectedUrl);
  });

  it('should not throw an error if no matching links are found', () => {
    document.body.innerHTML = '';
    expect(() => initSearchInteractions()).not.toThrow();
  });
});
