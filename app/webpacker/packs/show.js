import { checkAvailability } from '../src/javascripts/_availability_table';
import {
  bindShowAvailMoreField, highlightSearchTerms, replaceBookCovers,
} from '../src/javascripts/_ui';

document.addEventListener('turbolinks:load', () => {
  checkAvailability();
  bindShowAvailMoreField();
  highlightSearchTerms();
  replaceBookCovers();
});
