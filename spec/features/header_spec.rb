# frozen_string_literal: true

require 'rails_helper'

describe 'Header' do
  before do
    visit root_path
  end

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
