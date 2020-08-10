# Changelog

### 1.2 August 10, 2020
* Better image optimizations for faster load times
* Update browserslist stats to target site development at browsers that our users use
* Remove unused Blacklight Javascript
* Add advanced search
* Consistent usage of "Filters" for searches, no longer referred to "Facets"
* Add `rel="noopener"` to all external links for security best practice
* Mobile UI changes
* Add a rotating list of advanced search tips to the search form
* Add redirect for some URL patterns using bib IDs with fragments from III catalog
* Add links to citations
* Add new title fields that link back to title field filtered results when clicked
* More robust item request functionality
* Automatically turn URL and email addresses into links in eligible fields
* Fixes
    * Fix Turbolinks not working properly
    * Accessibility fixes for focus field on Safari and Firefox browsers
    * Prevent browsers from trying to translate the site for foreign language content
    * Remove "next" button from last step of search tour

### 1.1 June 15, 2020
* Change async CSS loading strategy to no longer require a polyfill
* Add WebP copies of homepage images for browsers that support the format
* Load fonts from Font Awesome CDN kit to greatly decrease page weight
* Use Webpack's SplitChunks to efficiently split JavaScript and CSS resources
* Better accessibility
* Fixes
    * Fix improperly displayed availability buttons for Eagle Commons Library
    * Fix broken external links to ProQuest
    * Fix facets not expanding in mobile

### 1.0 June 5, 2020

**Initial public release**