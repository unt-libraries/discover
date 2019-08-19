// Script files that should be included at the bottom of all pages
import '../src/javascripts/www/_main';
import * as ui from '../src/javascripts/_ui';
import * as history from '../src/javascripts/_history';

document.addEventListener('turbolinks:load', () => {
  ui.replaceBookCovers();
  ui.searchSelector();
  ui.bindAccordians();
  ui.initTooltips();
  ui.initPopovers();
  history.setDocHistory();
  history.getDocHistory();
});
