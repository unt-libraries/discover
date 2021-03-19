import Mark from 'mark.js/dist/mark.es6';

/**
 * Uses mark.js to highlight search terms in Show view
 */
function highlightSearchTerms() {
  /** hyphenize: If a term includes any transitions between numbers and letters
   * (with optional spaces), a separate hyphenated term is generated for each
   * of these transitions.
   *
   * E.g.: `mt1000 c35` => ['mt-1000-c-35', 'mt-1000-c', 'mt-1000',
   *                        '1000-c-35', '1000-c', 'c-35']
   *
   * Assuming we're handling interword punctuation so that these marks will
   * match any interword delimiter OR word boundary (i.e., punctuation, space,
   * or nothing) -- this should let us (mostly) mimic Solr's behavior for these
   * kinds of terms. It should at least be good enough to highlight call numbers,
   * SuDocs, and other formatted numbers, no matter how the user formatted the
   * number.
   * @param {string} term
   * @return {Array} list of hyphenated terms generated from the input term
   */
  function hyphenize(term) {
    const hyphenizerRe = /\s*(.*?(?:\p{N}(?=\s*\p{L})|\p{L}(?=\s*\p{N})))\s*/u;
    return term.split(hyphenizerRe).reduce((env, part, i, original) => {
      if (part) {
        const subParts = part.split(' ');
        if (env.partStack.length > 0) {
          if ((part.indexOf(' ') > -1) || (i === original.length - 1)) {
            env.partStack.push(subParts[0]);
            env.partStack.forEach((val, j, originalStack) => {
              const stackSlice = originalStack.slice(j);
              while (stackSlice.length > 1) {
                env.hyphenized.push(stackSlice.join('-'));
                stackSlice.pop();
              }
            });
            env.partStack = [];
          }
        }
        env.partStack.push(subParts[subParts.length - 1]);
      }
      return env;
    }, {
      hyphenized: [],
      partStack: [],
    }).hyphenized;
  }

  /** Return an array of normalized terms from a user query (`q`).
   * Normalization occurs for transitions between numbers and letters. When a term
   * contains such transitions, normalization happens as follows:
   *   - For each string of letters, numbers, letters, etc., a hyphen is placed at
   *     each transition.
   *   - A >three-letter word and space before a number OR a space and >1-letter word
   *     following a number breaks the hyphenization. E.g.: `england 2002` and
   *     `2002 in review` are NOT hyphenated; `mt 2002` and `1000 c` are.
   *   - Transitions without spaces are ALWAYS hyphenated. E.g.: `england2000` and
   *     `2002inreview` are hyphenated.
   *   - Punctuation between transitions is collapsed (to hyphen):
   *     `1000 .c35` => `1000-c-35`.
   *   - Punctuation within each part of the string is left as-is.
   * Terms containing no such transitions are left as-is and returned in the correct
   * posiiton in the return array.
   *
   * Example: `mt 1000.1 .c35 and y1.2` => [
   *   'mt-1000.1-c-35',
   *   'and',
   *   'y-1.2'
   * ]
   *
   * @param {string} term
   * @return {Array} list of normalized terms generated from the input term
   */
  function normalizeTerms(term) {
    const hyphenizerRe = /(.*?(?:\p{N}(?=\p{L})|\p{L}(?=\p{N})))/u;
    const collapseNumLetterRe = /(\p{N})[^\p{L}\p{N}]+(\p{L})([^\p{L}]|$)/ug;
    const collapseLetterNumRe = /(^|[^\p{L}])(\p{L}{1,3})[^\p{L}\p{N}]+(\p{N})/ug;
    const collapsed = term.replaceAll(collapseNumLetterRe, '$1$2$3').replaceAll(collapseLetterNumRe, '$1$2$3');
    return collapsed.split(' ').reduce((normTerms, part, i, original) => {
      if (part !== '') {
        const formattedParts = part.split(hyphenizerRe).filter((x) => !!x);
        normTerms.push(formattedParts.length > 1 ? formattedParts.join('-') : part);
      }
      return normTerms;
    }, []);
  }

  /**
   * Converts a user query string to two arrays:
   * @param {string} q
   * @param {Array} allStopwords
   * @return {Array} list of normalized terms from the user query, in query order
   */
  function queryToTerms(q, allStopwords) {
    return q.split('"').reduce((allTerms, term, i) => {
      const insideQuotes = i % 2;
      const trimmed = term.trim();
      if (trimmed) {
        const normTerms = normalizeTerms(trimmed);
        if (insideQuotes && normTerms.every((word) => allStopwords.indexOf(word) > -1)) {
          allTerms.push(trimmed);
        } else {
          allTerms.push(...normTerms);
        }
      }
      return allTerms;
    }, []);
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
        env.previousMainTerm = term;
      }
      return env;
    }, {
      allStopwords,
      finalPhrases: [],
      previousMainTerm: '',
      stopwordStack: [],
    });
    if (result.stopwordStack.length && result.previousMainTerm) {
      result.finalPhrases.push(...doStack(result.previousMainTerm, result.stopwordStack, true));
    }
    return result.finalPhrases;
  }

  /**
   * The main function to use to parse a user query.
   * @param {string} userQuery
   * @param {Array} allStopwords
   * @return {Array} all terms to find, does not include stopwords
   */
  function parseUserQuery(userQuery, allStopwords) {
    const qterms = queryToTerms(userQuery.toLowerCase(), allStopwords);
    const allAsPhrase = qterms.join(' ');
    const phrases = [allAsPhrase].concat(termsToPhrases(qterms, allStopwords));
    const justTerms = qterms.filter((term) => allStopwords.indexOf(term) === -1);
    return [...new Set(phrases.concat(justTerms))];
  }

  // Example vars that may need to be changed. These are used in both methods.
  // Array of stopwords for demonstration purposes.
  const myStopwords = ['a', 'an', 'the', 'is', 'in', 'on', 'of', 'to', 'from', 'and'];
  // Array of punctuation marks to ignore (used inside words and at word boundaries).
  const myPunctuation = [..."/\\:;.,-–—‒_(){}[]!'+=><`~@#$%^&*"];

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
    const internalPunctRe = `[${escapedPunctuation}]`;
    const wordDelimitersRe = `[\\s${escapedPunctuation}]`;
    const finalTermList = terms.map((term) => term.split(new RegExp(`${wordDelimitersRe}+`)).map((word) => word.split('').map((char) => {
      let charRe = char;
      diacritics.every((dct) => {
        if (dct.indexOf(char) !== -1) {
          charRe = `[${dct}]`;
          return false;
        }
        return true;
      });
      return charRe;
    }).filter((x) => !!x).join(`${internalPunctRe}*`))
      .filter((x) => !!x).join(`${wordDelimitersRe}*`))
      .filter((x) => !!x);
    return new RegExp(`(^|${wordDelimitersRe}+)(${finalTermList.join('|')})(?=(${wordDelimitersRe}+|$))`, 'i');
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

    const instance = new Mark(document.querySelectorAll('.card.item-more-details, #availabilityTable .blacklight-call-number.result__value'));

    // Parse user query
    const termList = parseUserQuery(userQuery, myStopwords);

    // Remove previous marked elements and mark new phrases and words
    instance.unmark({
      done() {
        /* Punctuation and spacing in the terms parsed from the user query are replaced with
           character classes that will match most punctuation and space, to give better
           highlighting/matching no matter what word delimiter is used in the query *and* the text.
        */
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
