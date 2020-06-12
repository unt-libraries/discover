import { searchSelector } from '../src/javascripts/_search';
import { initPopovers, initTooltips } from '../src/javascripts/_ui';

Blacklight.onLoad(() => {
  searchSelector();
  initTooltips();
  initPopovers();
});
