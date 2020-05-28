import $ from 'jquery';
import Tour from 'bootstrap-tourist';

const tourPromptTemplate = `<div class="popover" role="tooltip">
  <div class="arrow"></div>
  <div class="popover-body"></div>
  <div class="popover-navigation">
    <button class="btn btn-sm btn-primary" data-role="next">SURE!</button>
    <button class="btn btn-sm btn-primary" data-role="end">NO THANKS</button>
  </div>
</div>`;

const searchResultsTourTemplate = `<div class="popover" role="tooltip">
  <div class="arrow"></div>
  <h3 class="popover-header"></h3>
  <div class="popover-body"></div>
  <div class="popover-navigation">
    <button class="btn btn-sm btn-primary" data-role="prev">&laquo; PREV</button>
    <button class="btn btn-sm btn-primary" data-role="next">NEXT &raquo;</button>
    <button class="btn btn-sm btn-primary" data-role="end">ALL DONE</button>
  </div>
</div>`;

const searchResultsTourSteps = [
  {
    element: '#searchResultsHeader',
    content: 'Would you like to take a quick tour of the search results screen?',
    showProgressBar: false,
    showProgressText: false,
    template: tourPromptTemplate,
    backdrop: false,
  },
  {
    element: '#facet-panel-priority-collapse',
    title: 'Facets',
    content: 'These filters refine your current search. Categories can be expanded/collapsed. Selecting a filter will make your results more precise.',
  },
  {
    element: '#tourSearchField',
    title: 'Search',
    content: 'You can change your query at any time or switch between keyword, title, and other search types.',
  },
  {
    element: '#tourSearchConstraints',
    title: 'Filters',
    content: 'See a list of your search terms and applied filters  here and easily dismiss them or start over.',
  },
  {
    element: '#sort-dropdown',
    title: 'Sort Results',
    content: 'Order results as you need them and for each result below, we\'ll show you only the basics. Check for availability and connect to online items from this screen or click through to the full record for more information, additional copies, holdings, and delivery options.',
  },
];

function needsTour(tourName) {
  let tourEligible = true;
  let context = document.querySelector('body').dataset.blacklightContext;
  const skips = parseInt(localStorage.getItem(`${tourName}_skips`) || '0');
  const searchParams = window.location.search;
  if (context === 'index' && searchParams === '') {
    context = 'home';
  }

  if ((context !== 'index') || (skips >= 2)) {
    tourEligible = false;
  }
  return tourEligible;
}

function skipTour(tourName) {
  const skips = localStorage.getItem(`${tourName}_skips`) || '0';
  const newSkips = parseInt(skips) + 1;
  localStorage.setItem(`${tourName}_skips`, newSkips.toString());
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
        },
      );

      searchResultsTour.start();

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
