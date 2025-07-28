
# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Facet search functionality', type: :feature do
  before do
    # nothing needed here, but can be used to set up test data or mock services
  end

  describe 'Basic facet functionality' do
    it 'displays facet fields on the home page' do
      visit root_path

      # Check that home facets are displayed
      expect(page).to have_css('#facets')
      expect(page).to have_content('Access')
      expect(page).to have_content('Resource Type')
      expect(page).to have_content('Format or Media Type')
    end

    it 'shows facet values with counts' do
      visit root_path

      # Look for facet links with counts in parentheses
      within '#facets' do
        facet_links = all('a[href*="f%5B"]')
        expect(facet_links.count).to be > 0

        # Check that at least some facet links have counts
        facet_with_count = facet_links.find { |link| link.text.match(/(\d+)/) }
        expect(facet_with_count).to be_present
      end
    end
  end

  describe 'Facet filtering' do
    it 'applies facet filter when clicked' do
      visit root_path

      # Find first available facet link
      facet_link = first('a[href*="f%5B"]')
      expect(facet_link).to be_present

      facet_link.click

      # Should redirect to search results with facet applied
      expect(current_url).to include('f%5B')
      expect(page).to have_css('.applied-filter, .constraint, [class*="constraint"]')
    end

    it 'shows applied filters in constraints' do
      # Visit a URL with a facet already applied
      visit '/?f%5Baccess_facet%5D%5B%5D=Online'

      # Should show the applied constraint
      within '#appliedParams' do
        expect(page).to have_content('Access')
        expect(page).to have_content('Online')
        expect(page).to have_css('a.filter-access_facet[href*="/"]') # Remove filter link
      end
    end

    it 'allows removing applied filters' do
      visit '/?f%5Baccess_facet%5D%5B%5D=Online'

      # Find and click remove filter link
      remove_link = find('.selected.facet-values-item', match: :first)
      remove_link.click

      # Should return to unfiltered results
      expect(current_url).not_to include('f%5B')
    end
  end

  describe 'Multiple facets' do
    it 'allows applying multiple facet filters' do
      visit '/?f%5Baccess_facet%5D%5B%5D=Online&f%5Bresource_type_facet%5D%5B%5D=books'

      within '#appliedParams' do
        # Should show both constraints
        expect(page).to have_content('Access')
        expect(page).to have_content('Resource Type')
      end

      # Should have multiple constraint elements
      constraints = all('.constraint, .applied-filter, [class*="constraint"]')
      expect(constraints.count).to be >= 2
    end
  end

  describe 'Facet counts update with filters' do
    it 'shows different facet counts when filters are applied' do
      # Get facet counts without filters
      visit root_path
      initial_counts = extract_facet_counts

      # Apply a filter
      facet_link = first('a[href*="f%5B"]')
      facet_link.click if facet_link

      # Get new facet counts
      filtered_counts = extract_facet_counts

      # At least some counts should be different (usually smaller)
      expect(filtered_counts).not_to eq(initial_counts)
    end
  end

  describe 'Advanced search facets' do
    it 'shows facets on advanced search page' do
      visit '/advanced'

      # Should have facet interface for advanced search
      within '.advanced-facet-cards' do
        expect(page).to have_content('Access')
        expect(page).to have_content('Resource Type')
      end
    end

    it 'excludes certain facets from advanced search' do
      visit '/advanced'

      # These should NOT appear in advanced search based on your config
      expect(page).not_to have_content('Newly Added')
    end
  end

  describe 'Range facets' do
    it 'displays publication year range facet' do
      visit '/?f%5Baccess_facet%5D%5B%5D=At+the+Library'

      # Range facets have different display
      within '#facet-publication_year_range_facet' do
        expect(page).to have_content('Publication date range')
        expect(page).to have_css('[class*="range"], .slider, input[type="range"]', wait: 1)
      end
    end
  end

  describe 'Query facets' do
    it 'displays newly added facet options' do
      visit root_path

      within '#facet-newly_added_facet' do
        expect(page).to have_content('Within the last month')
      end
    end

    it 'applies query facet filters correctly' do
      visit '/?f%5Bnewly_added_facet%5D%5B%5D=weeks_1'

      expect(page).to have_content('Within the last week')
      expect(page).to have_css('.constraint, .applied-filter')
    end
  end

  private

  def extract_facet_counts
    counts = {}
    all('#facets a[href*="f%5B"]').each do |link|
      if match = link.text.match(/(.+?)\s*(\d+)\s*$/)
        facet_name = match[1].strip
        count = match[2].to_i
        counts[facet_name] = count
      end
    end
    counts
  end
end
