import 'bootstrap/js/dist/collapse';
import { rotateSearchTips, searchSelector, initPrefilters } from '../src/javascripts/_search';

document.addEventListener('turbolinks:load', () => {
  searchSelector();
  rotateSearchTips();
  initPrefilters();
});
