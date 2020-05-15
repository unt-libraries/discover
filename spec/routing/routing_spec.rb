# frozen_string_literal: true

require 'rails_helper'

describe 'Routing', type: :routing do
  it 'routes to page not found if path is completely invalid' do
    expect(get: 'b2444243').not_to be_routable
  end

  it '#index' do
    expect(get('/catalog')).to route_to('catalog#index')
  end

  it '#show' do
    expect(get('/catalog/b1003962')).to route_to('catalog#show', id: 'b1003962')
  end

  it '#availability' do
    expect(post('/availability/items')).to route_to('availability#items')
  end
end
