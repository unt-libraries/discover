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
  const partialOptions = {
    exclude: ['.result__label', 'mark'],
    filter(node, term, totalCounter, counter) {
      return !stopWords.includes(term);
    },
    separateWordSearch: true,
  };
  const completeOptions = {
    exclude: ['.result__label'],
    done() {
      instance.mark(searchQuery, partialOptions);
    },
    separateWordSearch: false,
  };
  instance.mark(searchQuery, completeOptions);
}

export {
  highlightSearchTerms,
};
