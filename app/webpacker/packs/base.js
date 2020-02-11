// Script files that should be included in all pages
import '../src/javascripts/www/_main';
import '../src/javascripts/www/_typeaheads';
import * as availability from '../src/javascripts/_availability';
import * as facets from '../src/javascripts/_facets';
import * as history from '../src/javascripts/_history';
import * as search from '../src/javascripts/_search';
import * as ui from '../src/javascripts/_ui';

Blacklight.onLoad(() => {
  availability.checkAvailability();
  facets.bindAccordians();
  history.setDocHistory();
  history.getDocHistory();
  search.searchSelector();
  ui.replaceBookCovers();
  ui.initTooltips();
  ui.initPopovers();
  ui.bindRevealMoreFields();
});
