import { checkAvailability } from '../src/javascripts/_availability_table';
import {
  bindShowAvailMoreField, replaceBookCovers,
} from '../src/javascripts/_ui';
import { highlightSearchTerms } from '../src/javascripts/_highlight';

document.addEventListener('turbolinks:load', () => {
  checkAvailability();
  bindShowAvailMoreField();
  highlightSearchTerms();
  replaceBookCovers();
});
