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

  /**
   * Converts a user query string to two arrays:
   * @param {string} q
   * @param {Array} allStopwords
   * @return {Object}
   *   cleanTerms {Array} list of terms from the user query, in query order
   *   hyphenizedTerms {Array} list of hyphenated terms for e.g. parts of call numbers
   */
  function queryToTerms(q, allStopwords) {
    return q.split('"').reduce((env, term, i) => {
      const insideQuotes = i % 2;
      const trimmed = term.trim();
      if (trimmed) {
        const words = trimmed.split(' ').filter((x) => !!x);
        if (insideQuotes && words.every((word) => allStopwords.indexOf(word) > -1)) {
          env.cleanTerms.push(trimmed);
        } else {
          env.cleanTerms.push(...words);
        }
        env.hyphenizedTerms.push(...hyphenize(trimmed));
      }
      return env;
    }, {
      cleanTerms: [],
      hyphenizedTerms: [],
    });
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
    const allAsPhrase = qterms.cleanTerms.join(' ');
    const phrases = [allAsPhrase].concat(termsToPhrases(qterms.cleanTerms, allStopwords));
    const justTerms = qterms.cleanTerms.filter((term) => allStopwords.indexOf(term) === -1);
    return [...new Set(qterms.hyphenizedTerms.concat(phrases).concat(justTerms))];
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
