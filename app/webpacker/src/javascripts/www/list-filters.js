class ListFilterDirectory {
  constructor(listId, options, searchInputId, filterControlsSelector) {
    if (typeof List === "undefined") {
      console.error("List.js is not loaded.");
      return;
    }

    this.listId = listId;
    this.options = options;
    this.searchInputId = searchInputId;
    this.filterControlsSelector = filterControlsSelector;

    // Initializing the List with dynamic listId and options
    this.directoryList = new List(this.listId, this.options);

    this.init();
  }

  init() {
    this.bindEvents();
    if (!this.directoryList.pagination) {
      this.updateFilterCount();
    }
  }

  bindEvents() {
    const searchEl = document.getElementById(this.searchInputId);
    searchEl.addEventListener('keyup', event => this.handleSearch(event));
    searchEl.addEventListener('focus', event => this.handleFocus(event));
    searchEl.addEventListener('focus', event => this.scrollToTop(event));
    document.querySelectorAll(this.filterControlsSelector).forEach(select => {
      select.addEventListener('change', event => this.handleFilterChange(event));
      select.addEventListener('focus', event => this.scrollToTop(event));
    });
    this.directoryList.on('updated', () => this.updateFilterCount());
    if (this.directoryList.passSearchQuery) {
      searchEl.addEventListener('blur', event => this.handleSearchBlur(event));
    }
  }

  scrollToTop(event) {
    const input = event.target;
    if (!input) return;
      input.scrollIntoView({ behavior: 'smooth' });
  }

  handleSearch(event) {
    const value = event.target.value;
    this.directoryList.search(value, ['meta']);
  }

  handleFocus(event) {
    const filterControls = document.querySelectorAll(this.filterControlsSelector);
    document.getElementById(this.searchInputId).value = '';
    filterControls.forEach(select => select.value = '');
    this.resetSelects(filterControls);
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

  updateFilterCount() {
    const filterCountElement = document.getElementById('filter-count');
    if (filterCountElement) {
      // get the count of visible items that have a meta value
      const visibleMetaItems = this.directoryList.matchingItems.length;
      console.log(this.directoryList)


      filterCountElement.innerText = `${visibleMetaItems}`;
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
  }
}



