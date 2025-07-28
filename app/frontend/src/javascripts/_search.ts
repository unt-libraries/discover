type HTMLElementOrNull = HTMLElement | null;

/** * Initializes the search field dropdown selector.
 * * This function sets up the dropdown for selecting search fields.
 * * It listens for click events on dropdown items and updates the search field accordingly.
 * * @returns {void}
 */
function searchSelector(): void {
  const searchForm = document.querySelector('.search-query-form') as HTMLElementOrNull;
  if (searchForm === null) return;
  const queryInput = document.getElementById('q') as HTMLInputElement;
  const dropdown = document.getElementById('searchFieldDropdownGroup') as HTMLElement;
  const dropdownItems = dropdown?.querySelectorAll('.dropdown-item') as NodeListOf<HTMLElement>;
  dropdownItems.forEach((dropdownItem: HTMLElement) => {
    dropdownItem.addEventListener('click', (e: Event) => {
      e.preventDefault();

      const selected = e.target as HTMLElement;
      const selectedText = selected.textContent;
      const scopeValue = selected.dataset.searchField;
      dropdown.querySelector('.selected')!.innerHTML = selectedText!;
      (document.getElementById('search_field_hidden') as HTMLInputElement)!.value = scopeValue!;
      if (dropdown?.classList.contains('open')) {
        dropdown.classList.remove('open');
      }
      queryInput.focus();
    });
  });
}

function initPrefilters(): void {
  const prefilterLinks = document.querySelectorAll('.pre-filter-btn-group .dropdown-item') as NodeListOf<HTMLElement>;
  const queryField = document.getElementById('q') as HTMLInputElement;
  const searchButton = document.getElementById('search');

  prefilterLinks.forEach((link: HTMLElement) => {
    link.addEventListener('click', (e: Event) => {
      e.preventDefault();

      const query = queryField.value;
      const href = link.getAttribute('href')!;
      const urlObj = new URL(href);
      const currentUrl = new URL(window.location.href);
      if (query.length > 0 && currentUrl.host === urlObj.host) {
        const paramString = href.split('?')[1];
        const params = new URLSearchParams(paramString);
        const searchField = document.getElementById('search_field_hidden') as HTMLInputElement;
        const searchFieldVal = searchField.value;
        params.set('utf8', '✓');
        params.set('q', query);
        params.set('search_field', searchFieldVal);
        const newParams = params.toString();
        Turbo.visit(`/?${newParams}`);
      } else {
        Turbo.visit(href);
      }
    }, { once: true });
  });
}

// Initialize filters to include search form values in the search
function initFilters(): void {
  const filterLinks = document.querySelectorAll('a.facet-values-item') as NodeListOf<HTMLElement>;
  const searchForm = document.querySelector('.search-query-form') as HTMLFormElement;
  const queryField = document.getElementById('q') as HTMLInputElement;
  const searchButton = document.getElementById('search');

  filterLinks.forEach((link: HTMLElement) => {
    link.addEventListener('click', (e: Event) => {
      e.preventDefault();

      const query = queryField.value;
      const href = link.getAttribute('href')!;
      if (query.length > 0) {
        const paramString = href.split('?')[1];
        const params = new URLSearchParams(paramString);
        const searchField = document.getElementById('search_field_hidden') as HTMLInputElement;
        const searchFieldVal = searchField.value;
        params.set('utf8', '✓');
        params.set('q', query);
        params.set('search_field', searchFieldVal);
        const newParams = params.toString();
        Turbo.visit(`/?${newParams}`);
      } else {
        Turbo.visit(href);
      }
    }, { once: true });
  });
}

export {
  searchSelector,
  initPrefilters,
  initFilters,
};
