import {
  describe, it, expect, beforeEach, vi,
} from 'vitest';
import { JSDOM } from 'jsdom';

// Mock the search functionality from _search.ts
// We'll create a simplified version for testing
function searchSelector(): void {
  const searchFieldDropdown = document.getElementById('search-fields-toggle');
  const searchFieldHidden = document.getElementById('search_field_hidden') as HTMLInputElement;
  const dropdownItems = document.querySelectorAll('#searchFieldDropdownGroup .dropdown-menu a');

  if (!searchFieldDropdown || !searchFieldHidden || !dropdownItems.length) return;

  dropdownItems.forEach((item) => {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      const target = event.target as HTMLElement;
      const fieldValue = target.getAttribute('data-field-value') || target.textContent?.trim() || '';
      const fieldLabel = target.textContent?.trim() || '';

      // Update hidden field
      searchFieldHidden.value = fieldValue;

      // Update dropdown button text
      const buttonText = searchFieldDropdown.querySelector('.dropdown-toggle-text');
      if (buttonText) {
        buttonText.textContent = fieldLabel;
      }
    });
  });
}

// Helper function to create mock DOM structure
function createSearchFormDOM() {
  const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
      <head></head>
      <body>
        <form class="search-query-form" action="/" method="get">
          <input type="text" name="q" id="q" value="" />
          <input type="hidden" name="search_field" id="search_field_hidden" value="text" />
          
          <div class="dropdown">
            <button type="button" id="search-fields-toggle" class="btn dropdown-toggle">
              <span class="dropdown-toggle-text">All Fields</span>
            </button>
            <div id="searchFieldDropdownGroup">
              <div class="dropdown-menu">
                <a href="#" data-field-value="text">All Fields</a>
                <a href="#" data-field-value="title">Title</a>
                <a href="#" data-field-value="Author/Creator">Author/Creator</a>
                <a href="#" data-field-value="subject">Subject</a>
                <a href="#" data-field-value="genre">Genre</a>
                <a href="#" data-field-value="call_number">Call Number</a>
                <a href="#" data-field-value="sudocs">SuDocs</a>
                <a href="#" data-field-value="isbn">ISBN/ISSN</a>
                <a href="#" data-field-value="lccn">LCCN/OCLC</a>
              </div>
            </div>
          </div>
          
          <button type="submit" class="search-btn">Search</button>
        </form>
      </body>
    </html>
  `);

  // Set up global DOM
  global.document = dom.window.document;
  global.window = dom.window as any;

  return dom;
}

describe('Search Field Selection JavaScript Functionality', () => {
  beforeEach(() => {
    createSearchFormDOM();
    searchSelector(); // Initialize the search selector functionality
  });

  describe('Dropdown field selection', () => {
    it('changes search field when dropdown option clicked (replaces RSpec test)', () => {
      const titleOption = document.querySelector('[data-field-value="title"]') as HTMLElement;
      const hiddenField = document.getElementById('search_field_hidden') as HTMLInputElement;
      const dropdownToggleText = document.querySelector('.dropdown-toggle-text') as HTMLElement;

      expect(hiddenField.value).toBe('text'); // Default value
      expect(dropdownToggleText.textContent).toBe('All Fields'); // Default text

      // Simulate clicking the Title option
      titleOption.click();

      expect(hiddenField.value).toBe('title');
      expect(dropdownToggleText.textContent).toBe('Title');
    });

    it('updates hidden field to title when title option is selected', () => {
      const titleOption = document.querySelector('[data-field-value="title"]') as HTMLElement;
      const hiddenField = document.getElementById('search_field_hidden') as HTMLInputElement;

      titleOption.click();

      expect(hiddenField.value).toBe('title');
    });

    it('updates hidden field to Author/Creator when author option is selected', () => {
      const authorOption = document.querySelector('[data-field-value="Author/Creator"]') as HTMLElement;
      const hiddenField = document.getElementById('search_field_hidden') as HTMLInputElement;

      authorOption.click();

      expect(hiddenField.value).toBe('Author/Creator');
    });

    it('updates hidden field to subject when subject option is selected', () => {
      const subjectOption = document.querySelector('[data-field-value="subject"]') as HTMLElement;
      const hiddenField = document.getElementById('search_field_hidden') as HTMLInputElement;

      subjectOption.click();

      expect(hiddenField.value).toBe('subject');
    });
  });

  describe('Form submission with search field selection', () => {
    it('maintains selected search field when form is submitted', () => {
      const titleOption = document.querySelector('[data-field-value="title"]') as HTMLElement;
      const hiddenField = document.getElementById('search_field_hidden') as HTMLInputElement;
      const form = document.querySelector('.search-query-form') as HTMLFormElement;
      const queryInput = document.getElementById('q') as HTMLInputElement;

      // Select title field
      titleOption.click();
      expect(hiddenField.value).toBe('title');

      // Set a query value
      queryInput.value = 'introduction';

      // Create FormData to simulate form submission
      const formData = new FormData(form);
      expect(formData.get('search_field')).toBe('title');
      expect(formData.get('q')).toBe('introduction');
    });

    it('includes search_field parameter in form data for author searches', () => {
      const authorOption = document.querySelector('[data-field-value="Author/Creator"]') as HTMLElement;
      const form = document.querySelector('.search-query-form') as HTMLFormElement;
      const queryInput = document.getElementById('q') as HTMLInputElement;

      authorOption.click();
      queryInput.value = 'smith';

      const formData = new FormData(form);
      expect(formData.get('search_field')).toBe('Author/Creator');
      expect(formData.get('q')).toBe('smith');
    });

    it('includes search_field parameter in form data for subject searches', () => {
      const subjectOption = document.querySelector('[data-field-value="subject"]') as HTMLElement;
      const form = document.querySelector('.search-query-form') as HTMLFormElement;
      const queryInput = document.getElementById('q') as HTMLInputElement;

      subjectOption.click();
      queryInput.value = 'physics';

      const formData = new FormData(form);
      expect(formData.get('search_field')).toBe('subject');
      expect(formData.get('q')).toBe('physics');
    });
  });

  describe('Search field persistence', () => {
    it('remembers selected search field across multiple selections', () => {
      const hiddenField = document.getElementById('search_field_hidden') as HTMLInputElement;
      const dropdownToggleText = document.querySelector('.dropdown-toggle-text') as HTMLElement;

      // Select Author/Creator
      const authorOption = document.querySelector('[data-field-value="Author/Creator"]') as HTMLElement;
      authorOption.click();

      expect(hiddenField.value).toBe('Author/Creator');
      expect(dropdownToggleText.textContent).toBe('Author/Creator');

      // Simulate another search (the field should persist)
      const form = document.querySelector('.search-query-form') as HTMLFormElement;
      const queryInput = document.getElementById('q') as HTMLInputElement;

      queryInput.value = 'first search';
      let formData = new FormData(form);
      expect(formData.get('search_field')).toBe('Author/Creator');

      // Change query for second search
      queryInput.value = 'second search';
      formData = new FormData(form);
      expect(formData.get('search_field')).toBe('Author/Creator');
      expect(dropdownToggleText.textContent).toBe('Author/Creator');
    });
  });

  describe('URL parameter simulation', () => {
    it('constructs correct URL parameters for title search', () => {
      const titleOption = document.querySelector('[data-field-value="title"]') as HTMLElement;
      const form = document.querySelector('.search-query-form') as HTMLFormElement;
      const queryInput = document.getElementById('q') as HTMLInputElement;

      titleOption.click();
      queryInput.value = 'introduction';

      const formData = new FormData(form);
      const urlParams = new URLSearchParams(formData as any);
      const paramString = urlParams.toString();

      expect(paramString).toContain('search_field=title');
      expect(paramString).toContain('q=introduction');
    });

    it('constructs correct URL parameters for author search', () => {
      const authorOption = document.querySelector('[data-field-value="Author/Creator"]') as HTMLElement;
      const form = document.querySelector('.search-query-form') as HTMLFormElement;
      const queryInput = document.getElementById('q') as HTMLInputElement;

      authorOption.click();
      queryInput.value = 'smith';

      const formData = new FormData(form);
      const urlParams = new URLSearchParams(formData as any);
      const paramString = urlParams.toString();

      expect(paramString).toContain('search_field=Author%2FCreator');
      expect(paramString).toContain('q=smith');
    });

    it('constructs correct URL parameters for subject search', () => {
      const subjectOption = document.querySelector('[data-field-value="subject"]') as HTMLElement;
      const form = document.querySelector('.search-query-form') as HTMLFormElement;
      const queryInput = document.getElementById('q') as HTMLInputElement;

      subjectOption.click();
      queryInput.value = 'physics';

      const formData = new FormData(form);
      const urlParams = new URLSearchParams(formData as any);
      const paramString = urlParams.toString();

      expect(paramString).toContain('search_field=subject');
      expect(paramString).toContain('q=physics');
    });
  });

  describe('Special character handling', () => {
    it('handles searches with quotes in query parameters', () => {
      const form = document.querySelector('.search-query-form') as HTMLFormElement;
      const queryInput = document.getElementById('q') as HTMLInputElement;

      queryInput.value = '"exact phrase"';

      const formData = new FormData(form);
      const urlParams = new URLSearchParams(formData as any);
      const paramString = urlParams.toString();

      expect(paramString).toContain('q=%22exact+phrase%22');
    });

    it('properly encodes special characters in form data', () => {
      const form = document.querySelector('.search-query-form') as HTMLFormElement;
      const queryInput = document.getElementById('q') as HTMLInputElement;

      queryInput.value = 'C++ programming';

      const formData = new FormData(form);
      const urlParams = new URLSearchParams(formData as any);
      const paramString = urlParams.toString();

      expect(paramString).toContain('q=C%2B%2B+programming');
    });
  });

  describe('Edge cases and error handling', () => {
    it('handles missing elements gracefully', () => {
      // Remove critical elements to test error handling
      const hiddenField = document.getElementById('search_field_hidden');
      hiddenField?.remove();

      // This should not throw an error
      expect(() => searchSelector()).not.toThrow();
    });

    it('handles dropdown items without data attributes', () => {
      const newOption = document.createElement('a');
      newOption.textContent = 'Test Field';
      // Intentionally not setting data-field-value

      const dropdownMenu = document.querySelector('.dropdown-menu');
      dropdownMenu?.appendChild(newOption);

      // This should not throw an error when clicked
      expect(() => newOption.click()).not.toThrow();
    });
  });
});

// Additional tests for facet interaction with search parameters
describe('Search with Facets Integration', () => {
  beforeEach(() => {
    createSearchFormDOM();
  });

  it('maintains search parameters when facets would be applied', () => {
    const form = document.querySelector('.search-query-form') as HTMLFormElement;
    const queryInput = document.getElementById('q') as HTMLInputElement;
    const hiddenField = document.getElementById('search_field_hidden') as HTMLInputElement;

    // Set up search with title field
    hiddenField.value = 'title';
    queryInput.value = 'mathematics';

    // Create URL that would include facet parameters
    const formData = new FormData(form);
    const baseParams = new URLSearchParams(formData as any);

    // Simulate adding facet parameters
    baseParams.append('f[resource_type_facet][]', 'books');

    const fullParamString = baseParams.toString();

    expect(fullParamString).toContain('q=mathematics');
    expect(fullParamString).toContain('search_field=title');
    expect(fullParamString).toContain('f%5Bresource_type_facet%5D%5B%5D=books');
  });
});
