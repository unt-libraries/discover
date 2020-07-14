// Override link behavior within dropdown menu associated with search form for resource type,
// appending values to hidden form element.
import { actWithTimeOut, elAddClass, elHasClass, elRemoveClass, elToggleClass } from './_utils';

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
}

function rotateSearchTips() {
  const tipContainer = document.querySelector('#searchBarTips');
  const tipElements = tipContainer.querySelectorAll('.search-tip');
  const firstTip = tipElements[0];

  setInterval(() => {
    const visibleTip = tipContainer.querySelector('.current-tip');
    const nextTip = visibleTip.nextElementSibling ? visibleTip.nextElementSibling : firstTip;
    const transitionDur = 500;

    setTimeout(() => {
      elRemoveClass(visibleTip, 'current-tip');
      elAddClass(nextTip, 'current-tip');
    }, transitionDur);
  }, 5000);
}

export {
  rotateSearchTips,
  searchSelector,
};
