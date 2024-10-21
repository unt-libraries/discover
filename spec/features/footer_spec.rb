# frozen_string_literal: true

require 'rails_helper'

describe 'Footer' do
  before do
    visit root_path
  end

  it 'renders' do
    expect(page).to have_css('div#main-footer', :text => 'University Libraries')
  end

  it 'contains contact information' do
    within('.footer__contact') do
      expect(page).to have_link('', :count => 5)
    end
  end
end
