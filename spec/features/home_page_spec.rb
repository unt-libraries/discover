# frozen_string_literal: true

require 'rails_helper'

describe 'Home page' do
  before do
    visit root_path
  end

  describe 'UNT header' do
    it 'renders' do
      within('div#head') do
        expect(page).to have_css('header.header', :text => 'University Libraries')
        expect(page).to have_link('University Libraries', :href => 'https://library.unt.edu')
      end
    end

    it 'contains UNT navigation' do
      expect(page).to have_css('nav#unt-desktop-links', :text => 'Home')
    end

    it 'has primary nav links' do
      within('div#primary-navigation') do
        expect(page).to have_link('Home', :href => 'https://library.unt.edu')
        expect(page).to have_css('li.nav-item', :count => 9)
      end
    end
  end

  describe 'UNT footer' do
    it 'renders' do
      expect(page).to have_css('footer#main-footer', :text => 'University Libraries')
    end

    it 'contains contact information' do
      within('.footer__contact') do
        expect(page).to have_link('', :count => 5)
      end
    end
  end

  describe 'sidebar' do
    it 'exists' do
      expect(page).to have_css('#facets')
    end

    it 'is not duplicated' do
      expect(page).to have_css('#facets', :maximum => 1)
    end

    it 'contains correct facets' do
      within('#facets') do
        expect(page).to have_css('.blacklight-access_facet', :text => 'Access')
        expect(page).to have_css('.blacklight-resource_type_facet', :text => 'Resource Type')
        expect(page).to have_css('.blacklight-collection_facet', :text => 'Collection')
      end
    end

    it 'does not contain all facets' do
      within('#facets') do
        expect(page).to have_css('.facet-limit', :minimum => 1)
        expect(page).to have_css('.facet-limit', :maximum => 5)
      end
    end
  end

  describe 'facet items' do
    it 'exist' do
      within('#facets') do
        expect(page).to have_css('.facet-values-item', :minimum => 2)
      end
    end

    it 'have labels' do
      within('#facets') do
        expect(page).to have_css('.facet-label', :text => 'Online')
      end
    end

    it 'have counts' do
      within('#facets') do
        expect(page).to have_css('.facet-count', :text => !' ')
      end
    end
  end

  describe 'search form' do
    it 'exists' do
      expect(page).to have_css('form.search-query-form')
    end

    it 'has form fields' do
      within('form.search-query-form') do
        expect(page).to have_field('q')
        expect(page).to have_field('search_field', :type => :hidden)
        expect(page).to have_button('search-fields')
        expect(page).to have_button('search')
      end
    end

    it 'performs a search' do
      within('form.search-query-form') do
        fill_in('q', :with => 'Hamlet')
        click_button('Search')
      end

      expect(page).to have_css('#documents')
      expect(page).to have_css('.document', :minimum => 10)
    end
  end
end
