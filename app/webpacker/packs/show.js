import { checkAvailability } from '../src/javascripts/_availability_table';
import {
  bindShowAvailMoreField, replaceBookCovers, hoverHierarchicalLinks,
} from '../src/javascripts/_ui';
import { highlightSearchTerms } from '../src/javascripts/_highlight';
import {setDocHistory} from "../src/javascripts/_history";

document.addEventListener('turbolinks:load', () => {
  checkAvailability();
  setDocHistory();
  bindShowAvailMoreField();
  highlightSearchTerms();
  replaceBookCovers();
  hoverHierarchicalLinks();
});
