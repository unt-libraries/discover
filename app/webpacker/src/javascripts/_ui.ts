import 'bootstrap/js/dist/tooltip';
import 'bootstrap/js/dist/popover';

type IdTypes = Record<string, string>;
const idTypes: IdTypes = {
  isbn: 'isbnNumbers',
  oclc: 'oclcNumbers',
};

/**
 * Collects ISBN and OCLC numbers and associates with bib IDs.
 * @return {Object}
 */
function docIDObject() {
  const documents = Array.from(document.querySelectorAll('.document'));
  const docObject = Object.keys(idTypes).reduce((obj, idKey) => {
    // eslint-disable-next-line no-param-reassign
    obj[idKey] = {};
    return obj;
  }, {} as { [idKey: string]: any });
  documents.forEach((doc) => {
    Object.entries(idTypes).forEach(([idKey, dataID]) => {
      const idString = (doc as HTMLElement).dataset[dataID];
      const bibString = (doc as HTMLElement).dataset.bibId;
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
 * @param {{ thumbnail_url: string }} bookData
 */
function replaceThumbnailElement(thumbContainer: Element, bookData: { thumbnail_url: string }) {
  const titleEl = thumbContainer.querySelector('.item-title');
  const itemTitle = titleEl?.textContent ?? '';
  const imgSrcZoom = bookData.thumbnail_url.replace(/zoom=./, 'zoom=1');
  const imgSrc = imgSrcZoom.replace('&edge=curl', '');
  const newEl = document.createElement('img');

  newEl.className = 'img-fluid lazyload';
  newEl.alt = itemTitle;
  newEl.tabIndex = -1;
  newEl.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  newEl.dataset.src = imgSrc;
  newEl.setAttribute('aria-hidden', 'true');
  thumbContainer.replaceChildren(newEl);
  thumbContainer.classList.add('thumbnail-loaded');
}

/**
 * Iterates through images found in Google Books API to replace on the index view.
 * Attached to the window object so that it may be used as a callback from JSONP
 * @param {Record<string, { thumbnail_url: string }>} payload
 */
// @ts-ignore
window.replaceThumbs = function (payload: Record<string, { thumbnail_url: string }>): void {
  const documentsEl = document.querySelector('#main-container');
  const docIDs = docIDObject();

  Object.entries(payload).forEach(([bookKey, bookData]) => {
    const [idType, id] = bookKey.split(':');
    const docThumbEl = documentsEl?.querySelectorAll(`.document-thumbnail[data-bib-id="${docIDs[idType][id].bib}"]`);
    if (bookData?.thumbnail_url) {
      docThumbEl?.forEach((thumbEl) => {
        if (!thumbEl.classList.contains('thumbnail-loaded')) {
          replaceThumbnailElement(thumbEl, bookData);
        }
      });
    }
  });
};

/**
 * Collects bib ID numbers from documents and removes 'b' to create an array of document IDs.
 * @return {Array<string>}
 */
function docIDArray(): string[] {
  const mainContainer = document.querySelector('#main-container');
  const documents = mainContainer?.querySelectorAll('.document');
  const docArray: string[] = [];

  documents?.forEach((doc) => {
    Object.entries(idTypes).forEach(([idKey, dataID]) => {
      const idString = (doc as HTMLElement).dataset[dataID];
      if (idString === undefined) return;

      const idStripped = idString.replace(/[[\]"']+/g, '');
      const idArray = idStripped.split(',');
      idArray.forEach((id) => docArray.push(`${idKey}:${id}`));
    });
  });
  return docArray;
}

/**
 * Entry point to updating book covers and calling Google Books API with callback
 */
function replaceBookCovers() {
  const bibArray: string[] = docIDArray();
  const bibkeyQueryString = bibArray.join(',');
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
    // @ts-ignore
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
  const moreScopes = Array.from(document.querySelectorAll('[data-more-scope]'));

  moreScopes.forEach((moreScope) => {
    const moreLink = moreScope.querySelector<HTMLElement>('.reveal-more');
    const lessLink = moreScope.querySelector<HTMLElement>('.reveal-less');
    const moreMax = Array.from(moreScope.querySelectorAll<HTMLElement>('.more-max'));

    if (!moreLink) return;

    // eslint-disable-next-line no-unused-vars
    let isShowingMore = false;

    moreLink.addEventListener('click', () => {
      moreMax.forEach((thisEl) => {
        thisEl.classList.toggle('d-none');
      });
      moreLink.classList.toggle('d-none');
      lessLink?.classList.toggle('d-none');
      isShowingMore = true;
    });

    lessLink?.addEventListener('click', () => {
      moreMax.forEach((thisEl) => {
        thisEl.classList.toggle('d-none');
      });
      lessLink.classList.toggle('d-none');
      moreLink.classList.toggle('d-none');
      isShowingMore = false;
    });
  });
}

// animate the search icon on search form submits to indicate 'thinking'
function animateSearchIcon() {
  const searchForms = document.querySelectorAll('.search-query-form');
  searchForms.forEach((thisForm) => {
    thisForm.addEventListener('submit', (e) => {
      const buttonIcon = (e.currentTarget as HTMLInputElement).querySelector('.fa-search');
      buttonIcon?.classList.remove('fa-search');
      buttonIcon?.classList.add('fa-circle-notch', 'fa-spin');
    });
  });
}

// Store a cookie if the banner is dismissed
function bindDismissBannerCookie() {
  const siteMessages = document.querySelector('#site-messages');
  siteMessages?.addEventListener('closed.bs.alert', (event) => {
    const alert = (event.target as HTMLElement).closest('.alert-dismissible');
    if (!alert) {
      return;
    }
    const alertName = alert.getAttribute('data-alert-name');
    const alertExpiry = alert.getAttribute('data-alert-expiry');
    document.cookie = `banner_dismissed_${alertName}=1; expires=${alertExpiry}; path=/`;
  });
}

/**
 * Similar function to what we use on III to linkify urls and email addresses in fields
 * that have a specific class.
 */
function linkify() {
  const linkifyFields = document.querySelectorAll('.linkify-text');

  linkifyFields.forEach((field) => {
    const pattern = /(https?:\/\/?[\da-z.-]+\.[a-z.]{2,6})\/?/gi; // match URLs that are not already in an href attribute or inside an HTML tag
    const emailPattern = /(\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b)/gi; // match email addresses
    let html = field.innerHTML;

    // replace URLs
    html = html.replace(pattern, '<a class="textLink" target="_blank" rel="noopener" href="$1">$1</a>');

    // replace email addresses
    html = html.replace(emailPattern, '<a class="textLink emailLink" target="_blank" rel="noopener" href="mailto:$1">$1</a>');

    // eslint-disable-next-line no-param-reassign
    field.innerHTML = html;
  });
}

// When a link in hierarchical linking results is hovered,
// add hover state to previous elements on the same line
function hoverHierarchicalLinks() {
  // Collect desired elements
  const showDoc = document.querySelector('.show-document');
  const linkRows = showDoc?.querySelectorAll('.result__value__row.hierarchical-link');
  if (!linkRows) return;

  linkRows.forEach((row) => {
    // children are a and span elements
    const { children } = row;
    Array.from(children).forEach((childElement) => {
      if (childElement.nodeName === 'A') {
        childElement.addEventListener('mouseenter', () => {
          let prevSibling = childElement.previousElementSibling;
          while (prevSibling) {
            prevSibling.classList.add('hover');
            prevSibling = prevSibling.previousElementSibling;
          }
        });

        childElement.addEventListener('mouseleave', () => {
          let prevSibling = childElement.previousElementSibling;
          while (prevSibling) {
            prevSibling.classList.remove('hover');
            prevSibling = prevSibling.previousElementSibling;
          }
        });
      }
    });
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
  hoverHierarchicalLinks,
};
