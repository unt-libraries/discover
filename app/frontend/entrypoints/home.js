import {
  searchSelector, initPrefilters, initFilters,
} from '~/src/javascripts/_search';

document.addEventListener('turbolinks:load', () => {
  searchSelector();
  initFilters();
});
