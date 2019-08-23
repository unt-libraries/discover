// Script files that should be included at the bottom of all pages
import '../src/javascripts/www/_main';
import * as ui from '../src/javascripts/_ui';
import * as facets from '../src/javascripts/_facets';
import * as search from '../src/javascripts/_search';
import * as history from '../src/javascripts/_history';

document.addEventListener('turbolinks:load', () => {
  ui.replaceBookCovers();
  ui.initTooltips();
  ui.initPopovers();
  facets.bindAccordians();
  search.searchSelector();
  history.setDocHistory();
  history.getDocHistory();
});
