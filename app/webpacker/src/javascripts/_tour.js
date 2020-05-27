import $ from 'jquery';
import Tour from 'bootstrap-tourist';

const tourPromptTemplate = `<div class="popover" role="tooltip">
  <div class="arrow"></div>
  <h3 class="popover-header"></h3>
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
    title: 'Need help?',
    content: 'Take a quick tour of the search results screen',
    showProgressBar: false,
    showProgressText: false,
    template: tourPromptTemplate,
  },
  {
    element: '#facet-access_facet',
    title: 'Facets',
    content: 'These filters refine your current search. Categories can be expanded/collapsed. Selecting a filter will make your results more precise.',
  },
  {
    element: '#q',
    title: 'Search',
    content: 'You can change your query at any time, remove existing filters, or change between keyword, title, and other search types.',
  },
  {
    element: '#sort-dropdown',
    title: 'Sort Results',
    content: 'Order results as you need them and for each result below, we\'ll show you only the basics. Check for availability and connect to online items from this screen or click through to the full record for more information, additional copies, holdings, and delivery options.',
  },
];

function needsTour() {
  let tourEligible = true;
  let context = document.querySelector('body').dataset.blacklightContext;
  const searchParams = location.search;
  if (context === 'index' && searchParams === '') {
    context = 'home';
  }

  if (context !== 'index') {
    tourEligible = false;
  }
  console.log(`tour eligible = ${tourEligible}`)
  return tourEligible;
}

function initTour() {
  $(() => {
    if (needsTour() === true) {
      const searchResultsTour = new Tour(
        {
          name: 'searchResultsTour',
          steps: searchResultsTourSteps,
          framework: 'bootstrap4',
          backdropOptions: {
            highlightOpacity: 0,
          },
          template: searchResultsTourTemplate,
          showProgressBar: false,
        },
      );

      // Start the tour - note, no call to .init() is required
      searchResultsTour.start();
      console.log('tour started');
    }
  });
}

export {
  initTour,
};
