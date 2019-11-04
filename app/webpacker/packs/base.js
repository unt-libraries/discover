// Script files that should be included in all pages
import '../src/javascripts/www/_main';
import '../src/javascripts/www/_typeaheads';
import * as ui from '../src/javascripts/_ui';
import * as facets from '../src/javascripts/_facets';
import * as search from '../src/javascripts/_search';
import * as history from '../src/javascripts/_history';

Blacklight.onLoad(() => {
  ui.replaceBookCovers();
  ui.initTooltips();
  ui.initPopovers();
  facets.bindAccordians();
  search.searchSelector();
  history.setDocHistory();
  history.getDocHistory();
});
