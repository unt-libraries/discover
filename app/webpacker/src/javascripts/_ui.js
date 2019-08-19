import 'blacklight-frontend/app/javascript/blacklight/core';
import { elAddClass, elHasClass, elRemoveClass } from './_utils';
import 'bootstrap';

const has = Object.prototype.hasOwnProperty;
const idTypes = {
  isbn: 'isbnNumbers',
  oclc: 'oclcNumbers',
};

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

window.replaceImages = function (payload) {
  let documentsEl;
  if (elHasClass(document.body, 'blacklight-catalog-index')) {
    documentsEl = document.querySelector('#documents');
  } else if (elHasClass(document.body, 'blacklight-catalog-show')) {
    documentsEl = document.querySelector('#document');
  }
  const docIDs = docIDObject();
  Object.entries(payload).forEach(([bookKey, bookData]) => {
    const [idType, id] = bookKey.split(':');
    const docThumbEl = documentsEl.querySelector(`[data-bib-id="${docIDs[idType][id].bib}"]`);
    if (has.call(bookData, 'thumbnail_url')) {
      const thumbContainer = docThumbEl.querySelector('.document-thumbnail');
      if (thumbContainer && !elHasClass(thumbContainer, 'thumbnail-loaded')) {
        const titleEl = thumbContainer.querySelector('.item-title');
        const itemTitle = titleEl.textContent;
        const imgSrcZoom = bookData.thumbnail_url.replace(/zoom=./, 'zoom=1');
        const imgSrc = imgSrcZoom.replace('&edge=curl', '');
        thumbContainer.innerHTML = `<img class="img-fluid" src="${imgSrc}" alt="${itemTitle}">`;
        elAddClass(thumbContainer, 'thumbnail-loaded');
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

  if (bibkeyQueryString.length > 0) {
    const scriptElement = document.createElement('script');
    scriptElement.setAttribute('id', 'jsonScript');
    scriptElement.setAttribute('src',
      `https://books.google.com/books?bibkeys=${bibkeyQueryString}&jscmd=viewapi&callback=replaceImages`);
    scriptElement.setAttribute('type', 'text/javascript');
    document.documentElement.firstChild.appendChild(scriptElement);
  }
}

// Override link behavior within dropdown menu associated with search form for resource type,
// appending values to hidden form element.
function searchSelector() {
  const searchForm = document.querySelector('.search-query-form');
  if (searchForm === null) return;

  const queryInput = searchForm.querySelector('#q');
  const dropdown = searchForm.querySelector('#searchFieldDropdownGroup');
  const dropdownItems = dropdown.querySelectorAll('#search_field_dropdown .dropdown-item');

  dropdownItems.forEach((dropdownItem) => {
    dropdownItem.addEventListener('click', (e) => {
      // stop the link from acting like a link
      e.preventDefault();

      // set variables
      const selected = e.target;
      const selectedText = selected.dataset.pretty;
      const scopeValue = selected.dataset.searchField;

      // Set the visible text of the dropdown menu to whatever was selected
      dropdown.querySelector('.selected').innerHTML = selectedText;

      searchForm.querySelector('#search_field_input').value = scopeValue;

      // close the dropdown
      if (elHasClass(dropdown, 'open')) {
        elRemoveClass(dropdown, 'open');
      }

      // Send focus back to the text input
      queryInput.focus();
    });
  });
}

function bindAccordians() {
  $('#facetsExpandCollapse').on('click', function () {
    const $target = $(this);
    const $facetElements = $('.panel-collapse.facet-content');
    const buttonAction = $target.attr('data-button-action');
    if (buttonAction === 'expand') {
      $facetElements.collapse('show');
      $target.attr('data-button-action', 'collapse')
        .tooltip('hide')
        .attr('data-original-title', 'Collapse all')
        .tooltip('show');
    } else if (buttonAction === 'collapse') {
      $facetElements.collapse('hide');
      $target.attr('data-button-action', 'expand')
        .tooltip('hide')
        .attr('data-original-title', 'Expand all')
        .tooltip('show');
    }
  });
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

export {
  replaceBookCovers,
  searchSelector,
  bindAccordians,
  initTooltips,
  initPopovers,
};
