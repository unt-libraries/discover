// Override link behavior within dropdown menu associated with search form for resource type,
// appending values to hidden form element.
import { elAddClass, elHasClass, elRemoveClass } from './_utils';

function searchSelector() {
  const searchForm = document.querySelector('.search-query-form');
  if (searchForm === null) return;

  const queryInput = searchForm.querySelector('#q');
  const dropdown = searchForm.querySelector('#searchFieldDropdownGroup');
  const dropdownItems = dropdown.querySelectorAll('#search_field_dropdown .dropdown-item');

  dropdownItems.forEach((dropdownItem) => {
    dropdownItem.addEventListener('click', (e) => {
      // stop the link from acting like a link
      e.preventDefault();

      // set variables
      const selected = e.target;
      const selectedText = selected.dataset.pretty;
      const scopeValue = selected.dataset.searchField;

      // Set the visible text of the dropdown menu to whatever was selected
      dropdown.querySelector('.selected').innerHTML = selectedText;

      searchForm.querySelector('#search_field').value = scopeValue;

      // close the dropdown
      if (elHasClass(dropdown, 'open')) {
        elRemoveClass(dropdown, 'open');
      }

      // Send focus back to the text input
      queryInput.focus();
    });
  });

  // Add separator to dropdown
  const dividerEl = document.createElement('div');
  dividerEl.classList.add('dropdown-divider');
  const callNumberOption = dropdown.querySelector('[data-search-field="call_number"]');
  callNumberOption.parentNode.insertBefore(dividerEl, callNumberOption);
}

function rotateSearchTips() {
  const tipContainer = document.querySelector('#searchBarTips');
  if (tipContainer === null) return;
  const tipElements = tipContainer.querySelectorAll('.search-tip');
  const firstTip = tipElements[0];

  const rotator = setInterval(() => {
    const visibleTip = tipContainer.querySelector('.current-tip');
    const nextTip = visibleTip.nextElementSibling ? visibleTip.nextElementSibling : firstTip;
    const transitionDur = 500;

    setTimeout(() => {
      elRemoveClass(visibleTip, 'current-tip');
      elAddClass(nextTip, 'current-tip');
    }, transitionDur);
  }, 7000);

  tipContainer.addEventListener('mouseover', function pauseTips() {
    clearInterval(rotator);
    tipContainer.removeEventListener('mouseover', pauseTips);
  });

  tipContainer.addEventListener('mouseout', function resumeTips() {
    rotateSearchTips();
    tipContainer.removeEventListener('mouseout', resumeTips);
  });
}

function initPrefilters() {
  const prefilterLinks = document.querySelectorAll('.pre-filter-btn-group .dropdown-item');
  const queryField = document.querySelector('#q');
  prefilterLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const query = queryField.value;
      const url = e.target.getAttribute('href');
      if (query.length > 0) {
        link.setAttribute('ga-event-value', '1');
        window.location.href = `${url}&q=${query}`;
      } else {
        window.location.href = url;
      }
    });
  });
}

export {
  rotateSearchTips,
  searchSelector,
  initPrefilters,
};
