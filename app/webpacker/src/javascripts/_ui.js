import {
  elAddClass,
  elHasClass,
  elRemoveClass,
  removeAllChildren,
} from './_utils';
import 'bootstrap/js/dist/tooltip';
import 'bootstrap/js/dist/popover';
import Cookies from 'js-cookie';
import escapeRegExp from 'lodash/escapeRegExp';

const has = Object.prototype.hasOwnProperty;
const idTypes = {
  isbn: 'isbnNumbers',
  oclc: 'oclcNumbers',
};

/**
 * Collects ISBN and OCLC numbers and associates with bib IDs.
 * @return {Object}
 */
function docIDObject() {
  const documents = document.querySelectorAll('.document');
  const docObject = {};
  Object.keys(idTypes).forEach((idKey) => {
    docObject[idKey] = {};
  });
  documents.forEach((doc) => {
    Object.entries(idTypes).forEach(([idKey, dataID]) => {
      const idString = doc.dataset[dataID];
      const bibString = doc.dataset.bibId;
      if (idString === undefined) return;

      const idStripped = idString.replace(/[[\]"']+/g, '');
      const idArray = idStripped.split(',');
      idArray.forEach((id) => {
        docObject[idKey][id] = { bib: bibString };
      });
    });
  });
  return docObject;
}

/**
 * Replaces thumbnail container element with thumbnail image from Google Books API data
 * @param {(HTMLElement|Element)} thumbContainer
 * @param {Object} bookData
 */
function replaceThumbnailElement(thumbContainer, bookData) {
  const titleEl = thumbContainer.querySelector('.item-title');
  const itemTitle = titleEl.textContent;
  const imgSrcZoom = bookData.thumbnail_url.replace(/zoom=./, 'zoom=1');
  const imgSrc = imgSrcZoom.replace('&edge=curl', '');
  const newEl = document.createElement('img');

  newEl.className = 'img-fluid lazyload';
  newEl.alt = itemTitle;
  newEl.tabIndex = -1;
  newEl.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  newEl.dataset.src = imgSrc;
  newEl.setAttribute('aria-hidden', 'true');
  removeAllChildren(thumbContainer);
  thumbContainer.appendChild(newEl);
  elAddClass(thumbContainer, 'thumbnail-loaded');
}

/**
 * Iterates through images found in Google Books API to replace on the index view.
 * Attached to the window object so that it may be used as a callback from JSONP
 * @param {Object} payload
 */
window.replaceThumbs = function (payload) {
  const documentsEl = document.querySelector('#main-container');
  const docIDs = docIDObject();

  Object.entries(payload).forEach(([bookKey, bookData]) => {
    const [idType, id] = bookKey.split(':');
    const docThumbEl = documentsEl.querySelectorAll(`.document-thumbnail[data-bib-id="${docIDs[idType][id].bib}"]`);
    if (has.call(bookData, 'thumbnail_url')) {
      docThumbEl.forEach((thumbEl) => {
        if (!elHasClass(thumbEl, 'thumbnail-loaded')) {
          replaceThumbnailElement(thumbEl, bookData);
        }
      });
    }
  });
};

/**
 * Collects bib ID numbers from documents and removes 'b' to create and array of document IDs.
 * @return {Array}
 */
function docIDArray() {
  const mainContainer = document.querySelector('#main-container');
  const documents = mainContainer.querySelectorAll('.document');
  const docArray = [];
  documents.forEach((doc) => {
    Object.entries(idTypes).forEach(([idKey, dataID]) => {
      const idString = doc.dataset[dataID];
      if (idString === undefined) return;

      const idStripped = idString.replace(/[[\]"']+/g, '');
      const idArray = idStripped.split(',');
      idArray.forEach((id) => docArray.push(`${idKey}:${id}`));
    });
  });
  return docArray;
}

/**
 * Create query string of doc IDs for Google Books API
 */
function docIDQueryString() {
  const bibArray = docIDArray();
  return bibArray.join(',');
}

/**
 * Entry point to updating book covers and calling Google Books API with callback
 */
function replaceBookCovers() {
  const bibkeyQueryString = docIDQueryString();
  if (bibkeyQueryString.length === 0) return;
  const booksCallback = 'replaceThumbs';

  const scriptElement = document.createElement('script');
  scriptElement.id = 'jsonScript';
  scriptElement.src = `https://books.google.com/books?bibkeys=${bibkeyQueryString}&jscmd=viewapi&callback=${booksCallback}`;
  scriptElement.type = 'text/javascript';
  document.head.appendChild(scriptElement);
}

/**
 * Initializes tooltips already in the DOM, as well as dynamically added tooltips.
 */
function initTooltips() {
  $(document).tooltip({
    selector: '[data-toggle="tooltip"]',
    boundary: 'window',
  });
}

/**
 * Initializes popovers already in the DOM, as well as dynamically added popovers.
 */
function initPopovers() {
  $(document).popover({
    selector: '[data-toggle="popover"]',
  });
}

/**
 * Finds buttons with class `.reveal-more` and binds click event to hide
 * sibling `.more-min` and reveal `.more-max`
 */
function bindShowAvailMoreField() {
  const moreScope = document.querySelector('[data-more-scope]');
  const moreLink = moreScope.querySelector('.reveal-more');
  const lessLink = moreScope.querySelector('.reveal-less');
  const moreMax = moreScope.querySelectorAll('.more-max');
  if (moreLink === null) return;

  moreLink.addEventListener('click', () => {
    moreMax.forEach((thisEl) => {
      elRemoveClass(thisEl, 'd-none');
    });
    elAddClass(moreLink, 'd-none');
    elRemoveClass(lessLink, 'd-none');
    moreScope.removeAttribute('data-showing-less');
    moreScope.setAttribute('data-showing-more', 'true');
  });

  lessLink.addEventListener('click', () => {
    moreMax.forEach((thisEl) => {
      elAddClass(thisEl, 'd-none');
    });
    elAddClass(lessLink, 'd-none');
    elRemoveClass(moreLink, 'd-none');
    moreScope.removeAttribute('data-showing-more');
    moreScope.setAttribute('data-showing-less', 'true');
  });
}

// animate the search icon on search form submits to indicate 'thinking'
function animateSearchIcon() {
  const searchForms = document.querySelectorAll('.search-query-form');
  searchForms.forEach((thisForm) => {
    thisForm.addEventListener('submit', (e) => {
      const buttonIcon = e.currentTarget.querySelector('.fa-search');
      elRemoveClass(buttonIcon, 'fa-search');
      elAddClass(buttonIcon, 'fa-circle-notch', 'fa-spin');
    });
  });
}

// Store a cookie if the banner is dismissed
function bindDismissBannerCookie(name, selector, expiry = undefined) {
  $(selector).on('closed.bs.alert', () => {
    Cookies.set(`banner_dismissed_${name}`, '1', { expires: expiry });
  });
}

/**
 * Similar function to what we use on III to linkify urls and email addresses in fields
 * that have a specific class.
 */
function linkify() {
  const $linkifyFields = $('.linkify-text');
  // define skipIt -- function used to compare found URLs to any pre-existing links.
  // e.g., we may match a URL in the text that's already enclosed in an <a> tag,
  // in which case we don't want to linkify that URL.
  function skipIt(obj, test) {
    let val = false;
    $(obj).find('a').each(function () {
      if ($(this).text().match(escapeRegExp(test))) {
        val = true;
      }
    });
    return val;
  }

  $linkifyFields.each(function () {
    const pattern = /(\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b)|(https?:\/\/[^\s]+)/gi; // group 1 = email address, group 2 = URL
    let match;
    while (match = pattern.exec($(this).text())) {
      let mText = match[1] ? match[1] : match[2] ? match[2] : '';
      const mailto = match[1] ? 'mailto:' : '';
      if (mText && !skipIt($(this), mText)) {
        // trim trailing punctuation
        mText = mText.replace(/(\)[:,;.])$|(][:,;.])$|([:,;.)\]])$/, '');
        $(this).html($(this).html().replace(mText, `<a class="textLink" href="${mailto}${mText}">${mText}</a>`));
      }
    }
  });
}

export {
  animateSearchIcon,
  bindDismissBannerCookie,
  bindShowAvailMoreField,
  initPopovers,
  initTooltips,
  linkify,
  replaceBookCovers,
};
