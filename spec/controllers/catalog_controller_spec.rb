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

  describe 'blacklight configurations' do
    let(:config) { controller.blacklight_config }

    it 'sets default Solr parameters' do
      expect(config.default_solr_params[:qt]).to eq('catalog-search')
      expect(config.default_solr_params[:fq]).to include('suppressed:false')
      expect(config.default_solr_params[:'facet.threads']).to eq(20)
    end

    it 'sets per_page options' do
      expect(config.per_page).to eq([10, 20, 50, 100])
      expect(config.default_per_page).to eq(50)
      expect(config.max_per_page).to eq(100)
    end

    it 'configures document retrieval path and ID' do
      expect(config.document_solr_path).to eq('get-discover')
      expect(config.document_unique_id_param).to eq(:id)
    end

    it 'configures index view settings' do
      expect(config.index.title_field).to eq('title_display')
      expect(config.index.display_type_field).to eq('resource_type')
    end

    it 'configures show view settings' do
      expect(config.show.title_field).to eq('title_display')
      expect(config.show.display_type_field).to eq('resource_type')
    end

    it 'configures advanced search settings' do
      expect(config.advanced_search.qt).to eq('catalog-search')
      expect(config.advanced_search.url_key).to eq('advanced')
      expect(config.advanced_search.query_parser).to eq('dismax')
      expect(config.advanced_search.form_solr_parameters['facet.field']).to include('access_facet', 'resource_type_facet')
    end

    describe 'facet fields' do
      it 'configures "access_facet"' do
        facet_config = config.facet_fields['access_facet']
        expect(facet_config.label).to eq('Access')
        expect(facet_config.home).to be true
        expect(facet_config.collapse).to be false
        expect(facet_config.group).to eq('priority')
      end

      it 'configures "publication_year_range_facet" as a range facet' do
        facet_config = config.facet_fields['publication_year_range_facet']
        expect(facet_config.label).to eq('Date')
        expect(facet_config.range).to be_a(Hash)
        expect(facet_config.range[:maxlength]).to eq(4)
        expect(facet_config.group).to eq('date')
      end

      it 'configures "newly_added_facet" as a query facet' do
        facet_config = config.facet_fields['newly_added_facet']
        expect(facet_config.label).to eq('Newly Added')
        expect(facet_config.query).to be_a(Hash)
        expect(facet_config.query.keys).to include('weeks_1')
        expect(facet_config.query['weeks_1'][:label]).to eq('Within the last week')
        expect(facet_config.group).to eq('date')
      end
    end

    describe 'search fields' do
      it 'configures "text" (All Fields) search field' do
        search_field = config.search_fields['text']
        expect(search_field.label).to eq('All Fields')
        expect(search_field.solr_local_parameters[:type]).to eq('dismax')
      end

      it 'configures "title" search field' do
        search_field = config.search_fields['title']
        expect(search_field.solr_local_parameters[:qf]).to eq('$title_qf')
        expect(search_field.solr_parameters).to include(:'spellcheck.dictionary' => 'default')
      end

      it 'configures "call_number" search field' do
        search_field = config.search_fields['call_number']
        expect(search_field.label).to eq('Call Number') # Default label if not specified, or actual if specified
        expect(search_field.qt).to eq('catalog-numtype-search')
        expect(search_field.include_in_advanced_search).to be false
      end
    end

    describe 'sort fields' do
      it 'configures "Relevance" sort' do
        sort_field = config.sort_fields['score desc, title_sort asc']
        expect(sort_field.label).to eq('Relevance')
      end

      it 'configures "Publication Year (Newest)" sort' do
        sort_field = config.sort_fields['publication_sort desc, title_sort asc']
        expect(sort_field.label).to eq('Publication Year (Newest)')
      end

      it 'configures "New to the Libraries" sort' do
        sort_field = config.sort_fields['date_added desc, title_sort asc']
        expect(sort_field.label).to eq('New to the Libraries')
      end
    end
  end

  describe 'error handling for BlacklightRangeLimit::InvalidRange' do
    let(:repository_double) { instance_double(Blacklight::Solr::Repository) }

    before do
      allow(controller.blacklight_config).to receive(:repository).and_return(repository_double)
      allow(repository_double).to receive(:search).and_raise(BlacklightRangeLimit::InvalidRange)

      allow(controller).to receive(:current_search_session).and_return(nil)
      allow(controller).to receive(:set_current_search_session)
    end

    it 'redirects to root with a flash error when range parameters are invalid' do
      invalid_range_params = {
        range: {
          'publication_year_range_facet' => { 'begin' => '2000', 'end' => '1990' }
        }
      }
      get :index, params: invalid_range_params

      expect(response).to redirect_to('/')
      expect(flash[:error]).to eq('The start year must be before the end year.')
    end
  end

  describe 'view configuration' do
    let(:config) { controller.blacklight_config }

    it 'configures results collection tools' do
      expect(config.index.collection_actions).to have_key(:sort_widget)
      expect(config.index.collection_actions).to have_key(:view_type_group)
      expect(config.index.collection_actions).not_to have_key(:per_page_widget)
    end

    it 'configures nav actions' do
      expect(config.navbar.partials).to include(:bookmark, :search_history)
    end
  end

  describe 'index field configuration' do
    let(:config) { controller.blacklight_config }

    it 'configures badge fields' do
      field = config.index_fields['date_added']
      expect(field.display).to eq(:badges)
      expect(field.no_label).to be true
    end

    it 'configures author fields with facet linking' do
      field = config.index_fields['author_json']
      expect(field.link_to_facet).to eq('author_contributor_facet')
    end

    it 'configures resource type field' do
      field = config.index_fields['resource_type']
      expect(field.display).to eq(:resource_type)
      expect(field.accessor).to eq('resource_type_name')
    end

    it 'configures publication statements' do
      field = config.index_fields['publication_display']
      expect(field.display).to eq(:pub_statements)
      expect(field.tooltip).to include('Statement')
    end

    it 'configures availability field' do
      field = config.index_fields['items_json']
      expect(field.display).to eq(:availability)
    end
  end

  describe 'show field configuration' do
    let(:config) { controller.blacklight_config }

    it 'configures serial holdings field' do
      field = config.show_fields['library_has_display']
      expect(field.label).to eq('Serial Holdings')
      expect(field.display).to eq(:priority)
    end

    it 'configures links and media fields' do
      field = config.show_fields['urls_json']
      expect(field.helper_method).to eq(:links_media_urls)
      expect(field.display).to eq(:links_media)
    end

    it 'configures subject fields' do
      field = config.show_fields['subject_headings_json']
      expect(field.accessor).to eq('json_str_to_array')
      expect(field.helper_method).to eq(:sub_gen_json_to_links)
      expect(field.link_to_facet).to eq(:subject_heading_facet)
    end

    it 'configures linkify-text fields' do
      field = config.show_fields['summary_notes']
      expect(field.classes).to eq('linkify-text')
    end
  end

  describe 'GET #show' do
    render_views

    let(:doc_id) { 'b4371446' }
    let(:document_fixture_path) { Rails.root.join('spec', 'fixtures', 'solr_documents', "#{doc_id}.yml") }

    let(:document_fixture_data) do
      data = YAML.load_file(document_fixture_path)['SolrDocument']
      data['title_display'] ||= data['full_title'] || data['main_title'] || "Test Title for #{doc_id}"
      data['id'] ||= doc_id
      data
    end

    let(:mock_solr_response) { instance_double("Blacklight::Solr::Response") }
    let(:solr_document_instance) { SolrDocument.new(document_fixture_data, mock_solr_response) }
    let(:mock_search_service) { instance_double("Blacklight::SearchService") }

    before do
      allow(mock_solr_response).to receive(:more_like).with(solr_document_instance).and_return([])
      allow(mock_solr_response).to receive_messages(
                                     documents: [solr_document_instance], # The document(s) contained in this response
                                     params: { q: "id:#{doc_id}" },       # Mocked request params from Solr
                                     total: 1,                            # Total documents found
                                     start: 0,                            # Starting offset
                                     rows: 10,                            # Rows per page (adjust if necessary)
                                     aggregations: {}                     # Facet data (empty for this test)
                                   )

      allow(controller).to receive(:search_service).and_return(mock_search_service)
      allow(mock_search_service).to receive(:fetch).with(doc_id).and_return([mock_solr_response, solr_document_instance])
    end

    context "when a document is found" do
      before do
        get :show, params: { id: doc_id }
      end

      it 'returns a successful response' do
        expect(response).to be_successful
        expect(response.status).to eq(200)
      end

      it 'assigns the document correctly, linked to the Solr response' do
        assigned_document = assigns(:document)
        expect(assigned_document).to eq(solr_document_instance)
        expect(assigned_document.response).to eq(mock_solr_response)

        expect(assigned_document['title_display']).not_to be_nil
        expect(assigned_document['title_display']).to eq(document_fixture_data['title_display'])
      end

      it 'assigns the Solr response correctly' do
        expect(assigns(:response)).to eq(mock_solr_response)
      end

      it 'renders the show template and required partials' do
        expect(response).to render_template(:show)
        expect(response).to render_template(partial: '_show_sidebar')
        expect(response).to render_template(partial: '_show_tools')
      end

      it 'renders document content in the template, including the title' do
        expect(response.body).to include(CGI.escapeHTML(solr_document_instance['title_display']))

        if document_fixture_data['resource_type']
          expect(response.body).to include(CGI.escapeHTML(document_fixture_data['resource_type']))
        end
        if document_fixture_data['id']
          expect(response.body).to include(document_fixture_data['id'])
        end
      end
    end

    context "when a document is not found" do
      let(:not_found_id) { "nonexistent_id" }

      before do
        allow(mock_search_service).to receive(:fetch).with(not_found_id).and_raise(Blacklight::Exceptions::RecordNotFound)
        get :show, params: { id: not_found_id }
      end

      it "redirects to the 404 page" do
        expect(response).to redirect_to(not_found_path)
        expect(flash[:alert]).to be_nil
      end
    end
  end
end
