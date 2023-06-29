import { checkAvailability } from '../src/javascripts/_availability_buttons';
import { setDocHistory, getDocHistory } from '../src/javascripts/_history';
import { rotateSearchTips, searchSelector, initFilters } from '../src/javascripts/_search';
import { initTour } from '../src/javascripts/_tour';
import { replaceBookCovers } from '../src/javascripts/_ui';
import 'flot/source/jquery.canvaswrapper';
import 'flot/source/jquery.colorhelpers';
import 'flot/lib/jquery.event.drag';
import 'flot/source/jquery.flot';
import 'flot/source/jquery.flot.browser';
import 'flot/source/jquery.flot.saturated';
import 'flot/source/jquery.flot.drawSeries';
import 'flot/source/jquery.flot.hover';
import 'flot/source/jquery.flot.uiConstants';
import 'flot/source/jquery.flot.selection';
import '../src/javascripts/vendor/bootstrap-slider';
import '../src/javascripts/blacklight_range_limit/range_limit_distro_facets';
import '../src/javascripts/blacklight_range_limit/range_limit_shared';
import '../src/javascripts/blacklight_range_limit/range_limit_slider';

document.addEventListener('turbolinks:load', () => {
  checkAvailability();
  getDocHistory();
  searchSelector();
  rotateSearchTips();
  replaceBookCovers();
  initTour();
  initFilters();
});
