import Blacklight from 'blacklight-frontend/app/javascript/blacklight/core';
import BlacklightRangeLimit from 'blacklight-range-limit';
import { checkAvailability } from '~/src/javascripts/_availability_buttons';
import { getDocHistory } from '~/src/javascripts/_history';

BlacklightRangeLimit.init({ onLoadHandler: Blacklight.onLoad });

Blacklight.onLoad(() => {
  const indexBodyElement = document.querySelector('body.blacklight-catalog-index');
  if (!indexBodyElement) return;

  checkAvailability();
  getDocHistory();
});
