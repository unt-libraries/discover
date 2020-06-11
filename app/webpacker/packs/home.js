import * as facets from '../src/javascripts/_facets';
import * as search from '../src/javascripts/_search';
import * as ui from '../src/javascripts/_ui';

Blacklight.onLoad(() => {
  facets.bindAccordians();
  search.searchSelector();
  ui.initTooltips();
  ui.initPopovers();
});
