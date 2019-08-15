import Rails from 'rails-ujs';
import Turbolinks from 'turbolinks';
import 'typeahead';
import 'bootstrap/dist/js/bootstrap';

import 'blacklight-frontend/app/javascript/blacklight/core';
import 'blacklight-frontend/app/javascript/blacklight/autocomplete';
import 'blacklight-frontend/app/javascript/blacklight/checkbox_submit';
import 'blacklight-frontend/app/javascript/blacklight/modal';
import 'blacklight-frontend/app/javascript/blacklight/bookmark_toggle';
import 'blacklight-frontend/app/javascript/blacklight/collapsable';
import 'blacklight-frontend/app/javascript/blacklight/facet_load';
import 'blacklight-frontend/app/javascript/blacklight/search_context';

// Removed from _home_text.html.erb
Blacklight.onLoad(() => {
  $('#about .card-header').one('click', function () {
    $($(this).data('target')).load($(this).find('a').attr('href'));
  });
});

Rails.start();
Turbolinks.start();
