import { onDomReady } from './utils.js';

export class HighlightSearchTermMatch {
  constructor() {
    this.contentArea = document.querySelector('#content');
    this.urlParams = new URLSearchParams(window.location.search);
    this.searchText = this.urlParams.get('h');
    // autorun
    onDomReady(() => {
      this.init(this.searchText);
    });

  }

  init(text) {
    if (!this.contentArea || !text || Mark === 'undefined') {
      return;
    }
    const markInstance = new Mark(this.contentArea);
    let totalMarks = 0;
    markInstance.mark(text, {
      'element': 'span',
      'className': 'bg-warning fw-semibold bg-opacity-20',
      'separateWordSearch': true,
      'accuracy': 'complementary',
      'each': (element) => {
        totalMarks++;
      }
    });
  }
}
