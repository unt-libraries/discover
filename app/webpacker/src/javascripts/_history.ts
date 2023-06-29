// When a user visits an item URL, add the ID of the object to localStorage so that subsequent
// search results are annotated.
function setDocHistory(): void {
  const bodyElement: HTMLElement | null = document.querySelector('body.blacklight-catalog-show');
  if (!bodyElement) return;

  const docElement: HTMLElement | null = document.querySelector('#document');
  if (docElement) {
    const { docId } = docElement.dataset as { docId: string };
    sessionStorage.setItem(`doc-history-${docId}`, docId);
  }
}

function getDocHistory(): void {
  const indexBodyElement = document.querySelector('body.blacklight-catalog-index');
  if (!indexBodyElement) return;

  const documentsEl = document.querySelector('#documents');
  if (!documentsEl) return;

  const documents: NodeListOf<HTMLElement> = documentsEl.querySelectorAll('.document');
  documents.forEach((thisDoc) => {
    if (thisDoc.classList.contains('seen')) return;

    const { docId } = thisDoc.dataset as { docId: string };
    const seen = document.createElement('i');
    seen.className = 'fas fa-check';
    seen.title = 'Previously viewed this session.';
    seen.dataset.toggle = 'tooltip';

    if (sessionStorage.getItem(`doc-history-${docId}`)) {
      const docTitle = thisDoc.querySelector('.document-title-heading');
      if (docTitle) {
        thisDoc.classList.add('seen');
        docTitle.appendChild(seen);
      }
    }
  });
}

export {
  setDocHistory,
  getDocHistory,
};
