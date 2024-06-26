import Mark from 'mark.js';

/**
 * Uses mark.js to highlight search terms in Show view
 */
function highlightSearchTerms(): void {
  /**
   * Converts a user query string to two arrays:
   * @param {string} q
   * @param {Array} allStopwords
   * @param {boolean} asPhrasesOnly Whether to treat this as a call number or not
   * @return {Object}
   *   terms {Array} list of individual terms from the user query, in query order
   *   phrasesOnly {Array} list of hyphenated phrases for e.g. call numbers or parts of call numbers
   */
  // eslint-disable-next-line max-len
  function queryToTerms(q: string, allStopwords: string[], asPhrasesOnly: boolean): { terms: string[], phrasesOnly: string[] } {
    return q.split('"').reduce((env, term, i) => {
      const insideQuotes = i % 2;
      const trimmed = term.trim();
      const parsed = trimmed.split(/\p{P}*\s+\p{P}*/u).reduce((wordEnv, word, j, original) => {
        if (word !== '') {
          const normWord = word.replace(/(?:(\p{L})(\p{N})|(\p{N})(\p{L}))/u, '$1$3-$2$4');
          const lastWord = wordEnv.terms.length > 0 ? wordEnv.terms[wordEnv.terms.length - 1] : '';
          const atAlphaNumTransition = lastWord !== '' && /(\p{L}~!!~\p{N}|\p{N}~!!~\p{L})/u.test([lastWord, normWord].join('~!!~'));
          const atEndOfLoop = j === original.length - 1;
          if (asPhrasesOnly || atAlphaNumTransition) {
            wordEnv.wordStack.push(normWord);
          }
          if (atEndOfLoop || (!asPhrasesOnly && !atAlphaNumTransition)) {
            if (asPhrasesOnly || wordEnv.wordStack.length > 1) {
              wordEnv.phrasesOnly.push(wordEnv.wordStack.join('-'));
            }
            // eslint-disable-next-line no-param-reassign
            wordEnv.wordStack = [normWord];
          }
          wordEnv.terms.push(normWord);
        }
        return wordEnv;
      }, {
        terms: [] as string[],
        phrasesOnly: [] as string[],
        wordStack: [] as string[],
      });
      if (insideQuotes && parsed.terms.every((word) => allStopwords.indexOf(word) > -1)) {
        env.terms.push(trimmed);
      } else {
        env.terms.push(...parsed.terms);
      }
      env.phrasesOnly.push(...parsed.phrasesOnly);
      return env;
    }, {
      terms: [] as string[],
      phrasesOnly: [] as string[],
    });
  }

  /**
   * Returns an array containing all *phrases* from the list of terms that should be highlighted,
   * including both the user's phrases and phrases generated from stopwords.
   * @param {Array} terms
   * @param {Array} allStopwords
   * @return {Array}
   */
  function termsToPhrases(terms: string[], allStopwords: string[]): string[] {
    function doStack(mainTerm: string, stack: string[], forward: boolean): string[] {
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
          // eslint-disable-next-line no-param-reassign
          env.stopwordStack = [];
        }
        // eslint-disable-next-line no-param-reassign
        env.previousMainTerm = term;
      }
      return env;
    }, {
      allStopwords,
      finalPhrases: [] as string[],
      previousMainTerm: '',
      stopwordStack: [] as string[],
    });
    if (result.stopwordStack.length && result.previousMainTerm) {
      result.finalPhrases.push(...doStack(result.previousMainTerm, result.stopwordStack, true));
    }
    return result.finalPhrases;
  }

  /**
   * The main function to use to parse a user query.
   * @param userQuery - The user query to parse.
   * @param allStopwords - An array of stopwords to ignore.
   * @param asPhrasesOnly - A boolean value indicating whether the search type
   *                        should be treated as a call number or not.
   * @returns An array of all terms to find (does not include stopwords).
   */
  // eslint-disable-next-line max-len
  function parseUserQuery(userQuery: string, allStopwords: string[], asPhrasesOnly: boolean): string[] {
    const qterms = queryToTerms(userQuery.toLowerCase(), allStopwords, asPhrasesOnly);
    if (asPhrasesOnly) {
      return qterms.phrasesOnly.length > 1 ? [qterms.phrasesOnly.join(' ')].concat(qterms.phrasesOnly) : qterms.phrasesOnly;
    }
    const phrases = [qterms.terms.join(' ')].concat(qterms.phrasesOnly).concat(termsToPhrases(qterms.terms, allStopwords));
    const justTerms = qterms.terms.filter((term) => allStopwords.indexOf(term) === -1);
    return [...new Set(phrases.concat(justTerms))];
  }

  // Example vars that may need to be changed. These are used in both methods.
  // Array of stopwords for demonstration purposes.
  const myStopwords = ['a', 'an', 'the', 'is', 'in', 'on', 'of', 'to', 'from', 'and'];

  /**
   * Converts a list of terms to a RegExp to pass to mark.js. It handles: diacritics,
   * internal word-delimiters (i.e., non-space punctuation within a word), and word-boundary
   * delimiters (any amount of punctuation or space between words).
   * @param {Array} punctuationArray
   * @param {Array} terms
   * @return {RegExp}
   */
  function termsToRegExp(terms: string[]): RegExp {
    const diacritics = [
      'aàáảãạăằắẳẵặâầấẩẫậäåāąAÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÄÅĀĄ',
      'cçćčCÇĆČ',
      'dđďDĐĎ',
      'eèéẻẽẹêềếểễệëěēęEÈÉẺẼẸÊỀẾỂỄỆËĚĒĘ',
      'iìíỉĩịîïīIÌÍỈĨỊÎÏĪ',
      'lłLŁ',
      'nñňńNÑŇŃ',
      'oòóỏõọôồốổỗộơởỡớờợöøōOÒÓỎÕỌÔỒỐỔỖỘƠỞỠỚỜỢÖØŌ',
      'rřRŘ',
      'sšśșşSŠŚȘŞ',
      'tťțţTŤȚŢ',
      'uùúủũụưừứửữựûüůūUÙÚỦŨỤƯỪỨỬỮỰÛÜŮŪ',
      'yýỳỷỹỵÿYÝỲỶỸỴŸ',
      'zžżźZŽŻŹ',
    ];
    const internalPunctRe = '[\\p{P}]';
    const wordDelimitersRe = '[\\s\\p{P}]';
    const finalTermList = terms.map((term) => term.split(new RegExp(`${wordDelimitersRe}+`, 'u')).map((word) => word.split('').map((char) => {
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
    return new RegExp(`(^|${wordDelimitersRe}+)(${finalTermList.join('|')})(?=(${wordDelimitersRe}+|$))`, 'iu');
  }

  function getSearchData() {
    const searchContextEl = document.getElementById('searchContext');
    if (!searchContextEl) return null;
    const { searchContext } = searchContextEl.dataset;
    if (!searchContext) return null;
    return JSON.parse(searchContext);
  }

  function regExpMark() {
    const searchData = getSearchData();
    if (!searchData || !searchData.q) return;
    const userQuery = searchData.q;
    const searchType = searchData.search_field;
    const numberSearchTypes = ['call_number', 'sudoc', 'standard_number', 'control_number'];
    const searchFields = ['call_numbers_display', 'sudocs_display', 'isbns_display',
      'issns_display', 'other_standard_numbers_display', 'lccns_display', 'oclc_numbers_display',
      'other_control_numbers_display'];
    let instance: Mark;
    let termList: string[];

    if (numberSearchTypes.includes(searchType)) {
      termList = parseUserQuery(userQuery, myStopwords, true);
      instance = new Mark(document.querySelectorAll(`${searchFields.map((field) => `.card.item-more_details .blacklight-${field}`).join(', ')}, #availabilityTable .blacklight-call-number.result__value`));
    } else {
      termList = parseUserQuery(userQuery, myStopwords, false);
      instance = new Mark(document.querySelectorAll('.card.item-more_details, #availabilityTable .blacklight-call-number.result__value'));
    }

    // Remove previous marked elements and mark new phrases and words
    instance.unmark({
      done() {
        /* Punctuation and spacing in the terms parsed from the user query are replaced with
           character classes that will match most punctuation and space, to give better
           highlighting/matching no matter what word delimiter is used in the query *and* the text.
        */
        const termRe = termsToRegExp(termList);
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
  // eslint-disable-next-line import/prefer-default-export
  highlightSearchTerms,
};
