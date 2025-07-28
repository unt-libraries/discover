import Blacklight from 'blacklight-frontend/app/javascript/blacklight/core';
import { checkAvailability } from '~/src/javascripts/_availability_table';
import {
  bindShowAvailMoreField, hoverHierarchicalLinks,
} from '~/src/javascripts/_ui';
import { highlightSearchTerms } from '~/src/javascripts/_highlight';
import { setDocHistory } from '~/src/javascripts/_history';

Blacklight.onLoad(() => {
  const showBodyElement = document.querySelector('body.blacklight-catalog-show');
  if (!showBodyElement) return;

  checkAvailability();
  setDocHistory();
  bindShowAvailMoreField();
  highlightSearchTerms();
  hoverHierarchicalLinks();
});
