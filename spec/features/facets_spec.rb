# frozen_string_literal: true

require 'rails_helper'

describe 'Facets' do
  context 'Home page facets' do
    before do
      visit root_path
    end

    it 'exist' do
      expect(page).to have_css('#facets')
    end

    it 'are not duplicated' do
      expect(page).to have_css('#facets', maximum: 1)
    end

    it 'contain correct facets' do
      within('#facets') do
        expect(page).to have_css('.facet-limit', count: 4)
        expect(page).to have_css('.blacklight-access_facet', text: 'Access')
        expect(page).to have_css('.blacklight-resource_type_facet', text: 'Resource Type')
        expect(page).to have_css('.blacklight-media_type_facet', text: 'Format or Media Type')
        expect(page).to have_css('.blacklight-collection_facet', text: 'Collection')
      end
    end
  end

  context 'Index page facets' do
    before do
      visit search_catalog_path(f: { access_facet: ['At the Library'] })
    end

    it 'exist' do
      expect(page).to have_css('#facets')
    end

    it 'are not duplicated' do
      expect(page).to have_css('#facets', maximum: 1)
    end

    it 'contains all facets' do
      within('#facets') do
        expect(page).to have_css('.facet-limit', count: 18)
        expect(page).to have_css('.blacklight-access_facet', text: 'Access')
        expect(page).to have_css('.blacklight-resource_type_facet', text: 'Resource Type')
        expect(page).to have_css('.blacklight-media_type_facet', text: 'Format or Media Type')
        expect(page).to have_css('.blacklight-collection_facet', text: 'Collection')
        expect(page).to have_css('.blacklight-building_facet', text: 'Building Location')
        expect(page).to have_css('.blacklight-shelf_facet', text: 'Shelf Location')
        expect(page).to have_css('.blacklight-publication_year_range_facet', text: 'Date')
        expect(page).to have_css('.blacklight-languages', text: 'Language')
        expect(page).to have_css('.blacklight-author_contributor_facet', text: 'Author or Contributor')
        expect(page).to have_css('.blacklight-meeting_facet', text: 'Meeting or Event')
        expect(page).to have_css('.blacklight-title_series_facet', text: 'Title or Series')
        expect(page).to have_css('.blacklight-genre_facet', text: 'Genre')
        expect(page).to have_css('.blacklight-topic_facet', text: 'Subject - Topic')
        expect(page).to have_css('.blacklight-region_facet', text: 'Subject - Region')
        expect(page).to have_css('.blacklight-era_facet', text: 'Subject - Era')
        expect(page).to have_css('.blacklight-games_duration_facet', text: 'Games - Duration')
        expect(page).to have_css('.blacklight-games_players_facet', text: 'Games - Number of Players')
        expect(page).to have_css('.blacklight-games_ages_facet', text: 'Games - Recommended Age')
      end
    end
  end

  context 'Show page facets' do
    before do
      visit solr_document_path 'b4371446'
    end

    it 'do not exist' do
      expect(page).to_not have_css('#facets')
    end
  end
end
