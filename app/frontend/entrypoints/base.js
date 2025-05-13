// Script files that should be included in all pages
import Turbolinks from 'turbolinks';
import runBrowserUpdate from '~/src/javascripts/_browser-update';
import { initPrefilters, searchSelector } from '~/src/javascripts/_search';
import { animateSearchIcon, bindDismissBannerCookie, linkify } from '~/src/javascripts/_ui';

// Javascript inherited from www
import '~/src/javascripts/www/main'; // This is the main entry point for the www pack
import '~/src/javascripts/www/display.alerts';
import SearchDropdown from '~/src/javascripts/www/search-dropdowns.js';

document.addEventListener('turbolinks:load', () => {
  // Initialize search dropdowns using window object
  new SearchDropdown('bento-offcanvas-other-search-options', 'bento-offcanvas-q', window.wwwJsShims.searchDropdowns['default_bento']);
});

document.addEventListener("DOMContentLoaded", () => {
  Turbolinks.start();
});

// Blacklight Frontend javascript
import 'blacklight-frontend/app/javascript/blacklight/core';
// TODO: Need to refactor or remove modal code, as it depends on jQuery
// import 'blacklight-frontend/app/javascript/blacklight/modal';
import 'blacklight-frontend/app/javascript/blacklight/button_focus';
import 'blacklight-frontend/app/javascript/blacklight/search_context';

document.addEventListener('turbolinks:load', () => {
  animateSearchIcon();
  initPrefilters();
  searchSelector();
  linkify();
  bindDismissBannerCookie();
  runBrowserUpdate();
});
