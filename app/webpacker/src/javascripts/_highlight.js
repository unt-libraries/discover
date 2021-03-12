import Mark from 'mark.js/dist/mark.es6';

/**
 * Uses mark.js to highlight search terms in Show view
 */
function highlightSearchTerms() {
  const searchContextEl = document.getElementById('searchContext');
  if (searchContextEl === null) return;

  const { searchContext } = searchContextEl.dataset;
  const searchContextObj = JSON.parse(searchContext);
  if (!searchContextObj.q) return;
  const searchQuery = searchContextObj.q.replaceAll(/^["']|["']$/g, '');
  const stopWords = ['a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
    'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with'];

  const instance = new Mark(document.querySelector('.card.item-more-details'));
  const stopWordOptions = {
    accuracy: 'exactly',
    className: 'markjs-stopword',
    exclude: ['.result__label', 'mark'],
    filter(node, term, totalCounter, counter) {
      const isStopWord = stopWords.includes(term);
      if (!isStopWord) return false;

      const { nextSibling, previousSibling } = node;

      if (nextSibling && nextSibling.classList.contains('markjs-partial')) {
        return true;
      }

      return previousSibling && previousSibling.classList.contains('markjs-partial');
    },
  };
  const partialOptions = {
    className: 'markjs-partial',
    exclude: ['.result__label', 'mark'],
    separateWordSearch: true,
    filter(node, term, totalCounter, counter) {
      return !stopWords.includes(term);
    },
    done() {
      instance.mark(searchQuery, stopWordOptions);
    },
  };
  const completeOptions = {
    className: 'markjs-complete',
    exclude: ['.result__label'],
    separateWordSearch: false,
    done() {
      instance.mark(searchQuery, partialOptions);
    },
  };
  instance.mark(searchQuery, completeOptions);
}

export {
  highlightSearchTerms,
};
