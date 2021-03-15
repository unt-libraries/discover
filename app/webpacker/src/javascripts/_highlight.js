import Mark from 'mark.js/dist/mark.es6';

/**
 * Uses mark.js to highlight search terms in Show view
 */
function highlightSearchTerms() {
  /**
   * Converts a user query string to two arrays:
   * @param {string} q
   * @return {Object}
   *   allTerms {Array} each phrase in quotes is one term and each word outside quotes is one term.
   *   justWords {Array} ONLY the terms that occur ourside of quotes, i.e. single-word terms
   */
  function queryToTerms(q) {
    return q.split('"').reduce((env, term, i) => {
      const insideQuotes = i % 2;
      if (insideQuotes) {
        const trimmed = term.trim();
        if (trimmed) {
          env.allTerms.push(trimmed);
          if (trimmed.indexOf(' ') === -1) {
            env.justWords.push(trimmed);
          }
        }
      } else {
        const words = term.trim().split(' ').filter((x) => x);
        env.allTerms.push(...words);
        env.justWords.push(...words);
      }
      return env;
    }, { allTerms: [], justWords: [] });
  }

  /**
   * Returns an array containing all *phrases* from the list of terms that should be highlighted,
   * including both the user's phrases and phrases generated from stopwords.
   * @param {Array} terms
   * @param {Array} allStopwords
   * @return {Array}
   */
  function termsToPhrases(terms, allStopwords) {
    function doStack(mainTerm, stack, forward) {
      return stack.map((swTerm, i, swStack) => {
        let termArray = [];
        if (forward) {
          termArray = [mainTerm].concat(swStack.slice(0, swStack.length - i));
        } else {
          termArray = swStack.slice(i).concat([mainTerm]);
        }
        return termArray.join(' ');
      });
    }

    const result = terms.reduce((env, term) => {
      if (allStopwords.indexOf(term) !== -1) {
        env.stopwordStack.push(term);
      } else {
        if (env.stopwordStack.length) {
          if (env.previousMainTerm) {
            env.finalPhrases.push(...doStack(env.previousMainTerm, env.stopwordStack, true));
          }
          env.finalPhrases.push(...doStack(term, env.stopwordStack, false));
          env.stopwordStack = [];
        }
        if (term.indexOf(' ') !== -1) {
          env.userPhrases.push(term);
        }
        env.previousMainTerm = term;
      }
      return env;
    }, {
      allStopwords,
      finalPhrases: [],
      userPhrases: [],
      previousMainTerm: '',
      stopwordStack: [],
    });
    if (result.stopwordStack.length && result.previousMainTerm) {
      result.finalPhrases.push(...doStack(result.previousMainTerm, result.stopwordStack, true));
    }
    result.finalPhrases.unshift(...result.userPhrases);
    return result.finalPhrases;
  }

  /**
   * The main function to use to parse a user query.
   * @param {string} userQuery
   * @param {Array} allStopwords
   * @return {Object}
   *   phrases {Array} The list of phrases to highlight, from `termsToPhrases`.
   *   justWords {Array }The list of single words to highlight, MINUS stopwords.
   */
  function parseUserQuery(userQuery, allStopwords) {
    const qterms = queryToTerms(userQuery.toLowerCase());
    const allAsPhrase = qterms.allTerms.join(' ');
    const phrases = [allAsPhrase].concat(termsToPhrases(qterms.allTerms, allStopwords));
    const wordsNoStopwords = [...new Set(qterms.justWords)].filter((x) => allStopwords.indexOf(x) === -1);
    return { phrases, justWords: wordsNoStopwords };
  }

  // Example vars that may need to be changed. These are used in both methods.
  // Array of stopwords for demonstration purposes.
  const myStopwords = ['a', 'an', 'the', 'is', 'in', 'on', 'of', 'to', 'from', 'and'];
  // Array of punctuation marks to ignore (used inside words and at word boundaries).
  const myPunctuation = ":;.,-–—‒_(){}[]!'+=".split('');

  function escapeStringForRe(str) {
    return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
  }

  /**
   * Converts a list of terms to a RegExp to pass to mark.js. It handles: diacritics,
   * internal word-delimiters (i.e., non-space punctuation within a word), and word-boundary
   * delimiters (any amount of punctuation or space between words).
   * @param {Array} punctuationArray
   * @param {Array} terms
   * @return {RegExp}
   */
  function termsToRegExp(punctuationArray, terms) {
    const diacritics = ['aàáảãạăằắẳẵặâầấẩẫậäåāąAÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÄÅĀĄ', 'cçćčCÇĆČ', 'dđďDĐĎ',
      'eèéẻẽẹêềếểễệëěēęEÈÉẺẼẸÊỀẾỂỄỆËĚĒĘ', 'iìíỉĩịîïīIÌÍỈĨỊÎÏĪ', 'lłLŁ', 'nñňńNÑŇŃ',
      'oòóỏõọôồốổỗộơởỡớờợöøōOÒÓỎÕỌÔỒỐỔỖỘƠỞỠỚỜỢÖØŌ', 'rřRŘ', 'sšśșşSŠŚȘŞ', 'tťțţTŤȚŢ',
      'uùúủũụưừứửữựûüůūUÙÚỦŨỤƯỪỨỬỮỰÛÜŮŪ', 'yýỳỷỹỵÿYÝỲỶỸỴŸ', 'zžżźZŽŻŹ'];
    const escapedPunctuation = escapeStringForRe(punctuationArray.join(''));
    const internalPunctRe = `[${escapedPunctuation}]*`;
    const wordDelimitersRe = `[\\s${escapedPunctuation}]+`;
    const finalTermList = terms.map((term) => term.split(new RegExp(wordDelimitersRe)).map((word) => word.split('').map((char) => {
      let charRe = char;
      diacritics.every((dct) => {
        if (dct.indexOf(char) !== -1) {
          charRe = `[${dct}]`;
          return false;
        }
        return true;
      });
      return charRe;
    }).join(internalPunctRe)).join(wordDelimitersRe));
    return new RegExp(`(^|${wordDelimitersRe})(${finalTermList.join('|')})(?=(${wordDelimitersRe}|$))`, 'i');
  }

  function regExpMark() {
    // Get user query
    const searchContextEl = document.getElementById('searchContext');
    if (searchContextEl === null) return;
    const { searchContext } = searchContextEl.dataset;
    if (!searchContext) return;
    const searchContextObj = JSON.parse(searchContext);
    if (!searchContextObj || !searchContextObj.q) return;
    const userQuery = searchContextObj.q;

    const instance = new Mark(document.querySelector('.card.item-more-details'));

    // Parse user query
    const result = parseUserQuery(userQuery, myStopwords);

    // Remove previous marked elements and mark new phrases and words
    instance.unmark({
      done() {
        /* Punctuation and spacing in the terms parsed from the user query are replaced with
           character classes that will match most punctuation and space, to give better
           highlighting/matching no matter what word delimiter is used in the query *and* the text.
        */
        const termList = result.phrases.concat(result.justWords);
        const termRe = termsToRegExp(myPunctuation, termList);
        instance.markRegExp(termRe, {
          className: 'markjs',
          exclude: ['.result__label'],
          ignoreGroups: 1,
        });
      },
    });
  }
  regExpMark();
}

export {
  highlightSearchTerms,
};
