require 'rails_helper'

RSpec.describe CatalogController, type: :controller do
  render_views

  describe 'GET #index' do
    let(:params) { { q: 'This is my search term', search_field: 'text' } }
    let(:search_fields) { { 'text' => Blacklight::Configuration::Field.new(label: 'All Fields') } }
    let(:blacklight_config) do
      Blacklight::Configuration.new.tap do |config|
        config.view_config = OpenStruct.new(document_index_view_type: OpenStruct.new(search_bar_component: nil))
        config.autocomplete_enabled = false
        config.enable_search_bar_autofocus = true
        config.advanced_search = OpenStruct.new(enabled: true)
        config.search_fields = search_fields
      end
    end
    let(:search_state) { Blacklight::SearchState.new(params, blacklight_config) }
    let(:mock_search_session) { instance_double('Search', id: 1) }
    let(:mock_search_builder) { instance_double('SearchBuilder') }
    let(:mock_response) do
      Blacklight::Solr::Response.new({ 'response' => { 'numFound' => 100, 'docs' => [] } }, {})
    end
    let(:mock_search_service) do
      instance_double('Blacklight::SearchService',
                      search_builder: mock_search_builder,
                      search_results: [mock_response, mock_response.documents])
    end

    before do
      allow(controller).to receive(:search_catalog_url).and_return('/catalog')
      allow(controller).to receive(:search_state).and_return(search_state)
      allow(controller).to receive(:blacklight_config).and_return(blacklight_config)

      allow(controller.view_context).to receive(:search_fields).and_return(search_fields)
      allow(controller.view_context).to receive(:blacklight_config).and_return(blacklight_config)

      # Stub Blacklight methods
      allow(controller).to receive(:current_search_session).and_return(mock_search_session)
      allow(controller).to receive(:set_current_search_session)
      allow(controller).to receive(:search_service).and_return(mock_search_service)

      # Ensure @response is set correctly for rendering
      controller.instance_variable_set(:@response, mock_response)

      # Additional stubs for search context and session management
      allow(blacklight_config).to receive(:facet_fields).and_return({})
      allow(controller).to receive(:facet_field_names).and_return([])

      get :index, params: params
    end

    it 'renders the search bar' do
      assert_template partial: 'catalog/_search_form'
      expect(response.body).to have_selector('form.search-query-form')
      expect(response.body).to have_field('q', with: 'This is my search term')
    end
  end

  describe 'GET #advanced' do
    let(:params) { { q: 'This is my search term', search_field: 'text' } }

    before do
      get :advanced_search, params: params
    end

    it 'renders the advanced search form' do
      assert_template 'catalog/_advanced_search_form'
      expect(response.body).to include(I18n.t('blacklight_advanced_search.form.title'))
    end
  end
end
