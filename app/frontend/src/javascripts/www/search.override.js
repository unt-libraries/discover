import { onDomReady } from './utils.js';

export class SearchOverride {
  constructor(config) {
    this.inputElement = document.querySelector(config.inputId); // e.g., '#search-input'
    this.overrideUrl = config.overrideUrl; // e.g., 'https://example.com/search?q={query}'
    this.placeholder = config.placeholder; // e.g., 'Search'
    // autorun
    onDomReady(() => {
      this.init();
    });
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
