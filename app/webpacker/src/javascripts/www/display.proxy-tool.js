class ProxyFormHandler {
  constructor() {
    this.startsHTTP = new RegExp('^https?://', 'i');
    this.proxyString = 'https://libproxy.library.unt.edu:443/login?url=';

    // Cache DOM elements
    this.originalURL = document.querySelector('#original-url');
    this.proxifiedURL = document.querySelector('#proxified-url');
    this.transformed = document.querySelector('#transformed');
    this.validMsg = document.querySelector('#validation-msg-valid');
    this.invalidMsg = document.querySelector('#validation-msg-invalid');
    this.form = document.querySelector('#proxy-form');
    this.updateButton = document.querySelector('#update-url');
    this.testButton = document.querySelector('#test-me');

    // autorun
    if (document.readyState !== 'loading') {
      this.init();
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        this.init();
      });
    }

  }

  init() {
    // Prevent form submission
    this.form.addEventListener('submit', (e) => e.preventDefault());

    // Add event listeners
    this.updateButton.addEventListener('click', this.handleUpdateClick.bind(this));
    this.testButton.addEventListener('click', this.handleTestClick.bind(this));
  }

  handleUpdateClick() {
    const originalVal = this.originalURL.value;

    if (originalVal !== '' && this.startsHTTP.test(originalVal)) {
      this.transformed.style.display = 'block';
      const proxifiedValue = this.proxyString + originalVal;
      this.proxifiedURL.value = proxifiedValue;
      this.proxifiedURL.select();

      // Add the proxified value to the clipboard
      this.copyToClipboard(proxifiedValue);

      // Deselect text to prevent user from accidentally overwriting
      this.proxifiedURL.addEventListener('mouseup', (e) => e.preventDefault());

      if (this.startsHTTP.test(originalVal)) {
        this.setValidState();
      } else {
        this.setInvalidState();
      }
    } else {
      this.setInvalidState();
      this.originalURL.focus();
      this.originalURL.setSelectionRange(0, 0);
    }
  }

  handleTestClick() {
    const proxied = this.proxifiedURL.value;
    if (proxied) {
      window.open(proxied);
    }
  }

  setValidState() {
    this.originalURL.classList.add('is-valid');
    this.originalURL.classList.remove('is-invalid');
    this.validMsg.style.display = 'block';
    this.invalidMsg.style.display = 'none';
  }

  setInvalidState() {
    this.originalURL.classList.add('is-invalid');
    this.originalURL.classList.remove('is-valid');
    this.validMsg.style.display = 'none';
    this.invalidMsg.style.display = 'block';
    this.transformed.style.display = 'none';
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      console.log('URL copied to clipboard:', text);
    }).catch((err) => {
      console.error('Failed to copy URL to clipboard:', err);
    });
  }

}

const doProxyTool = new ProxyFormHandler();
