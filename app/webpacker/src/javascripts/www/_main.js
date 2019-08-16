// Modified for Discover from unt-jekyll-theme/_assets/_scripts/main.js
import 'bootstrap';
import 'corejs-typeahead';
import Bloodhound from 'bloodhound-js';

$(document).ready(() => {
  // Enable tooltips
  $('[data-toggle="tooltip"]').tooltip({
    container: 'body',
  });
  // enable popovers
  $('[data-toggle="popover"]').popover({
    container: 'body',
  });

  // set a number of reusable DOM variables
  const $body = $('body');
  const $head = $('#head');
  const $scrolledHead = $('#scrolled-header');
  const $toTop = $('#to-top');
  const $bannerImg = $('#unt-banner-img');
  const $bannerLetterMark = $('#unt-banner-lettermark');

  // Set scrolling header ui by observing main nav relative to viewport
  const scrolledNav = document.querySelector('#primary-navigation');
  const scrolledNavObserver = new IntersectionObserver((entries, observer) => {
    if (entries[0].isIntersecting) {
      $head.removeClass('scrolled');
      $bannerImg.removeClass('d-none');
      $bannerLetterMark.addClass('d-none');
      $toTop.fadeOut();
    } else {
      $head.addClass('scrolled');
      $bannerImg.addClass('d-none');
      $bannerLetterMark.removeClass('d-none');
      $toTop.fadeIn();
    }
  }, {
    threshold: [0, 1],
  });
  // do the observing
  scrolledNavObserver.observe(scrolledNav);


  // When user clicks on the search icon in site header,
  // auto-focus the bento box input after drawer has opened.
  $('#search-drawer').on('shown.bs.modal', () => {
    $('#drawer-q').focus();
  });

  // pretty scroll to top of the screen on button push,
  $('#to-top').on('click', (e) => {
    e.preventDefault();
    $('body,html').animate({
      scrollTop: 0,
    }, 800);
    // remove hashes in the URL.
    history.pushState('', document.title, window.location.pathname + window.location.search);
  });

  // utility fucntion to create function with timeout, used in ga events
  function actWithTimeOut(callback, optTimeout) {
    let called = false;
    function fn() {
      if (!called) {
        called = true;
        callback();
      }
    }
    setTimeout(fn, optTimeout || 1000);
    return fn;
  }

  // Search Form Analytics Tracking
  const searchForms = document.querySelectorAll('form.search');
  for (let i = 0; i < searchForms.length; i++) {
    searchForms[i].addEventListener('submit', (e) => {
      e.preventDefault();

      const $this = $(this);
      const category = $this.data('ga-category') || 'form - search - untagged';
      const action = $this.find('input.query').val() || 'empty';
      const label = $this.data('ga-label') || document.location.href;
      const value = _.size(_.words(action)) || 0;

      function submitForm() {
        $this.submit();
      }
      ga('send', 'event', category, action, label, value, {
        hitCallback: actWithTimeOut(() => {
          submitForm();
        }),
      });
    });
  }


  // for ga events where we want to go directly to a typaheads url element
  function goToUrl(datum) {
    window.location.href = datum.url;
  }

  // for ga events where we want to message a url by concatenating a string and ID.
  function goToSubjectUrl(datum, path) {
    window.location.href = path + datum.id;
  }

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

  // Data source for LibGuides powered A-Z Database listing.
  const azList = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name', 'description'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    identify(obj) { return obj.name; },
    prefetch: {
      cache: true,
      url: '//lgapi-us.libapps.com/1.1/assets?site_id=702&key=9a0320695e007513e3f56d6f5f9e2159&asset_types=10',
      transform(response) {
        return $.map(response, (option) => {
          const textDescription = $(`<div>${option.description}</div>`).text().replace(/"/g, "'");
          const hasProxy = !!+option.meta.enable_proxy;
          let urlPath;
          if (hasProxy) {
            urlPath = `https://libproxy.library.unt.edu/login?url=${option.url}`;
          } else {
            urlPath = option.url;
          }

          return {
            id: option.id,
            name: option.name,
            description: textDescription,
            url: urlPath,
          };
        });
      },
    },
  });

  // Data source for All LibGuides "guides".
  const allLibGuides = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name', 'description', 'subjects', 'type_machine'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: {
      url: '//lgapi-us.libapps.com/1.1/guides/?site_id=702&key=9a0320695e007513e3f56d6f5f9e2159&status[]=1&sort_by=name&expand=owner,subjects',
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


  // Data source for All LibGuides "subjects".
  const allSubjects = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: {
      url: '//lgapi-us.libapps.com/1.1/subjects?site_id=702&key=9a0320695e007513e3f56d6f5f9e2159',
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

  // Setup typahead for subject typeahead.
  $('input.subject-typeahead').typeahead(buildtypeaheadOptions(0), {
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
      const path = '//guides.library.unt.edu/sb.php?subject_id=';
      ga('send', 'event', 'link - typeahead', 'subjects', datum.name, {
        hitCallback: actWithTimeOut(() => {
          goToSubjectUrl(datum, path);
        }),
      });
    });

  // Setup typahead for database subject listing.
  $('input.database-subject-typeahead').typeahead(buildtypeaheadOptions(0), {
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
      const path = '//guides.library.unt.edu/az.php?s=';
      ga('send', 'event', 'link - typeahead', 'subjects - databases', datum.name, {
        hitCallback: actWithTimeOut(() => {
          goToSubjectUrl(datum, path);
        }),
      });
    });

  // Provide a default to database queries. On focus of the input,
  // search for pre-defined best bets, otherwise, just search.
  function coursesSource(query, syncResults) {
    allLibGuides.search(`${query} course-guide-2`, syncResults);
  }

  // Setup typahead for course finder
  $('input.course-typeahead').typeahead(buildtypeaheadOptions(0), {
    name: 'coursesSource',
    source: coursesSource,
    display: 'name',
    limit: 250,
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
      ga('send', 'event', 'link - typeahead', 'courses', datum.name, {
        hitCallback: actWithTimeOut(() => {
          goToUrl(datum);
        }),
      });
    });

  // Provide a default to database queries. On focus of the input,
  // search for pre-defined best bets, otherwise, just search.
  function databaseSearchWithDefaults(query, syncResults) {
    if (query === '') {
      syncResults(azList.get(['Academic Search Complete', 'EBSCOhost', 'JSTOR', 'Nexis Uni', 'ScienceDirect', 'Web of Science']));
    } else {
      azList.search(query, syncResults);
    }
  }

  // Setup for the Databases Typeahead.
  $('input.az-typeahead').typeahead(buildtypeaheadOptions(0), {
    name: 'azList',
    source: databaseSearchWithDefaults,
    limit: 50,
    display: 'name',
    templates: {
      suggestion(data) {
        return `<div class='list-group-item d-flex justify-content-between align-items-center'><div>${data.name}</div><i class='fas fa-external-link-alt'></i></div>`;
      },
    },
  })
    .on('focusin', () => {
      $(this).attr('placeholder', 'try these best bets or search for your own.');
    })
    .on('focusout', () => {
      $(this).attr('placeholder', 'type for suggestions');
    })
    .on('typeahead:selected', (event, datum) => {
      ga('send', 'event', 'link - typeahead', 'database', datum.name, {
        hitCallback: actWithTimeOut(() => {
          goToUrl(datum);
        }),
      });
    });
});
