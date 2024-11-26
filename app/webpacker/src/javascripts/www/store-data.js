// store-data.js
import { setWithExpiry, getWithExpiry } from './utils.js';

/**
 * Manages the loading of remote data in local and session storage.
 */
class StoreDataManager {
  /**
   * Settings.
   */
  constructor() {
	this.storageKey = `unt_lib.v2`;
	this.expireDays = 3;

	this.dataSources = [
	  {
		url: '/assets/omni/data/features.json',
		key: `${this.storageKey}.subjects`,
		storage: 'session',
		expires: 24 * 60 * 60 * 1000
	  },
	  {
		url: 'https://example.com/data2.json',
		key: `${this.storageKey}.reserves`,
		storage: 'session',
		expires: 24 * 60 * 60 * 1000
	  },
	];
	
	this.init();
  }


  init() {
    document.addEventListener('DOMContentLoaded', () => {
      if ( condition ) {

      }
    });
  }

}

new StoreDataManager();
