// import "blacklight-frontend/app/assets/javascripts/blacklight/blacklight";
import BlacklightRangeLimit from 'blacklight-range-limit/app/assets/javascripts/blacklight_range_limit/blacklight_range_limit.esm';
import 'blacklight-range-limit/vendor/assets/javascripts/bootstrap-slider';
// jquery.canvaswrapper must come before the rest of Flot.
import 'blacklight-range-limit/vendor/assets/javascripts/flot/jquery.canvaswrapper';
import 'blacklight-range-limit/vendor/assets/javascripts/flot/jquery.flot';
import 'blacklight-range-limit/vendor/assets/javascripts/flot/jquery.colorhelpers';
import 'blacklight-range-limit/vendor/assets/javascripts/flot/jquery.event.drag';
import 'blacklight-range-limit/vendor/assets/javascripts/flot/jquery.flot.browser';
import 'blacklight-range-limit/vendor/assets/javascripts/flot/jquery.flot.drawSeries';
import 'blacklight-range-limit/vendor/assets/javascripts/flot/jquery.flot.hover';
import 'blacklight-range-limit/vendor/assets/javascripts/flot/jquery.flot.saturated';
import 'blacklight-range-limit/vendor/assets/javascripts/flot/jquery.flot.selection';
import 'blacklight-range-limit/vendor/assets/javascripts/flot/jquery.flot.uiConstants';
import 'bootstrap/js/dist/collapse';
import { checkAvailability } from '../src/javascripts/_availability_buttons';
import { setDocHistory, getDocHistory } from '../src/javascripts/_history';
import { rotateSearchTips, searchSelector, initFilters } from '../src/javascripts/_search';
import { initTour } from '../src/javascripts/_tour';
import { replaceBookCovers } from '../src/javascripts/_ui';

Blacklight.onLoad(() => {
  const modalSelector = Blacklight.modal?.modalSelector || Blacklight.Modal.modalSelector;
  BlacklightRangeLimit.initialize(modalSelector);
});

document.addEventListener('turbolinks:load', () => {
  checkAvailability();
  getDocHistory();
  searchSelector();
  rotateSearchTips();
  replaceBookCovers();
  initTour();
  initFilters();
});
