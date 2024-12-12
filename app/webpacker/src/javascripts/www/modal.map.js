import { onDomReady } from './utils.js';

export class ModalMapHandler {
  constructor() {
    this.config = {
      selectors: {
        modal: document.querySelector('#map-dialog'),
        image: document.querySelector("#map-dialog-image"),
        downloadLink: document.querySelector("#map-dialog-download-link"),
        infoLink: document.querySelector("#map-dialog-info-link"),
      }
    };
    // autorun
    onDomReady(() => {
      this.init();
    });
  }
  listeners() {
    this.config.selectors.modal.addEventListener('show.bs.modal', (event) => {
      const triggerEl = event.relatedTarget;
      const info = {
        'src': triggerEl.getAttribute('data-untl-map-src'),
        'alt': triggerEl.getAttribute('data-untl-map-alt'),
        'href': triggerEl.getAttribute('data-untl-map-href'),
      }
      this.config.selectors.image.src = info.src;
      // set image alt
      this.config.selectors.image.alt = info.alt;
      this.config.selectors.downloadLink.href = info.src;
      this.config.selectors.infoLink.href = info.href;
    });
    this.config.selectors.modal.addEventListener('hidden.bs.modal', (event) => {
      this.config.selectors.image.src = '';
      this.config.selectors.downloadLink.href = '';
      this.config.selectors.infoLink.href = '';
    });

  }
  init() {
    if (!this.config.selectors.modal) {
      return;
    }
    this.listeners();
  }
}
