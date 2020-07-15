import $ from 'jquery';
import Tour from 'bootstrap-tourist';
import { allowTracking } from './_analytics.js.erb';

const tourPromptTemplate = `<div class="popover" role="tooltip">
  <div class="arrow"></div>
  <div class="popover-body"></div>
  <div class="popover-navigation">
    <button class="btn btn-sm btn-primary" 
      data-role="next"
      ga-on="click"
      ga-event-category="Tour"
      ga-event-action="Start tour"
      ga-event-label="Tour Prompt">SURE!</button>
    <button class="btn btn-sm btn-primary" 
      data-role="end"
      ga-on="click"
      ga-event-category="Tour"
      ga-event-action="End tour"
      ga-event-label="Tour Prompt">NO THANKS</button>
  </div>
</div>`;

const searchResultsTourTemplate = `<div class="popover" role="tooltip">
  <div class="arrow"></div>
  <h3 class="popover-header"></h3>
  <div class="popover-body"></div>
  <div class="popover-navigation">
    <button class="btn btn-sm btn-primary"
      data-role="prev"
      ga-on="click"
      ga-event-category="Tour"
      ga-event-action="Previous step"
      ga-event-label="Search Results Tour">&laquo; PREV</button>
    <button class="btn btn-sm btn-primary"
      data-role="next"
      ga-on="click"
      ga-event-category="Tour"
      ga-event-action="Next step"
      ga-event-label="Search Results Tour">NEXT &raquo;</button>
    <button class="btn btn-sm btn-primary"
      data-role="end"
      ga-on="click"
      ga-event-category="Tour"
      ga-event-action="End tour"
      ga-event-label="Search Results Tour">ALL DONE</button>
  </div>
</div>`;

const searchResultsTourSteps = [
  {
    element: '#searchResultsHeader',
    content: 'Would you like to take a quick tour?',
    showProgressBar: false,
    showProgressText: false,
    template: tourPromptTemplate,
    backdrop: false,
  },
  {
    element: '.facet-group-priority .blacklight-access_facet',
    title: 'Filters',
    content: 'Use Filters to refine your current search. Categories can be expanded/collapsed. Selecting a filter will make your results more precise.',
  },
  {
    element: '#tourSearchField',
    title: 'Search',
    content: 'You can change your query at any time or switch between keyword, title, and other search types.',
  },
  {
    element: '#tourSearchConstraints',
    title: 'Applied Filters',
    content: 'Filters that you apply will be listed here where you can easily dismiss them or start over.',
  },
  {
    element: '#sort-dropdown',
    title: 'Sort Results',
    content: 'Order results as you need them and for each result below, we\'ll show you only the basics.',
  },
  {
    element: '.document.document-position-0',
    title: 'View Results',
    content: 'Check for availability and connect to online items from this screen or click through to the full record for more information, additional copies, holdings, and delivery options.',
    onShown: (tour) => {
      const $document = $(document);
      const $popover = $document.find(`.tour-${tour._options.name}`);
      const $next = $popover.find('[data-role="next"]');
      $next.remove();
    },
  },
];

function needsTour(tourName) {
  let tourEligible = true;
  let context = document.querySelector('body').dataset.blacklightContext;
  const skips = parseInt(localStorage.getItem(`${tourName}_skips`) || '0');
  const searchParams = new URLSearchParams(window.location.search);
  if (context === 'index' && searchParams.toString() === '') {
    context = 'home';
  }

  if ((context !== 'index') || (skips >= 2)) {
    tourEligible = false;
  }

  if (searchParams.get('tour') === 'true') {
    tourEligible = true;
    localStorage.removeItem(`${tourName}_end`);
  }
  return tourEligible;
}

function skipTour(tourName) {
  const skips = localStorage.getItem(`${tourName}_skips`) || '0';
  const newSkips = parseInt(skips) + 1;
  localStorage.setItem(`${tourName}_skips`, newSkips.toString());
  removeTourFromLinks();

  if (allowTracking()) {
    ga('send', 'event', 'Tour', 'Tour Skipped', tourName);
  }
}

function removeTourFromLinks() {
  const pageLinks = document.querySelectorAll('a');
  pageLinks.forEach((el) => {
    if (el.host === window.location.host) {
      const linkParams = new URLSearchParams(el.search);
      if (linkParams.get('tour')) {
        linkParams.delete('tour');
        el.search = linkParams.toString();
      }
    }
  });
}

function removeTourFromLocation() {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.delete('tour');
  window.history.replaceState({}, '', `${window.location.pathname}?${searchParams}`);
}

function initTour() {
  $(() => {
    if (needsTour('searchResultsTour') === true) {
      const searchResultsTour = new Tour(
        {
          name: 'searchResultsTour',
          steps: searchResultsTourSteps,
          framework: 'bootstrap4',
          template: searchResultsTourTemplate,
          showProgressBar: false,
          backdrop: true,
          sanitizeWhitelist: {
            button: ['ga-on', 'ga-event-category', 'ga-event-action', 'ga-event-label'],
          },
          onEnd: () => {
            removeTourFromLocation(); // Replace url in browser
            removeTourFromLinks(); // Update links on page to remove tour param
          },
        },
      );

      searchResultsTour.restart();

      if (allowTracking()) {
        ga('send', 'event', 'Tour', 'Tour Presented', 'searchResultsTour', {
          nonInteraction: true,
        });
      }

      // Dismiss the tour and increment "skips" if they click somewhere other than tour intro
      $('body').on('click.tour', (e) => {
        // did not click a popover toggle or popover
        if ($(e.target).hasClass('popover') !== true
          && $(e.target).parents('.popover').length === 0) {
          if (searchResultsTour.getCurrentStepIndex() === 0) {
            $('.popover.tour-searchResultsTour').popover('hide');
            skipTour('searchResultsTour');
            searchResultsTour.hideStep();
            $('body').off('click.tour');
          }
        }
      });
    }
  });
}

export {
  initTour,
};
