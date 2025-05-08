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
    within('footer .address') do
      expect(page).to have_link('', :count => 7)
    end
  end
end
