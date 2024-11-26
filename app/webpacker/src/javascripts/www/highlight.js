// Changes from source noted below with "EDITED"
import Mark from 'mark.js'; // EDITED to import Mark

export class Highlight {
    constructor() {
        this.contentArea = document.querySelector('#content');
        if (!this.contentArea) {
            console.error('Content area not found.');
            return;
        }
        const urlParams = new URLSearchParams(window.location.search);
        const searchText = urlParams.get('h');
        if (!searchText) {
            return;
        }
        this.highlightText(searchText);
    }

    toastTemplate(totalMarks, text) {
        // text is url encoded so we need to decode it
        text = decodeURIComponent(text);
        const toastEl = document.createElement('div');
        toastEl.classList = 'toast position-fixed bottom-0 start-0 p-3 mb-3';
        toastEl.setAttribute('role', 'alert');
        toastEl.setAttribute('aria-live', 'assertive');
        toastEl.setAttribute('aria-atomic', 'true');
        toastEl.innerHTML = `
                  <div class="toast-header">
                    <strong class="me-auto">Matches</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                  </div>
                  <div class="toast-body">
                    ${totalMarks} match${totalMarks > 1 ? 'es' : ''} found for words in "${text}".
                  </div>`;
        return toastEl;
    }

    highlightText(text) {
        const markInstance = new Mark(this.contentArea);
        let totalMarks = 0;
        markInstance.mark(text, {
            'element': 'span',
            'className': 'bg-warning fw-semibold bg-opacity-20',
            'separateWordSearch': true,
            'accuracy': 'complementary',
            'each': (element) => {
                totalMarks++;
            },
            'done': () => {
                if (totalMarks >= 1) {
                    const toastEl = this.toastTemplate(totalMarks, text);
                    document.body.appendChild(toastEl);
                    const toast = new bootstrap.Toast(toastEl);
                    toast.show();
                }
            }
        });
    }
}
