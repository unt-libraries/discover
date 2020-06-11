import { checkAvailability } from '../src/javascripts/_availability_table';
import {
  bindShowAvailMoreField, initPopovers, initTooltips, replaceBookCovers,
} from '../src/javascripts/_ui';

Blacklight.onLoad(() => {
  checkAvailability();
  bindShowAvailMoreField();
  initPopovers();
  initTooltips();
  replaceBookCovers();
});
