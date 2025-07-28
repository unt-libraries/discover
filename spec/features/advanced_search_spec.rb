# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Advanced search functionality', type: :feature do
  describe 'Advanced search page' do
    it 'is accessible from the home page' do
      visit root_path
      click_link 'Advanced Search'
      expect(page).to have_current_path('/advanced')
      expect(page).to have_content('Advanced Search')
    end

    it 'displays the advanced search form' do
      visit '/advanced'
      within '.advanced-search-form' do
        expect(page).to have_content('Find items that match')
        expect(page).to have_css('#advanced_search')
        expect(page).to have_css('input#clause_1_query')
        expect(page).to have_css('input#clause_2_query')
        expect(page).to have_css('input#clause_3_query')
        expect(page).to have_button('Search')
      end
    end

    it 'displays facet limits' do
      visit '/advanced'
      within '.advanced-search-form' do
        expect(page).to have_content('AND have these attributes')
        expect(page).to have_css('#advanced_search_facets')
      end
    end
  end

  describe 'Executing an advanced search' do
    it 'performs a search with a single field' do
      visit '/advanced'
      fill_in 'Title', with: 'science'
      click_button 'advanced-search-submit'

      expect(page).to have_css('#documents')

      within '#appliedParams' do
        expect(page).to have_content('Start Over')
        expect(page).to have_content('Title')
        expect(page).to have_content('science')
      end
    end

    it 'performs a search with multiple fields using AND' do
      visit '/advanced'
      fill_in 'Title', with: 'science'
      select 'all', from: 'op'
      fill_in 'Subject', with: 'history'
      click_button 'advanced-search-submit'

      expect(page).to have_css('#documents')

      within '#appliedParams' do
        expect(page).to have_content('Start Over')
        expect(page).to have_content('Title')
        expect(page).to have_content('science')
        expect(page).to have_content('Subject')
        expect(page).to have_content('history')
      end
    end

    it 'performs a search with a facet limit' do
      visit '/advanced'
      fill_in 'Title', with: 'science'

      within '#facet-access_facet' do
        check 'Online'
      end

      click_button 'advanced-search-submit'

      expect(page).to have_css('#documents')

      within '#appliedParams' do
        expect(page).to have_content('Start Over')
        expect(page).to have_content('Title')
        expect(page).to have_content('science')
        expect(page).to have_content('Access')
        expect(page).to have_content('Online')
      end
    end

    describe 'Boolean operators' do
      it 'respects NOT operator in advanced search' do
        visit '/advanced'
        fill_in 'Title', with: 'gone with NOT wind'
        check 'Video/Film'
        click_button 'advanced-search-submit'

        expect(page).to have_css('#documents')

        within '#appliedParams' do
          expect(page).to have_content('Start Over')
          expect(page).to have_content('Title')
          expect(page).to have_content('gone with NOT wind')
        end

        within '#documents' do
          title_elements = all('.document-title-heading')
          expect(title_elements).not_to be_empty

          titles_with_terms = 0

          title_elements.each do |title_element|
            title_text = title_element.text.downcase

            # Count how many titles contain the expected terms
            if title_text.match(/gone|with/)
              titles_with_terms += 1
            end

            # Always ensure wind is never present
            expect(title_text).not_to include('wind')
          end

          # Expect at least some titles to contain the search terms
          expect(titles_with_terms).to be > 0
        end
      end

      it 'performs search with OR operator (should)' do
        visit '/advanced'

        fill_in 'All Fields', with: 'science'
        fill_in 'Title', with: 'mathematics'
        select 'any', from: 'op'

        click_button 'advanced-search-submit'

        expect(current_url).to include('op=should')
        expect(page).to have_css('#documents')
        expect(page).to have_content('You searched for:')
      end

      it 'performs search with AND operator (must) - default' do
        visit '/advanced'

        fill_in 'All Fields', with: 'science'
        fill_in 'Title', with: 'history'
        # 'must' should be selected by default

        click_button 'advanced-search-submit'

        expect(current_url).to include('op=must')
        expect(page).to have_css('#documents')
      end
    end
  end

  describe 'Range/Date search testing' do
    it 'applies publication year range filter' do
      visit '/advanced'

      fill_in 'All Fields', with: 'science'
      fill_in 'Publication date range (starting year)', with: '2000'
      fill_in 'Publication date range (ending year)', with: '2020'

      click_button 'advanced-search-submit'

      expect(current_url).to include('range[publication_year_range_facet][begin]=2000')
      expect(current_url).to include('range[publication_year_range_facet][end]=2020')
      expect(page).to have_css('#documents')
    end

    it 'applies only start year when end year is blank' do
      visit '/advanced'

      fill_in 'All Fields', with: 'science'
      fill_in 'Publication date range (starting year)', with: '2010'
      # Leave end year blank

      click_button 'advanced-search-submit'

      expect(current_url).to include('range[publication_year_range_facet][begin]=2010')
      expect(page).to have_css('#documents')
    end

    it 'applies only end year when start year is blank' do
      visit '/advanced'

      fill_in 'All Fields', with: 'science'
      fill_in 'Publication date range (ending year)', with: '2020'
      # Leave start year blank

      click_button 'advanced-search-submit'

      expect(current_url).to include('range[publication_year_range_facet][end]=2020')
      expect(page).to have_css('#documents')
    end
  end

  describe 'Sort field testing' do
    it 'applies custom sort order - Publication Year (Newest)' do
      visit '/advanced'

      fill_in 'All Fields', with: 'science'
      select 'Publication Year (Newest)', from: 'sort'

      click_button 'advanced-search-submit'

      expect(current_url).to include('sort=publication_sort+desc%2C+title_sort+asc')
      expect(page).to have_css('#documents')
    end

    it 'applies Title (A-Z) sort' do
      visit '/advanced'

      fill_in 'All Fields', with: 'mathematics'
      select 'Title (A-Z)', from: 'sort'

      click_button 'advanced-search-submit'

      expect(current_url).to include('sort=title_sort+asc')
      expect(page).to have_css('#documents')
    end

    it 'uses default Relevance sort when not specified' do
      visit '/advanced'

      fill_in 'All Fields', with: 'science'
      # Don't change sort - should default to Relevance

      click_button 'advanced-search-submit'

      # Should either not have sort param or have the default relevance sort
      expect(page).to have_css('#documents')
    end
  end

  describe 'Start over functionality' do
    it 'clears the form when start over is clicked' do
      visit '/advanced'

      # Fill in various fields
      fill_in 'All Fields', with: 'science'
      fill_in 'Title', with: 'mathematics'
      fill_in 'Publication date range (starting year)', with: '2000'
      select 'any', from: 'op'
      within '#facet-access_facet' do
        check 'Online'
      end

      click_link 'Start over'

      # Should be back on clean advanced search page
      expect(page).to have_current_path('/advanced')
      expect(find_field('All Fields').value).to be_blank
      expect(find_field('Title').value).to be_blank
      expect(find_field('Publication date range (starting year)').value).to be_blank
      expect(find_field('op').value).to eq('must') # Back to default
      expect(find_field('f_inclusive_access_facet_1')).not_to be_checked
    end
  end

  describe 'Facet filtering' do
    it 'applies access facet filter - Online' do
      visit '/advanced'

      fill_in 'All Fields', with: 'science'
      within '#facet-access_facet' do
        check 'Online'
      end

      click_button 'advanced-search-submit'

      expect(current_url).to include('f_inclusive[access_facet][]=Online')
      expect(page).to have_css('#documents')
      expect(page).to have_content('You searched for:')
    end

    it 'applies multiple facet filters' do
      visit '/advanced'

      fill_in 'All Fields', with: 'science'
      within '#facet-access_facet' do
        check "At the Library"
        check 'Online'
      end

      click_button 'advanced-search-submit'

      expect(current_url).to include('f_inclusive[access_facet][]=At+the+Library')
      expect(current_url).to include('f_inclusive[access_facet][]=Online')
      expect(page).to have_css('#documents')
    end

    it 'applies collection facet filter' do
      visit '/advanced'

      fill_in 'All Fields', with: 'science'

      # First expand the collection facet section
      find('a[href="#facet-collection_facet"]').click
      within '#facet-collection_facet' do
        check 'General Collection'
      end

      click_button 'advanced-search-submit'

      expect(current_url).to include('f_inclusive[collection_facet][]=General+Collection')
      expect(page).to have_css('#documents')
    end
  end

  describe 'Edge cases and error handling' do
    it 'handles empty advanced search submission' do
      visit '/advanced'

      # Submit without filling anything
      click_button 'advanced-search-submit'

      expect(page).not_to have_content('error')
      expect(page).to have_css('#documents, .zero-results')
    end

    it 'handles special characters in advanced search fields' do
      visit '/advanced'

      fill_in 'All Fields', with: 'C++ programming'
      fill_in 'Title', with: '"exact phrase"'
      fill_in 'Author/Creator', with: 'author: smith'

      click_button 'advanced-search-submit'

      expect(page).to have_css('#documents')
      expect(page).not_to have_content('error')
    end

    it 'handles invalid date ranges gracefully' do
      visit '/advanced'

      fill_in 'All Fields', with: 'science'
      fill_in 'Publication date range (starting year)', with: '2020'
      fill_in 'Publication date range (ending year)', with: '2000' # End before start

      click_button 'advanced-search-submit'

      expect(page).not_to have_content('error')
      expect(page).to have_content('The start year must be before the end year.')
    end

    it 'handles very long search terms' do
      long_term = 'a' * 200
      visit '/advanced'

      fill_in 'All Fields', with: long_term

      click_button 'advanced-search-submit'

      expect(page).not_to have_content('error')
    end

    it 'handles non-numeric year input' do
      visit '/advanced'

      fill_in 'All Fields', with: 'science'
      # Try to fill non-numeric value in number field
      fill_in 'Publication date range (starting year)', with: 'abc'

      click_button 'advanced-search-submit'

      expect(page).not_to have_content('error')
      expect(page).to have_css('#documents')
    end
  end

  describe 'Multiple search fields combination' do
    it 'searches across different field types with AND operator' do
      visit '/advanced'

      fill_in 'All Fields', with: 'science'
      fill_in 'Title', with: 'introduction'
      fill_in 'Author/Creator', with: 'smith'
      fill_in 'Subject', with: 'physics'
      select 'all', from: 'op'

      click_button 'advanced-search-submit'

      expect(current_url).to include('clause[0][query]=science')
      expect(current_url).to include('clause[1][query]=introduction')
      expect(current_url).to include('clause[2][query]=smith')
      expect(current_url).to include('clause[3][query]=physics')
      expect(current_url).to include('op=must')
      expect(page).to have_css('#documents')
    end
  end
end
