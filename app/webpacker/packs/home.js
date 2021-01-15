import 'bootstrap/js/dist/collapse';
import { rotateSearchTips, searchSelector } from '../src/javascripts/_search';

document.addEventListener('turbolinks:load', () => {
  searchSelector();
  rotateSearchTips();
});
