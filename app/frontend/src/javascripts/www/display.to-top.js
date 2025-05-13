import { onDomReady, setWithExpiry, getWithExpiry } from './utils.js';

export class InsertToTopButtons {
  constructor() {
    onDomReady(() => {
      this.init();
    });
  }

  init() {
    const contentSection = document.querySelector('#content');
    if (!contentSection) return;

    const h2Elements = contentSection.querySelectorAll('h2');
    if (h2Elements.length < 3) return;

    let skippedH2Count = 0;

    h2Elements.forEach((h2) => {
      if (this.shouldSkipInsertion(h2)) return;

      if (skippedH2Count < 2) {
        skippedH2Count++;
        return;
      }

      const toTopSnippet = this.generateToTopSnippet();
      h2.insertAdjacentHTML('beforebegin', toTopSnippet);
    });

    // Also insert before elements with the `.to-top-before` class
    document.querySelectorAll('.to-top-before').forEach((el) => {
      if (!this.shouldSkipInsertion(el)) {
        const toTopSnippet = this.generateToTopSnippet();
        el.insertAdjacentHTML('beforebegin', toTopSnippet);
      }
    });
  }

  shouldSkipInsertion(element) {
    return element.closest("[data-untl-to-top-of-page='false']");
  }

  generateToTopSnippet() {
    return `
      <div class="clearfix"></div>
      <div class="border-top my-5 position-relative" markdown="0">
        <a href="#top" class="to-top-btn bg-white btn btn-outline-light-green opacity-75 p-1 position-absolute rounded-circle start-50 translate-middle"
           data-bs-toggle="tooltip"
           data-bs-placement="right"
           title="Back to Top">
          <span class="fa-kit fa-unt-eagle fa-lg" aria-hidden="true" title="UNT Eagle"></span>
        </a>
      </div>
    `;
  }
}
