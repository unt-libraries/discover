import { checkAvailability } from '../src/javascripts/_availability_buttons';
import { setDocHistory, getDocHistory } from '../src/javascripts/_history';
import { searchSelector } from '../src/javascripts/_search';
import { initTour } from '../src/javascripts/_tour';
import { initPopovers, initTooltips, replaceBookCovers } from '../src/javascripts/_ui';

Blacklight.onLoad(() => {
  checkAvailability();
  setDocHistory();
  getDocHistory();
  searchSelector();
  replaceBookCovers();
  initTooltips();
  initPopovers();
  initTour();
});
