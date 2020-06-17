import { checkAvailability } from '../src/javascripts/_availability_table';
import {
  bindShowAvailMoreField, replaceBookCovers,
} from '../src/javascripts/_ui';

document.addEventListener('turbolinks:load', () => {
  checkAvailability();
  bindShowAvailMoreField();
  replaceBookCovers();
});
