import { onDomReady } from './utils.js';

export class ListFilterDirectory {
  constructor(listId, options, searchInputId, filterControlsSelector) {
    if (typeof List === "undefined") {
      console.error("List.js is not loaded.");
      return;
    }
    this.listId = listId;
    this.options = options;
    this.searchInputId = searchInputId;
    this.filterControlsSelector = filterControlsSelector;
    this.directoryList = new List(this.listId, this.options);
    // autorun
    onDomReady(() => {
      this.init();
    });

  }

  init() {
    this.bindEvents();
    if (!this.directoryList.pagination) {
      this.updateHandlers();
    }
    this.checkForQueryParameter();
  }

  bindEvents() {
    const searchEl = document.getElementById(this.searchInputId);
    searchEl.addEventListener('keyup', event => this.handleSearch(event));
    searchEl.addEventListener('focus', event => this.handleFocus(event));
    searchEl.addEventListener('focus', event => this.scrollToTop(event));
    searchEl.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        this.scrollToList();
      }
    });
    document.querySelectorAll(this.filterControlsSelector).forEach(select => {
      select.addEventListener('change', event => this.handleFilterChange(event));
    });
    this.directoryList.on('updated', () => this.updateHandlers());
    if (this.directoryList.passSearchQuery) {
      searchEl.addEventListener('blur', event => this.handleSearchBlur(event));
    }
  }

  checkForQueryParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    const category = urlParams.get('cat');
    this.isQueryParameterSearch = false; // Reset flag

    if (query) {
      this.isQueryParameterSearch = true; // Set flag
      const searchEl = document.getElementById(this.searchInputId);
      searchEl.value = query;
      searchEl.setSelectionRange(searchEl.value.length, searchEl.value.length);
      setTimeout(() => {
        const event = new KeyboardEvent('keyup', { bubbles: true });
        searchEl.dispatchEvent(event);
      }, 500);
    }

    if (category) {
      this.isQueryParameterSearch = true; // Set flag
      const categorySelect = document.querySelector(this.filterControlsSelector);
      categorySelect.value = category;
      setTimeout(() => {
        const event = new Event('change', { bubbles: true });
        categorySelect.dispatchEvent(event);
      }, 500);
    }
  }


  scrollToTop(event) {
    const input = event.target;
    if (!input) return;
    input.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToList() {
    const listEl = document.getElementById(this.listId);
    if (listEl) {
      listEl.scrollIntoView({ behavior: 'smooth' });
    }
  }

  handleSearch(event) {
    const value = event.target.value;
    // store the search term on the object
    this.directoryList.searchedString = value || '';
    this.directoryList.search(value, ['meta']);
  }

  handleFocus(event) {
    if (this.isQueryParameterSearch) {
      // Reset the flag and skip clearing logic
      this.isQueryParameterSearch = false;
      return;
    }
    const filterControls = document.querySelectorAll(this.filterControlsSelector);
    document.getElementById(this.searchInputId).value = '';
    filterControls.forEach(select => select.value = '');
    this.resetSelects(filterControls);
    this.directoryList.searchedString = '';
    this.directoryList.search();
    this.directoryList.sort('original_sort');
  }

  handleSearchBlur(event) {
    const value = event.target.value;
    const allListLinks = this.directoryList.list.querySelectorAll("a")
    if (value.length === 0) {
      allListLinks.forEach(link => {
        // remove the 'h' query string
        const url = new URL(link.href);
        url.searchParams.delete('h');
        link.href = url.href;
      });
    } else {
      allListLinks.forEach(link => {
        // modify the url to include a 'h' query string
        const url = new URL(link.href);
        url.searchParams.set('h', value);
        link.href = url.href;
      });
    }
  }

  resetSelects(selects) {
    selects.forEach(select => select.selectedIndex = 0);
  }

  updateHandlers() {
    //console.log(this.directoryList);
    const filterCountElement = document.getElementById('filter-count');
    const visibleMetaItems = this.directoryList.matchingItems.length;

    if (filterCountElement) {
      // Update the count of visible items
      filterCountElement.innerText = `${visibleMetaItems}`;
    }

    // Check if the "no items" message already exists
    const existingNoItemsMessage = this.directoryList.list.querySelector('.alert.alert-warning');

    if (visibleMetaItems === 0) {
      // Create and display the "no items" message if not already present
      if (!existingNoItemsMessage) {
        const noItems = document.createElement('div');
        noItems.classList.add('alert', 'alert-warning', 'my-4', 'w-100', 'fw-bold');
        noItems.innerText = 'No results found. Try a different term/phrase or other filter options.';
        noItems.setAttribute('role', 'alert');
        noItems.setAttribute('aria-live', 'polite');
        this.directoryList.list.appendChild(noItems);
      }
    } else {
      // Remove the "no items" message if it exists and there are visible items
      if (existingNoItemsMessage) {
        existingNoItemsMessage.remove();
      }
    }
    if (this.directoryList.searched && this.directoryList.searchedString && this.directoryList.searchedString.length >= 3) {
      // Update the match count for each item in the visible results
      const currentSearchTerm = this.directoryList.searchedString.toLowerCase()
      this.directoryList.matchingItems.forEach(item => {
        const matchCount = this.calculateMatchCount(item, currentSearchTerm);
        const foundCountElement = item.elm.querySelector('.found');
        if (foundCountElement) {
          if (matchCount === 0) {
            foundCountElement.innerText = "";
            foundCountElement.classList.add('d-none');
          } else {
            foundCountElement.innerText = `${matchCount} match${matchCount > 1 ? 'es' : ''}`;
            foundCountElement.classList.remove('d-none');
          }
        }
      });
    } else {
      // Remove the match count for each item if the search term is less than 3 characters
      this.directoryList.matchingItems.forEach(item => {
        const foundCountElement = item.elm.querySelector('.found');
        if (foundCountElement) {
          foundCountElement.innerText = "";
          foundCountElement.classList.add('d-none');
        }
      });
    }

  }

  handleFilterChange(event) {
    const select = event.target;
    const which = select.dataset.controls;
    const searchString = select.value;
    const siblings = Array.from(select.parentNode.children).filter(el => el !== select);
    this.resetSelects(siblings);
    document.getElementById(this.searchInputId).value = '';

    if (searchString === 'any') {
      this.directoryList.search();
      this.directoryList.sort('original_sort');
    } else {
      this.directoryList.search(searchString, [which]);
    }
    this.scrollToList();
  }

  calculateMatchCount(item, currentSearchTerm) {
    const values = item.values(); // Get the values for the item
    let count = 0;
    for (const key in values) {
      if (values[key]) {
        // Convert the field value to a string and normalize it for matching
        const fieldValue = values[key].toString().toLowerCase();
        // Use a regex to count all occurrences of the search string in the field
        const matches = fieldValue.match(new RegExp(currentSearchTerm, 'g'));
        if (matches) {
          count += matches.length; // Increment count by the number of matches
        }
      }
    }
    return count;
  }
}
