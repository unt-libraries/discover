require 'rails_helper'

RSpec.feature 'Document View Page', type: :feature do
  describe 'can be accessed from search results' do
    before do
      visit root_path

      within 'form.search-query-form' do
        fill_in 'q', with: 'Hamlet'
        click_button 'Search'
      end

      first('.document-title-heading a').click
    end

    it 'displays the document title in the header' do
      expect(page).to have_css('#document')
      expect(page).to have_css('.document-main-section')
      expect(page).to have_css('h1', text: /Hamlet/i)
      expect(page).to have_css('#show-links_media')
      expect(page).to have_css('.item-availability')
      expect(page).to have_css('.item-more_details')
      expect(page).to have_css('#sidebar')
      expect(page).to have_css('.thumbnail-wrapper')
      expect(page).to have_css('.show-tools')
    end
  end

  describe 'displays the content of a document' do
    before do
      visit solr_document_path('b4371446')
    end

    it 'has the correct structure' do
      expect(page).to have_css('#document')
      expect(page).to have_css('.document-main-section')
      expect(page).to have_css('#show-links_media')
      expect(page).to have_css('.item-availability')
      expect(page).to have_css('.item-more_details')
      expect(page).to have_css('#sidebar')
      expect(page).to have_css('.thumbnail-wrapper')
      expect(page).to have_css('.show-tools')
    end

    it 'accesses the the correct document' do
      expect(page).to have_css('#document[data-document-id="b4371446"]')
    end

    it 'shows the document title' do
      expect(page).to have_css('h1', text: /Testing/i)
    end
  end

  describe 'when the document does not exist' do
    before do
      visit solr_document_path('nonexistent-document-id')
    end

    it 'shows the 404 error page' do
      expect(current_path).to eq '/404'
      expect(page).to have_content('We couldn\'t find what you\'re looking for')
    end
  end
end
