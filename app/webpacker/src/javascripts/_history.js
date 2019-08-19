import 'blacklight-frontend/app/javascript/blacklight/core';
import { elAddClass, elHasClass } from './_utils';

// When a user visits an item URL, add the ID of the object to localStorage so that subsequent
// search results are annotated.
function setDocHistory() {
  if (document.querySelector('body.blacklight-catalog-show') === null) return;
  const docID = document.querySelector('#document').dataset.docId;
  sessionStorage.setItem(`doc-history-${docID}`, docID);
}

function getDocHistory() {
  // Return early if we can
  if (document.querySelector('body.blacklight-catalog-index') === null) return;
  const documentsEl = document.querySelector('#documents');
  if (documentsEl === null) return;

  const documents = documentsEl.querySelectorAll('.document');
  documents.forEach((thisDoc) => {
    if (elHasClass(thisDoc, 'seen')) return;
    const docID = thisDoc.dataset.docId;
    const seen = document.createElement('i');
    seen.className = 'fas fa-check';
    seen.title = 'Previously viewed this session.';
    seen.dataset.toggle = 'tooltip';

    if (sessionStorage.getItem(`doc-history-${docID}`)) {
      const docTitle = thisDoc.querySelector('.document-title-heading');
      elAddClass(thisDoc, 'seen');
      docTitle.appendChild(seen);
    }
  });
}

export {
  setDocHistory,
  getDocHistory,
};
