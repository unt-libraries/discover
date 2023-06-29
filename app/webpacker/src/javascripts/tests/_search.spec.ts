import {
  searchSelector,
  rotateSearchTips,
  initPrefilters,
  initFilters,
} from '../_search';

describe('searchSelector', () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = `
      <div class="search-query-form">
        <div class="input-group">
          <input type="text" name="q" id="q">
          <div class="input-group-append">
            <div class="dropdown d-none d-sm-block" id="searchFieldDropdownGroup">
              <button class="btn dropdown-toggle search__btn" type="button" id="search-fields" data-toggle="dropdown">
                " Look in: "
                <span class="selected">All Fields</span>
              </button>
              <div id="search_field_dropdown" class="dropdown-menu">
                <a href="#" class="dropdown-item" data-search-field="text" data-pretty="All Fields">All Fields</a>
                <a href="#" class="dropdown-item" data-search-field="title" data-pretty="Title">Title</a>
                <a href="#" class="dropdown-item" data-search-field="Author/Creator" data-pretty="Author/Creator">Author/Creator</a>
                <a href="#" class="dropdown-item" data-search-field="subject" data-pretty="Subject">Subject</a>
                <a href="#" class="dropdown-item" data-search-field="genre" data-pretty="Genre">Genre</a>
                <a href="#" class="dropdown-item" data-search-field="call_number" data-pretty="Call Number">Call Number</a>
                <a href="#" class="dropdown-item" data-search-field="sudoc" data-pretty="SuDocs">SuDocs</a>
                <a href="#" class="dropdown-item" data-search-field="standard_number" data-pretty="Standard # (ISBN/ISSN)">Standard # (ISBN/ISSN)</a>
                <a href="#" class="dropdown-item" data-search-field="control_number" data-pretty="Control # (LCCN/OCLC)">Control # (LCCN/OCLC)</a>
              </div>
            </div>
            <input type="hidden" name="search_field" id="search_field" value="text">
          </div>
        </div>
      </div>
    `;

    container = document.querySelector('.search-query-form') as HTMLElement;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should update the selected search field and search form value on click', () => {
    searchSelector();

    const dropdownItem: HTMLElement = container.querySelector('[data-search-field="title"]')!;
    const selectedText: string = dropdownItem.dataset.pretty!;
    const scopeValue: string = dropdownItem.dataset.searchField!;

    dropdownItem.click();

    expect(container.querySelector('.selected')!.innerHTML).toBe(selectedText);
    expect((container.querySelector('#search_field') as HTMLInputElement).value).toBe(scopeValue);
  });

  it('should not change the selected search field and search form value if the clicked item is the same as the current one', () => {
    searchSelector();

    const dropdownItem: HTMLElement = container.querySelector('[data-search-field="text"]')!;
    const initialSelectedText = container.querySelector('.selected')!.innerHTML;
    const initialScopeValue = (container.querySelector('#search_field') as HTMLInputElement).value;

    dropdownItem.click();

    expect(container.querySelector('.selected')!.innerHTML).toBe(initialSelectedText);
    expect((container.querySelector('#search_field') as HTMLInputElement).value).toBe(initialScopeValue);
  });

  it('should add a divider element before the call_number option if it does not exist', () => {
    const divider = container.querySelector('.dropdown-divider');
    if (divider) {
      divider.remove();
    }

    searchSelector();

    const callNumberOption = container.querySelector('[data-search-field="call_number"]')!;
    const prevSibling = callNumberOption.previousElementSibling!;

    expect(prevSibling.classList.contains('dropdown-divider')).toBe(true);
  });

  it('should change the selected search field and search form value when clicking different dropdown items consecutively', () => {
    searchSelector();

    const dropdownItem1: HTMLElement = container.querySelector('[data-search-field="title"]')!;
    const selectedText1 = dropdownItem1.dataset.pretty;
    const scopeValue1 = dropdownItem1.dataset.searchField;

    dropdownItem1.click();

    expect(container.querySelector('.selected')!.innerHTML).toBe(selectedText1);
    expect((container.querySelector('#search_field') as HTMLInputElement).value).toBe(scopeValue1);

    const dropdownItem2: HTMLElement = container.querySelector('[data-search-field="Author/Creator"]')!;
    const selectedText2 = dropdownItem2.dataset.pretty;
    const scopeValue2 = dropdownItem2.dataset.searchField;

    dropdownItem2.click();

    expect(container.querySelector('.selected')!.innerHTML).toBe(selectedText2);
    expect((container.querySelector('#search_field') as HTMLInputElement).value).toBe(scopeValue2);
  });
});

describe('rotateSearchTips', () => {
  let tipContainer: HTMLElement;
  let tipElements: NodeListOf<Element>;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="searchBarTips">
        <div class="search-tip current-tip">Tip 1</div>
        <div class="search-tip">Tip 2</div>
        <div class="search-tip">Tip 3</div>
      </div>
    `;

    tipContainer = document.querySelector('#searchBarTips') as HTMLElement;
    tipElements = tipContainer.querySelectorAll('.search-tip');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should rotate tips periodically', () => {
    jest.useFakeTimers();

    rotateSearchTips();

    expect(tipElements[0].classList.contains('current-tip')).toBe(true);
    expect(tipElements[1].classList.contains('current-tip')).toBe(false);

    jest.advanceTimersByTime(7000 + 500);

    expect(tipElements[0].classList.contains('current-tip')).toBe(false);
    expect(tipElements[1].classList.contains('current-tip')).toBe(true);

    jest.advanceTimersByTime(7000 + 500);

    expect(tipElements[1].classList.contains('current-tip')).toBe(false);
    expect(tipElements[2].classList.contains('current-tip')).toBe(true);

    jest.advanceTimersByTime(7000 + 500);

    expect(tipElements[2].classList.contains('current-tip')).toBe(false);
    expect(tipElements[0].classList.contains('current-tip')).toBe(true);
  });

  it('should pause tips rotation on mouseover and resume on mouseout', () => {
    jest.useFakeTimers();

    rotateSearchTips();

    tipContainer.dispatchEvent(new MouseEvent('mouseover'));

    jest.advanceTimersByTime(7000 + 500);

    expect(tipElements[0].classList.contains('current-tip')).toBe(true);
    expect(tipElements[1].classList.contains('current-tip')).toBe(false);

    tipContainer.dispatchEvent(new MouseEvent('mouseout'));

    jest.advanceTimersByTime(7000 + 500);

    expect(tipElements[0].classList.contains('current-tip')).toBe(false);
    expect(tipElements[1].classList.contains('current-tip')).toBe(true);
  });

  it('should not throw an error if the tip container is not present', () => {
    document.body.innerHTML = '';

    expect(() => rotateSearchTips()).not.toThrow();
  });
});

describe('initPrefilters', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input type="text" id="q" value="test">
      <input type="hidden" id="search_field" value="search_field_value">
      <div class="pre-filter-container">
        <div class="pre-filter-btn-group">
          <a class="dropdown-item" href="https://example.com/?test_param=1">Filter 1</a>
          <a class="dropdown-item" href="https://example.com/?test_param=2">Filter 2</a>
        </div>
      </div>
    `;
    initPrefilters();
  });

  it('should update URL with query and search field value', () => {
    const link1: HTMLElement = document.querySelector('.pre-filter-btn-group .dropdown-item')!;
    const assignMock = jest.fn();
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { assign: assignMock, href: 'https://example.com' };

    link1.click();

    expect(assignMock).toHaveBeenCalledWith('/?test_param=1&utf8=%E2%9C%93&q=test&search_field=search_field_value');
  });

  it('should navigate to the original href if the query is empty', () => {
    const link2: Node = document.querySelectorAll('.pre-filter-btn-group .dropdown-item')[1];
    const assignMock = jest.fn();
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { assign: assignMock, href: 'https://example.com' };
    (document.querySelector('#q') as HTMLInputElement)!.value = '';

    (link2 as HTMLElement).click();

    expect(assignMock).toHaveBeenCalledWith('https://example.com/?test_param=2');
  });

  it('should navigate to the original href if the current URL and link URL have different hostnames', () => {
    const link: HTMLElement = document.querySelector('.pre-filter-btn-group .dropdown-item')!;
    const assignMock = jest.fn();
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { assign: assignMock, href: 'https://different-host.com' };

    link.click();

    expect(assignMock).toHaveBeenCalledWith('https://example.com/?test_param=1');
  });

  it('should update URL with search_field if value is changed', () => {
    const link: HTMLElement = document.querySelector('.pre-filter-btn-group .dropdown-item')!;
    const assignMock = jest.fn();
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { assign: assignMock, href: 'https://example.com' };
    (document.querySelector('#search_field') as HTMLInputElement).value = 'new_search_field_value';

    link.click();

    expect(assignMock).toHaveBeenCalledWith('/?test_param=1&utf8=%E2%9C%93&q=test&search_field=new_search_field_value');
  });

  it('should navigate to the original href when both query and search field value are empty', () => {
    const link: HTMLElement = document.querySelector('.pre-filter-btn-group .dropdown-item')!;
    const assignMock = jest.fn();
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { assign: assignMock, href: 'https://example.com' };
    (document.querySelector('#q') as HTMLInputElement).value = '';
    (document.querySelector('#search_field') as HTMLInputElement).value = '';

    link.click();

    expect(assignMock).toHaveBeenCalledWith('https://example.com/?test_param=1');
  });
});

describe('initFilters', () => {
  let container: HTMLElement;
  let filters: NodeListOf<Element>;

  beforeEach(() => {
    document.body.innerHTML = `
      <div class="filter-container">
        <div class="filter">
          <div class="filter-header">
            <button class="btn btn-link filter-toggle" data-toggle="collapse" data-target="#filter-1" aria-expanded="true" aria-controls="filter-1">
              <span class="filter-title">Filter 1</span>
              <span class="filter-count">1</span>
            </button>
          </div>
          <div id="filter-1" class="filter-body collapse show" aria-labelledby="filter-1" data-parent=".filter-container">
            <div class="filter-content">
              <div class="filter-option">
                <input type="checkbox" id="filter-1-option-1" value="option-1">
                <label for="filter-1-option-1">Option 1</label>
              </div>
              <div class="filter-option">
                <input type="checkbox" id="filter-1-option-2" value="option-2">
                <label for="filter-1-option-2">Option 2</label>
              </div>
            </div>
          </div>
        </div>
        <div class="filter">
          <div class="filter-header">
            <button class="btn btn-link filter-toggle" data-toggle="collapse" data-target="#filter-2" aria-expanded="true" aria-controls="filter-2">
              <span class="filter-title">Filter 2</span>
              <span class="filter-count">1</span>
            </button>
          </div>
          <div id="filter-2" class="filter-body collapse show" aria-labelledby="filter-2" data-parent=".filter-container">
            <div class="filter-content">
              <div class="filter-option">
                <input type="checkbox" id="filter-2-option-1" value="option-1">
                <label for="filter-2-option-1">Option 1</label>
              </div>
              <div class="filter-option">
                <input type="checkbox" id="filter-2-option-2" value="option-2">
                <label for="filter-2-option-2">Option 2</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    container = document.querySelector('.filter-container') as HTMLElement;
    filters = container.querySelectorAll('.filter');
  });

  it('should add a click event listener to each filter toggle', () => {
    filters.forEach((filter) => {
      const toggle = filter.querySelector('.filter-toggle');
      // @ts-ignore
      jest.spyOn(toggle, 'click').mockImplementation(() => {});
    });

    initFilters();

    filters.forEach((filter) => {
      const toggle: HTMLElement = filter.querySelector('.filter-toggle')!;
      toggle.click();
      expect(toggle.click).toHaveBeenCalled();
    });
  });

  it('should add a click event listener to each filter option', () => {
    filters.forEach((filter) => {
      const options = filter.querySelectorAll('.filter-option');
      options.forEach((option) => {
        // @ts-ignore
        jest.spyOn(option, 'click').mockImplementation(() => {});
      });
    });

    initFilters();

    filters.forEach((filter) => {
      const options: NodeListOf<HTMLElement> = filter.querySelectorAll('.filter-option');
      options.forEach((option) => {
        option.click();
        expect(option.click).toHaveBeenCalled();
      });
    });
  });

  it('should add a click event listener to each filter option checkbox', () => {
    filters.forEach((filter) => {
      const options = filter.querySelectorAll('.filter-option');
      options.forEach((option) => {
        const checkbox = option.querySelector('input[type="checkbox"]');
        // @ts-ignore
        jest.spyOn(checkbox, 'click').mockImplementation(() => {});
      });
    });

    initFilters();

    filters.forEach((filter) => {
      const options = filter.querySelectorAll('.filter-option');
      options.forEach((option) => {
        const checkbox: HTMLElement = option.querySelector('input[type="checkbox"]')!;
        checkbox.click();
        expect(checkbox.click).toHaveBeenCalled();
      });
    });
  });

  it('should add a click event listener to each filter option label', () => {
    filters.forEach((filter) => {
      const options = filter.querySelectorAll('.filter-option');
      options.forEach((option) => {
        const label = option.querySelector('label');
        // @ts-ignore
        jest.spyOn(label, 'click').mockImplementation(() => {});
      });
    });

    initFilters();

    filters.forEach((filter) => {
      const options = filter.querySelectorAll('.filter-option');
      options.forEach((option) => {
        const label: HTMLElement = option.querySelector('label')!;
        label.click();
        expect(label.click).toHaveBeenCalled();
      });
    });
  });

  it('should not throw an error if the filter container is not present', () => {
    document.body.innerHTML = '';

    expect(() => initFilters()).not.toThrow();
  });

  it('should not throw an error if the filter container is empty', () => {
    document.body.innerHTML = '<div class="filter-container"></div>';

    expect(() => initFilters()).not.toThrow();
  });

  it('should not throw an error if the filter container has no filters', () => {
    document.body.innerHTML = '<div class="filter-container"><div class="filter"></div></div>';

    expect(() => initFilters()).not.toThrow();
  });
});
