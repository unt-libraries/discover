import 'bootstrap/js/dist/collapse';
import {
  rotateSearchTips, searchSelector, initPrefilters, initFilters,
} from '../src/javascripts/_search';

document.addEventListener('turbolinks:load', () => {
  searchSelector();
  rotateSearchTips();
  initPrefilters();
  initFilters();
});
