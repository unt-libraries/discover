class OffCanvasSearch {
  constructor() {
    this.offCanvasSearch = document.querySelector('#offcanvas-search');
    this.offCanvasSearchInput = document.querySelector("#bento-offcanvas-q");
    this.offCanvasSearchTrigger = document.querySelector('button.top-bar-item[data-bs-target="#offcanvas-search"]');
    this.init();
  }

  focusOnRevealedSearchInput() {
    this.offCanvasSearch.addEventListener('shown.bs.collapse', event => {
      this.offCanvasSearchInput.focus();
    });
  }

  handleEscapeKey(event) {
    if (event.key === 'Escape') {
      const searchWrapper = bootstrap.Collapse.getOrCreateInstance('#offcanvas-search');
      searchWrapper.hide();
    }
  }

  handleClickOutside(event) {
    if (!this.offCanvasSearch.contains(event.target)) {
      const searchWrapper = bootstrap.Collapse.getOrCreateInstance('#offcanvas-search');
      searchWrapper.hide();
    }
  }

  handleSlashKey(event) {
    if (event.key !== '/') {
      return;
    }
    // Check if the key pressed is "/" and the target is not an input or textarea
    if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
      event.preventDefault(); // Prevent default behavior (like quick find in Firefox)
      const searchWrapper = bootstrap.Collapse.getOrCreateInstance('#offcanvas-search');
      searchWrapper.show();
    }
  }

  setupEventListeners() {
    this.offCanvasSearch.addEventListener('show.bs.collapse', () => {
      this.offCanvasSearchTrigger.classList.add("dashed-focus");
      document.addEventListener('keydown', this.handleEscapeKey.bind(this));
      document.addEventListener('click', this.handleClickOutside.bind(this), true);
    });

    this.offCanvasSearch.addEventListener('hidden.bs.collapse', () => {
      this.offCanvasSearchTrigger.classList.remove("dashed-focus");
      document.removeEventListener('keydown', this.handleEscapeKey.bind(this));
      document.removeEventListener('click', this.handleClickOutside.bind(this), true);
      this.offCanvasSearchTrigger.focus();
    });
    document.addEventListener('keydown', this.handleSlashKey.bind(this));
  }

  init() {
    this.focusOnRevealedSearchInput();
    this.setupEventListeners();
  }
}


class SearchTabFocusHandler {
  constructor() {
    this.searchTabs = document.querySelectorAll('.search-tab');
    this.init();
  }

  focusTabInput(event) {
    const tabContent = document.querySelector(event.target.getAttribute("data-bs-target"));
    const tabInput = tabContent.querySelector('input[type="search"]');
    if (tabInput) {
      tabInput.focus();
    }
  }

  checkQueryStringAndActivateTab() {
    if (!window.location.search) {
      return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const tabId = urlParams.get('tab');
    if (tabId) {
      const targetTab = document.querySelector(`.search-tab[data-untl-shortcut="${tabId}"]`);
      if (targetTab) {
        new bootstrap.Tab(targetTab).show();
      }
    }
  }

  addEventListeners() {
    this.searchTabs.forEach((tab) => {
      tab.addEventListener('shown.bs.tab', this.focusTabInput);
    });
  }

  init() {
    this.addEventListeners();
    this.checkQueryStringAndActivateTab();
  }
}

class SearchOverride {
  constructor(config) {
    this.inputElement = document.querySelector(config.inputId); // e.g., '#search-input'
    this.overrideUrl = config.overrideUrl; // e.g., 'https://example.com/search?q={query}'
    this.placeholder = config.placeholder; // e.g., 'Search'
    this.init();
  }

  sanitizeInput(query) {
    return encodeURIComponent(query);
  }

  overridePlaceholder() {
    this.inputElement.setAttribute('placeholder', this.placeholder);
  }

  overrideSearch(event) {
    event.preventDefault(); // Prevent default form submission

    // Get user input from the input element
    let userInput = this.inputElement.value;

    // Sanitize the user input
    userInput = this.sanitizeInput(userInput);

    // Replace the placeholder with the user's sanitized input
    const targetUrl = this.overrideUrl.replace('{query}', userInput);

    // Redirect the user to the newly constructed URL
    window.location.href = targetUrl;
  }

  init() {
    this.overridePlaceholder();
    // Attach an event listener to the form submission event
    const formElement = this.inputElement.closest('form');
    if (formElement) {
      formElement.addEventListener('submit', this.overrideSearch.bind(this));
    }
  }
}

new OffCanvasSearch();
new SearchTabFocusHandler();
