export class OffCanvasSearch {
  constructor() {
    this.offCanvasSearch = document.querySelector('#offcanvas-search');
    this.offCanvasSearchInput = document.querySelector("#bento-offcanvas-q");
    this.offCanvasSearchTrigger = document.querySelector('button.top-bar-item[data-bs-target="#offcanvas-search"]');
    if (document.readyState !== 'loading') {
      this.init();
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        this.init();
      });
    }
  }

  init() {
    this.focusOnRevealedSearchInput();
    this.setupEventListeners();
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

}
