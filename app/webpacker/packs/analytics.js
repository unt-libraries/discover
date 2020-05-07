import * as googleAnalytics from '../src/javascripts/_google_analytics.js.erb';

googleAnalytics.init();
googleAnalytics.trackErrors();
googleAnalytics.trackSearchForm();
googleAnalytics.trackShowRecordFacets();
