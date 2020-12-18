/**
 * Modified for our use from blacklight_range_version version 7.8.0
 *
 * Changes:
 * - Removed global from IIFE and attached BlacklightRangeLimit to window
 * - Removed 'use strict'
 * - Update style to match our style guide (no var, arrow functions)
 */

// takes a string and parses into an integer, but throws away commas first, to avoid truncation
// when there is a comma
// use in place of javascript's native parseInt
!function() {
  const previousBlacklightRangeLimit = window.BlacklightRangeLimit;

  function BlacklightRangeLimit(options) {
    this.options = options || {};
  }

  BlacklightRangeLimit.parseNum = (str) => {
    const newStr = String(str).replace(/[^0-9-]/g, '');
    return parseInt(newStr, 10);
  };

  BlacklightRangeLimit.noConflict = () => {
    window.BlacklightRangeLimit = previousBlacklightRangeLimit;
    return BlacklightRangeLimit;
  };

  window.BlacklightRangeLimit = BlacklightRangeLimit;
}();
