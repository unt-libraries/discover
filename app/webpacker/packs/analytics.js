import * as analytics from '../src/javascripts/_analytics.js.erb';

analytics.init();
analytics.trackErrors();
analytics.trackSearchForm();
analytics.trackShowRecordFacets();
analytics.trackNoContextDocPosition();
analytics.trackWebVitals();
analytics.addBrowserInfoToFeedback();
