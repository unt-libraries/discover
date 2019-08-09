// import $ from 'jquery';
// import Cookies from 'js-cookie';

(function () {
  // IE8+ compatible test for class on element
  function elHasClass(el, className) {
    let hasClass;
    if (el.classList) {
      hasClass = el.classList.contains(className);
    } else {
      hasClass = new RegExp(`(^| )${className}( |$)`, 'gi').test(el.className);
    }
    return hasClass;
  }

  // IE8+ compatible add class to element
  function elAddClass(el, className) {
    if (el.classList) {
      el.classList.add(className);
    } else {
      el.className += ` ${className}`;
    }
  }

  // IE8+ compatible add class to element
  function elRemoveClass(el, className) {
    if (el.classList) {
      el.classList.remove(className);
    } else {
      el.className = el.className.replace(new RegExp(`(^|\\b)${className.split(' ').join('|')  }(\\b|$)`, 'gi'), ' ');
    }
  }

  // When a user visits an ARK URL, set the MetaID of the object in localStorage so that subsequent
  // search results are annotated.
  function setDocHistory() {
    if (document.querySelector('body.blacklight-catalog-show') === null) return;
    const docID = document.querySelector('#document').dataset.docId;
    sessionStorage.setItem(`doc-history-${docID}`, docID);
  }

  function getDocHistory() {
    if (document.querySelector('body.blacklight-catalog-index') === null) return;
    const documentsEl = document.querySelector('#documents');
    if (documentsEl === null) return;

    const documents = documentsEl.querySelectorAll('.document');
    documents.forEach((thisDoc) => {
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

  // Set Cookie when user clicks a search result link to ARK. Subsequently read in template to
  // remember scroll position
  // function setSearchResultScrollPosition() {
  //   if ($('body.results').length) {
  //     $('#main-section').find('.result a').on('click', function () {
  //       const $thisResult = $(this).closest('article.result').attr('id');
  //       Cookies.set('aubreyBackToResult', $thisResult);
  //     });
  //   }
  // }

  // export {
  //   setDocHistory,
  //   getArkHistory,
  //   setSearchResultScrollPosition,
  // };

  Blacklight.onLoad(() => {
    setDocHistory();
    getDocHistory();
  });
}());
