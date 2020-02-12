import { elAddClass, elHasClass, elRemoveClass } from './_utils';

const has = Object.prototype.hasOwnProperty;
const idTypes = {
  isbn: 'isbnNumbers',
  oclc: 'oclcNumbers',
};

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

function replaceThumbnailElement(thumbContainer, bookData) {
  const titleEl = thumbContainer.querySelector('.item-title');
  const itemTitle = titleEl.textContent;
  const imgSrcZoom = bookData.thumbnail_url.replace(/zoom=./, 'zoom=1');
  const imgSrc = imgSrcZoom.replace('&edge=curl', '');
  thumbContainer.innerHTML = `<img class="img-fluid" src="${imgSrc}" alt="${itemTitle}">`;
  elAddClass(thumbContainer, 'thumbnail-loaded');
}

window.replaceIndexThumbs = function (payload) {
  if (!elHasClass(document.body, 'blacklight-catalog-index')) return;

  const documentsEl = document.querySelector('#documents');
  const docIDs = docIDObject();

  Object.entries(payload).forEach(([bookKey, bookData]) => {
    const [idType, id] = bookKey.split(':');
    const docThumbEl = documentsEl.querySelector(`[data-bib-id="${docIDs[idType][id].bib}"]`);
    if (has.call(bookData, 'thumbnail_url')) {
      const thumbContainer = docThumbEl.querySelector('.document-thumbnail');
      if (thumbContainer && !elHasClass(thumbContainer, 'thumbnail-loaded')) {
        replaceThumbnailElement(thumbContainer, bookData);
      }
    }
  });
};

window.replaceShowThumb = function (payload) {
  if (!elHasClass(document.body, 'blacklight-catalog-show')) return;

  const thumbContainers = document.querySelectorAll('.document-thumbnail');

  Object.entries(payload).forEach(([bookKey, bookData]) => {
    if (has.call(bookData, 'thumbnail_url')) {
      Array.prototype.forEach.call(thumbContainers, (thumbContainer) => {
        if (thumbContainer && !elHasClass(thumbContainer, 'thumbnail-loaded')) {
          replaceThumbnailElement(thumbContainer, bookData);
        }
      });
    }
  });
};

function docIDArray() {
  const mainContaner = document.querySelector('#main-container');
  const documents = mainContaner.querySelectorAll('.document');
  const docArray = [];
  documents.forEach((doc) => {
    Object.entries(idTypes).forEach(([idKey, dataID]) => {
      const idString = doc.dataset[dataID];
      if (idString === undefined) return;

      const idStripped = idString.replace(/[[\]"']+/g, '');
      const idArray = idStripped.split(',');
      idArray.forEach(id => docArray.push(`${idKey}:${id}`));
    });
  });
  return docArray;
}

function docIDQueryString() {
  const bibArray = docIDArray();
  return bibArray.join(',');
}

function replaceBookCovers() {
  const bibkeyQueryString = docIDQueryString();
  let booksCallback;
  if (elHasClass(document.body, 'blacklight-catalog-index')) {
    booksCallback = 'replaceIndexThumbs';
  } else if (elHasClass(document.body, 'blacklight-catalog-show')) {
    booksCallback = 'replaceShowThumb';
  }

  if (bibkeyQueryString.length > 0) {
    const scriptElement = document.createElement('script');
    scriptElement.setAttribute('id', 'jsonScript');
    scriptElement.setAttribute('src',
      `https://books.google.com/books?bibkeys=${bibkeyQueryString}&jscmd=viewapi&callback=${booksCallback}`);
    scriptElement.setAttribute('type', 'text/javascript');
    document.head.appendChild(scriptElement);
  }
}

function initTooltips() {
  $('[data-toggle="tooltip"]').tooltip({
    container: 'body',
  });
}

function initPopovers() {
  $('[data-toggle="popover"]').popover({
    container: 'body',
  });
}

function bindRevealMoreFields() {
  const moreLinks = document.querySelectorAll('.reveal-more');

  moreLinks.forEach((el) => {
    el.addEventListener('click', () => {
      const elParent = el.parentNode;
      const moreMin = elParent.querySelector('.more-min');
      const moreMax = elParent.querySelector('.more-max');
      elAddClass(el, 'd-none');
      elAddClass(moreMin, 'd-none');
      elRemoveClass(moreMax, 'd-none');
    });
  });
}

export {
  replaceBookCovers,
  initTooltips,
  initPopovers,
  bindRevealMoreFields,
};
