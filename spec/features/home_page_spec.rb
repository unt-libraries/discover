# frozen_string_literal: true

require 'rails_helper'

describe 'Home page' do
  before do
    visit root_path
  end

  describe 'search form' do
    it 'exists' do
      expect(page).to have_css('form.search-query-form')
    end

    it 'has form fields' do
      within('form.search-query-form') do
        expect(page).to have_field('q')
        expect(page).to have_field('search_field', :type => :hidden)
        expect(page).to have_button('search-fields-toggle')
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
