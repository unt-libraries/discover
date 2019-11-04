// Modified for Discover from unt-jekyll-theme/_assets/_scripts/typeahead.js
import 'corejs-typeahead';
import Bloodhound from 'corejs-typeahead/dist/bloodhound';

$(function () {
  const $studentHelper = $('#student-helper');
  const $courseTypeAhead = $('input.course-typeahead');
  const $azTypeahead = $('input.az-typeahead');
  const $subjectTypeahead = $('input.subject-typeahead');
  const $subjectDatabaseTypeahead = $('input.database-subject-typeahead');

  // typeahead common options
  const buildtypeaheadOptions = (count = 0) => ({
    highlight: true,
    minLength: count,
    classNames: {
      highlight: 'font-weight-bold',
      dataset: 'tt-dataset list-group',
      menu: 'tt-menu small text-dark scrollable',
      cursor: 'tt-cursor',
    },
  });

  // Start subject listings
  if ($subjectTypeahead.length || $subjectDatabaseTypeahead.length) {
    // Data source for All LibGuides "subjects".
    const allSubjects = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      prefetch: {
        url: window.libutils.sprinshareUrls.subjects_list,
        cache: true,
        transform(response) {
          return $.map(response, option => ({
            id: option.id,
            name: option.name,
          }));
        },
      },
    });

    // Provide a default to subject queries. On focus of the input,
    // search for pre-defined best bets, otherwise, just search.
    function subjectSearchWithDefaults(query, syncResults) {
      if (query === '') {
        syncResults(allSubjects.index.all());
      } else {
        allSubjects.search(query, syncResults);
      }
    }

    // Setup typeahead for subject typeahead.
    $subjectTypeahead.typeahead(buildtypeaheadOptions(0), {
      name: 'allSubjects',
      source: subjectSearchWithDefaults,
      display: 'name',
      limit: 200,
      templates: {
        suggestion(data) {
          return `<div class='list-group-item d-flex justify-content-between align-items-center'>
                  <div>${data.name}</div>
                  <i class='fas fa-external-link-alt'></i>
                </div>`;
        },
      },
    })
      .on('typeahead:selected', (event, datum) => {
        const path = 'https://guides.library.unt.edu/sb.php?subject_id=';
        ga('send', 'event', 'link - typeahead', 'subjects', datum.name, {
          hitCallback: window.libutils.actWithTimeOut(() => {
            window.libutils.goToSubjectUrl(datum, path);
          }),
        });
      });

    // Setup typeahead for database subject listing.
    $subjectDatabaseTypeahead.typeahead(buildtypeaheadOptions(0), {
      name: 'allSubjects',
      source: subjectSearchWithDefaults,
      display: 'name',
      limit: 200,
      templates: {
        suggestion(data) {
          return `<div class='list-group-item d-flex justify-content-between align-items-center'>
                  <div>${data.name}</div>
                  <i class='fas fa-external-link-alt'></i>
                </div>`;
        },
      },
    })
      .on('typeahead:selected', (event, datum) => {
        const path = 'https://guides.library.unt.edu/az.php?s=';
        ga('send', 'event', 'link - typeahead', 'subjects - databases', datum.name, {
          hitCallback: window.libutils.actWithTimeOut(() => {
            window.libutils.goToSubjectUrl(datum, path);
          }),
        });
      });
  }
  // End subject listings

  // Start databases typeahead
  if ($azTypeahead.length) {
    const currentDate = new Date();
    let azList;

    function makeAZList() {
      // Data source for LibGuides powered A-Z Database listing.
      azList = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name', 'description', 'new', 'trial', 'subjects', 'alt_names'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        identify(obj) { return obj.id; },
        local: JSON.parse(sessionStorage.getItem('springshareAzWithSubjects')),
      });
      return azList;
    }

    // Provide a default to database queries. On focus of the input,
    // search for pre-defined best bets, otherwise, just search.
    function databaseSearchWithDefaults(query, syncResults) {
      if (query === '') {
        syncResults(azList.get([2477452, 2478596, 2479459, 2477894, 2478101, 2478940]));
        // "Academic Search Complete", "EBSCOhost", "JSTOR",
        // "Nexis Uni", "ScienceDirect", "Web of Science"
      } else {
        azList.search(query, syncResults);
      }
    }

    // Test if libguides database API response is in session storage or
    // the data is older than 1 day.
    if (sessionStorage.getItem('springshareAzWithSubjects') === null || currentDate.getTime() > sessionStorage.getItem('springshareAzExpires')) {
      // JSON doesn't exists in Session Storage yet or the data is stale.

      // add a 'loading' placeholder
      $azTypeahead.attr('placeholder', 'loading suggestions!');

      // Make a request against the API
      $.when($.get(window.libutils.sprinshareUrls.databases)).done((data) => {
        // Transform the Data
        const springshareTransformed = $.map(data, (option) => {
          const textDescription = option.description.replace(/<\/?[^>]+>/gi, '').replace(/"/g, "'"); // strip any markup in descriptions
          const urlPath = (!!+option.meta.enable_proxy) ? `https://libproxy.library.unt.edu/login?url=${option.url}` : option.url; // if proxy enabled, add it to the url, otherwise just the url
          const recentlyAdded = (option.enable_new === 1) ? 'recently added' : ''; // boilerplate in searchable text for 'new' items
          const isTrial = (option.enable_trial === 1) ? 'under consideration' : ''; // boilerplate in searchable text for 'trials'
          const subjects = (option.hasOwnProperty('subjects')) ? option.subjects : []; // get subject object if it exists.
          let subjectString = (subjects.length) ? '<br /><strong>Subjects: </strong>' : ''; // if exists, generate a prefix
          subjectString += subjects.map((subject) => {
            return subject.name;
          }).join(', '); // concat the prefix with a comma seperated subject list.

          return {
            id: option.id,
            name: option.name,
            description: textDescription,
            url: urlPath,
            new: recentlyAdded,
            trial: isTrial,
            subjects: subjectString,
            alt_names: option.alt_names,
          };
        });
        // Add the transformed json to session storage
        sessionStorage.setItem('springshareAzWithSubjects', JSON.stringify(springshareTransformed));
        // calculate today + 24 hours and set that as a max cache time for the data,
        // also to session storage.
        const plusTwentyFour = currentDate.getTime() + 86400000;
        sessionStorage.setItem('springshareAzExpires', plusTwentyFour);

        // create bloodhound
        makeAZList();

        // update the placeholder with instructions.
        $azTypeahead.attr('placeholder', 'type for suggestions');
      });
    } else {
      // JSON already stored in session storage, timestamp is less than 24 hours old;
      // create bloodhound
      makeAZList();
    }

    // Setup for the Databases Typeahead.
    $azTypeahead.typeahead(buildtypeaheadOptions(0), {
      name: 'azList',
      // minLength: 2,
      source: databaseSearchWithDefaults,
      limit: 50,
      display: 'name',
      templates: {
        suggestion(data) {
          const isNew = (data.new) ? '<span class="badge badge-info small align-self-center">new</span>' : '';
          const isTrial = (data.trial) ? '<span class="badge badge-info small align-self-center">trial</span>' : '';

          return `<div class="list-group-item d-flex">
              <div class="flex-grow-1">${data.name}</div>
              ${isNew}${isTrial}
              <i class="fas fa-info pl-3 d-none d-md-inline-block align-self-center" data-database="description" data-content="${data.description} ${data.subjects} " title="${data.name}" id="lg-id-${data.id}"></i>
            </div>`;
        },
        notFound() {
          return '<div class="list-group-item">No match found. Try alternatives or use fewer terms</div>';
        },
      },
    })
      .on('focusin', function () {
        $(this).attr('placeholder', 'try these best bets or search for your own.');
      })
      .on('focusout', function () {
        $(this).attr('placeholder', 'type for suggestions');
      })
      .on('typeahead:selected', (event, datum) => {
        ga('send', 'event', 'link - typeahead', 'database', datum.name, {
          hitCallback: window.libutils.actWithTimeOut(() => {
            window.libutils.goToUrl(datum);
          }),
        });
      });

    const $recentDBs = $('#recent-dbs');
    const $trialDBs = $('#trial-dbs');

    $recentDBs.on('click', (e) => {
      e.preventDefault();
      $('#az-search').typeahead('val', 'recently added').focus();
    });

    $trialDBs.on('click', (e) => {
      e.preventDefault();
      $('#az-search').typeahead('val', 'under consideration').focus();
    });

    const DBpopOverSettings = {
      container: 'body',
      trigger: 'hover',
      selector: '[data-database="description"]',
      boundary: 'viewport',
      placement: 'right',
      html: true,
    };

    // highlight search string in popover
    $('div.database-group').popover(DBpopOverSettings)
      .on('inserted.bs.popover', (e) => {
        const searchVal = $(e.target).closest('.twitter-typeahead').find('.tt-input').val();
        const terms = searchVal.split(' ');
        const $thisPopover = $('body').find('.popover-body');

        if (searchVal.length && window.Mark) {
          $thisPopover.mark(terms, {
            element: 'strong',
            className: 'text-success p-1',
          });
        }
      });
  }
  // End databases typeahead

  // Start Shared Bloodhound for course/guide listing
  if ($studentHelper.length || $courseTypeAhead.length) {
    // Data source for All LibGuides "guides".
    const allLibGuides = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name', 'description', 'subjects', 'type_machine'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      identify(obj) {
        return obj.id;
      },
      prefetch: {
        url: window.libutils.sprinshareUrls.guides_expand_owner_subject,
        cache: true,
        transform(response) {
          return $.map(response, (option) => {
            const subjectsArray = $.map(option.subjects, (n, i) => [n.name]);
            return {
              id: option.id,
              name: option.name,
              description: option.description,
              url: option.friendly_url || option.url,
              type_label: option.type_label,
              type_machine: option.type_label.toLowerCase().replace(' ', '-').concat('-', option.type_id),
              subjects: subjectsArray.join(', '),
            };
          });
        },
      },
    });

    // Provide a default to database queries. On focus of the input,
    // search for pre-defined best bets, otherwise, just search.
    function coursesSource(query, syncResults) {
      allLibGuides.search(`${query} course-guide-2`, syncResults);
    }

    // Setup typahead for course finder
    $courseTypeAhead.typeahead(buildtypeaheadOptions(0), {
      name: 'coursesSource',
      source: coursesSource,
      display: 'name',
      limit: 250,
      templates: {
        suggestion(data) {
          return `<div class="list-group-item d-flex justify-content-between align-items-center">
                    <div>${data.name}</div>
                    <i class="fas fa-external-link-alt"></i>
                  </div>`;
        },
      },
    })
      .on('typeahead:selected', (event, datum) => {
        ga('send', 'event', 'link - typeahead', 'courses', datum.name, {
          hitCallback: window.libutils.actWithTimeOut(() => {
            window.libutils.goToUrl(datum);
          }),
        });
      });
    // End student helper typeahead (has multiple bloodhound sources)
  }
});
