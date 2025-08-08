import Blacklight from 'blacklight-frontend/app/javascript/blacklight/core';
import { checkAvailability } from '~/src/javascripts/_availability_table';
import {
  bindShowAvailMoreField, hoverHierarchicalLinks,
} from '~/src/javascripts/_ui';
import { highlightSearchTerms } from '~/src/javascripts/_highlight';
import { setDocHistory } from '~/src/javascripts/_history';

const initializePage = () => {
  const showBodyElement = document.querySelector('body.blacklight-catalog-show');
  if (!showBodyElement) return;

  if (showBodyElement.dataset.showJsInitialized) return;
  showBodyElement.dataset.showJsInitialized = 'true';

  checkAvailability();
  setDocHistory();
  bindShowAvailMoreField();
  highlightSearchTerms();
  hoverHierarchicalLinks();
};

// Register for subsequent page loads
Blacklight.onLoad(initializePage);

// Run on initial page load
initializePage();
