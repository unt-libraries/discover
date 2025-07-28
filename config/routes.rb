Rails.application.routes.draw do
  concern :range_searchable, BlacklightRangeLimit::Routes::RangeSearchable.new
  concern :marc_viewable, Blacklight::Marc::Routes::MarcViewable.new
  mount Blacklight::Engine => '/'

  root to: "catalog#index"
  concern :searchable, Blacklight::Routes::Searchable.new
  concern :range_searchable, BlacklightRangeLimit::Routes::RangeSearchable.new

  resource :catalog, only: [:index], as: 'catalog', path: '/catalog', controller: 'catalog' do
    concerns :searchable
    concerns :range_searchable

  end
  concern :exportable, Blacklight::Routes::Exportable.new

  # Redirect if the URL contains a bib ID from the old system
  get '/catalog/:id', to: redirect { |path_params, req| "/catalog/#{path_params[:id].match(/(b[0-9]{7,})~S[0-9]{1,2}/).captures[0]}" },
                      constraints: { id: /(b[0-9]{7,})~S[0-9]{1,2}/ }

  resources :solr_documents, only: [:show], path: '/catalog', controller: 'catalog' do
    concerns [:exportable, :marc_viewable]
  end

  resources :bookmarks do
    concerns :exportable

    collection do
      delete 'clear'
    end
  end
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  post '/availability/items', to: 'availability#items'

  get '/advanced', to: 'catalog#advanced_search'

  match "/404", :to => "errors#not_found", as: 'not_found', :via => :all
  match "/500", :to => "errors#internal_server_error", as: 'internal_server_error', :via => :all
end
