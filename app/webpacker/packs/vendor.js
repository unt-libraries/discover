import 'corejs-typeahead';
// Modal manually imported, otherwise isn't available for blacklight modal
import 'bootstrap/js/dist/modal';

import 'blacklight-frontend/app/javascript/blacklight/core';
import 'blacklight-frontend/app/javascript/blacklight/autocomplete';
import 'blacklight-frontend/app/javascript/blacklight/checkbox_submit';
import 'blacklight-frontend/app/javascript/blacklight/modal';
import 'blacklight-frontend/app/javascript/blacklight/bookmark_toggle';
import 'blacklight-frontend/app/javascript/blacklight/button_focus';
// Disabled import of facet_load to avoid doResizeFacetLabelsAndCounts function,
// but leaving reference because we may import again in the future.
// import 'blacklight-frontend/app/javascript/blacklight/facet_load';
import 'blacklight-frontend/app/javascript/blacklight/search_context';
