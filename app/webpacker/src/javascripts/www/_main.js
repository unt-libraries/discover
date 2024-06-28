// Modified for Discover from unt-jekyll-theme/_assets/_scripts/main.js
import size from 'lodash/size';
import words from 'lodash/words';

window.libutils = {};

// utility function to create function with timeout, used in ga events
window.libutils.actWithTimeOut = function (callback, optTimeout) {
  let called = false;
  function fn() {
    if (!called) {
      called = true;
      callback();
    }
  }
  setTimeout(fn, optTimeout || 1000);
  return fn;
};

// for ga events where we want to go directly to a typaheads url element
window.libutils.goToUrl = function (datum) {
  window.location.href = datum.url;
};

// for ga events where we want to message a url by concatenating a string and ID.
window.libutils.goToSubjectUrl = function (datum, path) {
  window.location.href = path + datum.id;
};

// convenience storage for reusable calls to sprinshare API urls.
window.libutils.sprinshareUrls = {
  subject_experts: 'https://lgapi-us.libapps.com/1.1/accounts/?site_id=702&key=9a0320695e007513e3f56d6f5f9e2159&expand=subjects',
  databases: 'https://lgapi-us.libapps.com/1.1/assets?site_id=702&key=9a0320695e007513e3f56d6f5f9e2159&asset_types=10&expand=az_props,subjects',
  guides_expand_owner_subject: 'https://lgapi-us.libapps.com/1.1/guides/?site_id=702&key=9a0320695e007513e3f56d6f5f9e2159&status[]=1&sort_by=name&expand=owner,subjects',
  subjects_list: 'https://lgapi-us.libapps.com/1.1/subjects?site_id=702&key=9a0320695e007513e3f56d6f5f9e2159',
  answer_faqs: 'https://api2.libanswers.com/1.0/search/%QUERY?iid=1758&callback=faqs',
};

// set the correct absolute path during development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.libutils.siteDomain = '';
} else {
  window.libutils.siteDomain = 'https://library.unt.edu';
}

export default function initDOM() {
  // set a number of reusable DOM variables
  const $head = $('#head');
  const $toTop = $('#to-top');
  const $bannerImg = $('#unt-banner-img');
  const $bannerLetterMark = $('#unt-banner-lettermark');

  // Set scrolling header ui by observing main nav relative to viewport
  const scrolledNav = document.querySelector('#primary-navigation');
  const scrolledNavObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      $head.removeClass('scrolled');
      $bannerImg.removeClass('d-none');
      $bannerLetterMark.addClass('d-none');
      $toTop.fadeOut();
    } else {
      $head.addClass('scrolled');
      $bannerImg.addClass('d-none');
      $bannerLetterMark.removeClass('d-none');
      $toTop.fadeIn();
    }
  }, {
    threshold: [0, 1],
  });
  // do the observing
  scrolledNavObserver.observe(scrolledNav);

  // When user clicks on the search icon in site header,
  // auto-focus the bento box input after drawer has opened.
  $('#search-drawer').on('shown.bs.modal', () => {
    $('#drawer-q').focus();
  });

  // pretty scroll to top of the screen on button push,
  $toTop.on('click', (e) => {
    e.preventDefault();
    $('body,html').animate({
      scrollTop: 0,
    }, 800);
    // remove hashes in the URL.
    window.history.pushState('', document.title, window.location.pathname + window.location.search);
  });
}
