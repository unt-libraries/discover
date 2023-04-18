type HTMLElementOrNull = HTMLElement | null;
type ElementOrNull = Element | null;

function searchSelector(): void {
  const searchForm = document.querySelector('.search-query-form') as HTMLElementOrNull;
  if (searchForm === null) return;

  const queryInput = searchForm.querySelector('#q') as HTMLInputElement;
  const dropdown = searchForm.querySelector('#searchFieldDropdownGroup') as HTMLElement;
  const dropdownItems = dropdown?.querySelectorAll('#search_field_dropdown .dropdown-item') as NodeListOf<HTMLElement>;

  dropdownItems.forEach((dropdownItem: HTMLElement) => {
    dropdownItem.addEventListener('click', (e: Event) => {
      e.preventDefault();

      const selected = e.target as HTMLElement;
      const selectedText = selected.dataset.pretty;
      const scopeValue = selected.dataset.searchField;

      dropdown.querySelector('.selected')!.innerHTML = selectedText!;

      (searchForm.querySelector('#search_field') as HTMLInputElement)!.value = scopeValue!;

      if (dropdown?.classList.contains('open')) {
        dropdown.classList.remove('open');
      }

      queryInput.focus();
    });
  });

  const dividerEl = document.createElement('div');
  dividerEl.classList.add('dropdown-divider');
  const callNumberOption = dropdown.querySelector('[data-search-field="call_number"]') as ElementOrNull;
  callNumberOption!.parentNode!.insertBefore(dividerEl, callNumberOption);
}

function rotateSearchTips(): void {
  const tipContainer = document.querySelector('#searchBarTips') as HTMLElementOrNull;
  if (tipContainer === null) return;
  const tipElements = tipContainer.querySelectorAll('.search-tip');
  const firstTip = tipElements[0];

  const rotator = setInterval(() => {
    const visibleTip = tipContainer.querySelector('.current-tip') as HTMLElement;
    const nextTip = (visibleTip.nextElementSibling as HTMLElement) || firstTip;
    const transitionDur = 500;

    setTimeout(() => {
      visibleTip.classList.remove('current-tip');
      nextTip.classList.add('current-tip');
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

function initPrefilters(): void {
  const prefilterLinks = document.querySelectorAll('.pre-filter-btn-group .dropdown-item') as NodeListOf<HTMLElement>;
  const queryField = document.querySelector('#q') as HTMLInputElement;
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
        const searchField = document.querySelector('#search_field') as HTMLInputElement;
        const searchFieldVal = searchField.value;
        params.set('utf8', '✓');
        params.set('q', query);
        params.set('search_field', searchFieldVal);
        const newParams = params.toString();
        link.setAttribute('ga-event-value', '1');

        window.location.assign(`/?${newParams}`);
      } else {
        window.location.assign(href);
      }
    }, { once: true });
  });
}

// Initialize filters to include search form values in the search
function initFilters(): void {
  const filterLinks = document.querySelectorAll('a.facet-values-item') as NodeListOf<HTMLElement>;
  const queryField = document.querySelector('#q') as HTMLInputElement;
  filterLinks.forEach((link: HTMLElement) => {
    link.addEventListener('click', (e: Event) => {
      e.preventDefault();
      const query = queryField.value;
      const href = link.getAttribute('href')!;
      if (query.length > 0) {
        const paramString = href.split('?')[1];
        const params = new URLSearchParams(paramString);
        const searchField = document.querySelector('#search_field') as HTMLInputElement;
        const searchFieldVal = searchField.value;
        params.set('utf8', '✓');
        params.set('q', query);
        params.set('search_field', searchFieldVal);
        const newParams = params.toString();

        window.location.href = `/?${newParams}`;
      } else {
        window.location.href = href;
      }
    }, { once: true });
  });
}

export {
  rotateSearchTips,
  searchSelector,
  initPrefilters,
  initFilters,
};
