import Blacklight from 'blacklight-frontend/app/javascript/blacklight/core';
import BlacklightRangeLimit from 'blacklight-range-limit';
import { checkAvailability } from '~/src/javascripts/_availability_buttons';
import { getDocHistory } from '~/src/javascripts/_history';

BlacklightRangeLimit.init({ onLoadHandler: Blacklight.onLoad });

const initializePage = () => {
  const indexBodyElement = document.querySelector('body.blacklight-catalog-index');
  if (!indexBodyElement) return;

  if (indexBodyElement.dataset.indexJsInitialized) return;
  indexBodyElement.dataset.indexJsInitialized = 'true';

  checkAvailability();
  getDocHistory();
};

// Register for subsequent page loads
Blacklight.onLoad(initializePage);

// Run on initial page load
initializePage();
