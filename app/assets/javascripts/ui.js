const has = Object.prototype.hasOwnProperty;
const idTypes = {
  isbn: 'isbnNumbers',
  oclc: 'oclcNumbers',
};

function ready(fn) {
  if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('turbolinks:load', fn);
  }
}

function docIDObject() {
  const thumbnails = document.querySelectorAll('.thumbnail-link');
  const docObject = {};
  Object.keys(idTypes).forEach((idKey) => {
    docObject[idKey] = {};
  });
  thumbnails.forEach((thumb) => {
    Object.entries(idTypes).forEach(([idKey, dataID]) => {
      const idString = thumb.dataset[dataID];
      const bibString = thumb.dataset.bibId;
      if (idString !== undefined) {
        const idStripped = idString.replace(/[[\]"']+/g, '');
        const idArray = idStripped.split(',');
        idArray.forEach((id) => {
          docObject[idKey][id] = { bib: bibString };
        });
      }
    });
  });
  return docObject;
}

window.replaceImages = function (payload) {
  let documentsEl;
  if (document.body.classList.contains('blacklight-catalog-index')) {
    documentsEl = document.querySelector('#documents');
  } else if (document.body.classList.contains('blacklight-catalog-show')) {
    documentsEl = document.querySelector('#document');
  }
  const docIDs = docIDObject();
  Object.entries(payload).forEach(([bookKey, bookData]) => {
    const [idType, id] = bookKey.split(':');
    const docThumbEl = documentsEl.querySelector(`[data-bib-id="${docIDs[idType][id].bib}"]`);
    if (has.call(bookData, 'thumbnail_url')) {
      const thumbPlaceholder = docThumbEl.querySelector('.document-thumbnail');
      if (thumbPlaceholder) {
        const imgSrcZoom = bookData.thumbnail_url.replace(/zoom=./, 'zoom=1');
        const imgSrc = imgSrcZoom.replace('&edge=curl', '');
        console.log(`${imgSrc}`);
        thumbPlaceholder.outerHTML = `<img class="document-thumbnail thumbnail-loaded img-fluid" src="${imgSrc}">`;
      }
    }
  });
};

function docIDArray() {
  const thumbnails = document.querySelectorAll('.thumbnail-link');
  const docArray = [];
  thumbnails.forEach((thumb) => {
    Object.entries(idTypes).forEach(([idKey, dataID]) => {
      const idString = thumb.dataset[dataID];
      if (idString !== undefined) {
        const idStripped = idString.replace(/[[\]"']+/g, '');
        const idArray = idStripped.split(',');
        idArray.forEach(id => docArray.push(`${idKey}:${id}`));
      }
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

  if (bibkeyQueryString.length > 0) {
    const scriptElement = document.createElement('script');
    scriptElement.setAttribute('id', 'jsonScript');
    scriptElement.setAttribute('src',
      `https://books.google.com/books?bibkeys=${bibkeyQueryString}&jscmd=viewapi&callback=replaceImages`);
    scriptElement.setAttribute('type', 'text/javascript');
    document.documentElement.firstChild.appendChild(scriptElement);
  }
}

ready(replaceBookCovers);
