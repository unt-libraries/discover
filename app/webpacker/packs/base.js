import 'core-js/stable';
import 'regenerator-runtime/runtime';
// Script files that should be included in all pages
import '../src/javascripts/www/_main';
import '../src/javascripts/www/_typeaheads';
import * as facets from '../src/javascripts/_facets';
import * as history from '../src/javascripts/_history';
import * as search from '../src/javascripts/_search';
import * as tour from '../src/javascripts/_tour';
import * as ui from '../src/javascripts/_ui';

Blacklight.onLoad(() => {
  facets.bindAccordians();
  history.setDocHistory();
  history.getDocHistory();
  search.searchSelector();
  ui.replaceBookCovers();
  ui.initTooltips();
  ui.initPopovers();
  tour.initTour();
});
