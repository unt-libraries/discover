# frozen_string_literal: true

require 'rails_helper'

describe 'Header' do
  before do
    visit root_path
  end

  it 'renders top bar' do
    within('#topbar-wrapper') do
      expect(page).to have_link('University of North Texas', :href => 'https://www.unt.edu')
      expect(page).to have_link('MyUNT', :href => 'https://my.unt.edu/')
      expect(page).to have_link('Canvas', :href => 'https://canvas.unt.edu/')
      expect(page).to have_link('Student Email', :href => 'https://eagleconnect.unt.edu/')
      expect(page).to have_link('UNT Directory', :href => 'https://www.unt.edu/find-people-departments.html')
    end
  end

  it 'renders primary nav links' do
    within('#main-navbar-nav') do
      expect(page).to have_link('Home', :href => 'https://library.unt.edu/')
      expect(page).to have_css('div.mega-menu', :count => 6)
    end
  end
end
