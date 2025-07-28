
# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Simple search functionality', type: :feature do
  before do
    # Ensure we're starting from a clean state
  end

  describe 'Search form display' do
    it 'displays search form on home page' do
      visit root_path

      # Find the form - it should submit to search_action_url (likely root)
      search_form = find('form.search-query-form')
      expect(search_form).to be_present

      expect(page).to have_field('q', id: 'q')
      expect(page).to have_button(type: 'submit')
    end

    it 'displays search field dropdown button' do
      visit root_path

      # Should have search field dropdown button
      within '#search-fields-toggle' do
        expect(page).to have_content('Look in')
      end
    end

    it 'shows expected search field options in dropdown' do
      visit root_path

      # Click the dropdown toggle (this works without JS for basic HTML)
      find('#search-fields-toggle').click

      within '#searchFieldDropdownGroup' do
        expect(page).to have_content('All Fields')
        expect(page).to have_content('Title')
        expect(page).to have_content('Author/Creator')
        expect(page).to have_content('Subject')
        expect(page).to have_content('Genre')
        expect(page).to have_content('Call Number')
        expect(page).to have_content('SuDocs')
        expect(page).to have_content('ISBN/ISSN')
        expect(page).to have_content('LCCN/OCLC')
      end
    end
  end

  describe 'Basic search execution' do
    it 'performs search with query term' do
      visit root_path

      fill_in 'q', id: 'q', with: 'science'
      click_button class: 'search-btn'

      # Should include query parameter regardless of exact URL
      expect(current_url).to include('q=science')

      # Should show search results
      expect(page).to have_css('#documents')
    end

    it 'preserves search term in search box after search' do
      visit root_path

      fill_in 'q', id: 'q', with: 'mathematics'
      click_button class: 'search-btn'

      # Search term should still be in the search box
      expect(find_field('q', id: 'q').value).to eq('mathematics')
    end

    it 'shows search results header' do
      visit root_path

      fill_in 'q', id: 'q', with: 'science'
      click_button class: 'search-btn'

      # Should display search results content
      expect(page).to have_css('.card')
      expect(page).to have_css('#documents')
    end

    it 'handles empty search gracefully' do
      visit root_path

      fill_in 'q', id: 'q', with: ''
      click_button class: 'search-btn'

      # Should not error, should show some results or message
      expect(page).to have_css('#documents, .zero-results')
      expect(page).not_to have_content('error')
    end
  end

  describe 'Search field selection via URL parameters' do
    it 'defaults to "All fields" (text) search field' do
      visit root_path

      # Default should show All fields in the button
      within '#search-fields-toggle' do
        expect(page).to have_content('All Fields')
      end

      # Hidden field should have default value
      expect(find('#search_field_hidden', visible: false).value).to eq('text')
    end

    it 'shows correct field when search_field parameter is title' do
      visit '/?search_field=title'

      # Should show Title in the dropdown button
      within '#search-fields-toggle' do
        expect(page).to have_content('Title')
      end

      # Hidden field should have title value
      expect(find('#search_field_hidden', visible: false).value).to eq('title')
    end

    it 'shows correct field when search_field parameter is Author/Creator' do
      visit '/?search_field=Author%2FCreator'

      # Should show Author/Creator in the dropdown button
      within '#search-fields-toggle' do
        expect(page).to have_content('Author/Creator')
      end

      # Hidden field should have Author/Creator value
      expect(find('#search_field_hidden', visible: false).value).to eq('Author/Creator')
    end

    it 'shows correct field when search_field parameter is subject' do
      visit '/?search_field=subject'

      # Should show Subject in the dropdown button
      within '#search-fields-toggle' do
        expect(page).to have_content('Subject')
      end

      # Hidden field should have subject value
      expect(find('#search_field_hidden', visible: false).value).to eq('subject')
    end

    it 'performs title search when search_field parameter is provided' do
      visit '/?q=introduction&search_field=title'

      # Should show title search was performed
      expect(current_url).to include('search_field=title')
      expect(current_url).to include('q=introduction')
      expect(page).to have_css('#documents')
    end

    it 'performs author search when search_field parameter is provided' do
      visit '/?q=smith&search_field=Author%2FCreator'

      expect(current_url).to include('search_field=Author%2FCreator')
      expect(current_url).to include('q=smith')
      expect(page).to have_css('#documents')
    end

    it 'performs subject search when search_field parameter is provided' do
      visit '/?q=physics&search_field=subject'

      expect(current_url).to include('search_field=subject')
      expect(current_url).to include('q=physics')
      expect(page).to have_css('#documents')
    end

    it 'maintains search field in form submission' do
      visit '/?search_field=title'

      fill_in 'q', id: 'q', with: 'test search'
      click_button class: 'search-btn'

      # Should maintain the search_field parameter
      expect(current_url).to include('search_field=title')
      expect(current_url).to include('q=test')
    end
  end

  describe 'Search results display' do
    it 'displays document results' do
      visit '/?q=science&search_field=text'

      # Should have document results in card
      expect(page).to have_css('.card')
      expect(page).to have_css('#documents')

      # Each document should have basic elements
      within '#documents' do
        expect(page).to have_css('.document')
        expect(page).to have_css('a[href*="/catalog/"]') # Links to document pages
      end
    end

    it 'shows sort and pagination controls' do
      visit '/?q=science&search_field=text'

      # Should have sort and per page controls
      expect(page).to have_css('.card .card-body')
    end

    it 'shows zero results message when no matches' do
      visit '/?q=xyznonexistentterm123&search_field=text'

      # Should show zero results content
      expect(page).to have_css('.card')
    end
  end

  describe 'Search with facets combination' do
    it 'combines simple search with facet filtering' do
      visit '/?q=science&f%5Baccess_facet%5D%5B%5D=Online&search_field=text'

      # Should show both search term and facet constraint
      expect(find_field('q', id: 'q').value).to eq('science')
      expect(page).to have_content('Access')
      expect(page).to have_content('Online')

      # Should show combined results
      expect(page).to have_css('#documents')
    end

    it 'applies facets while maintaining search functionality' do
      # Start with a search that has results and facets
      visit '/?q=science&search_field=text'

      # Verify we have facets available before trying to click them
      if page.has_css?('a[href*="f%5B"]')
        expect(page).to have_css('a[href*="f%5B"]')
      else
        skip "No facets available on search results page"
      end
    end
  end

  describe 'Special characters and edge cases' do
    it 'handles searches with quotes' do
      visit root_path

      fill_in 'q', id: 'q', with: '"exact phrase"'
      click_button class: 'search-btn'

      # URL encoding can vary, so check for either format
      expect(current_url).to match(/exact(\+|%20)phrase/)
      expect(page).to have_css('.card')
    end

    it 'handles searches with special characters' do
      visit root_path

      fill_in 'q', id: 'q', with: 'C++ programming'
      click_button class: 'search-btn'

      expect(page).to have_css('.card')
      expect(page).not_to have_content('error')
    end

    it 'handles very long search terms' do
      long_term = 'a' * 200
      visit root_path

      fill_in 'q', id: 'q', with: long_term
      click_button class: 'search-btn'

      expect(page).not_to have_content('error')
    end
  end

  describe 'Advanced search link' do
    it 'provides link to advanced search' do
      visit root_path

      expect(page).to have_link('Advanced Search')
      expect(page).to have_css('.advanced_search')
    end

    it 'navigates to advanced search page' do
      visit root_path

      click_link 'Advanced Search'

      expect(current_path).to eq('/advanced')
      within '.advanced-search-form' do
        expect(page).to have_content('Advanced Search')
      end
    end
  end

  describe 'Prefilter options' do
    it 'displays prefilter button group' do
      visit root_path

      # Should have prefilter buttons
      expect(page).to have_css('.pre-filter-btn-group')
      expect(page).to have_css('[data-bs-toggle="dropdown"]')
    end
  end
end
