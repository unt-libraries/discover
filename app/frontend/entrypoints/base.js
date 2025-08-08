// Script files that should be included in all pages
import '@hotwired/turbo-rails';
import Blacklight from 'blacklight-frontend';

import runBrowserUpdate from '~/src/javascripts/_browser-update';
import { searchSelector, initPrefilters, initFilters } from '~/src/javascripts/_search';
import {
  animateSearchIcon, bindDismissBannerCookie, linkify, replaceBookCovers,
} from '~/src/javascripts/_ui';
// TODO: Check that the chat widget appears on all pages
import '~/src/javascripts/www/main'; // This is the main entry point for the www pack
import '~/src/javascripts/www/display.alerts';
import SearchDropdown from '~/src/javascripts/www/search-dropdowns';

const initializePage = () => {
  const bodyElement = document.querySelector('body');
  if (!bodyElement) return;

  if (bodyElement.dataset.baseJsInitialized) return;
  bodyElement.dataset.baseJsInitialized = 'true';

  // Initialize search dropdowns using window object
  // eslint-disable-next-line no-new
  new SearchDropdown('bento-offcanvas-other-search-options', 'bento-offcanvas-q', window.wwwJsShims.searchDropdowns['default_bento']);

  animateSearchIcon();
  searchSelector();
  initPrefilters();
  initFilters();
  linkify();
  bindDismissBannerCookie();
  runBrowserUpdate();
  replaceBookCovers();
};

// Register for subsequent page loads
Blacklight.onLoad(initializePage);

// Run on initial page load
initializePage();
