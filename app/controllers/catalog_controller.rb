# frozen_string_literal: true
class CatalogController < ApplicationController

  include Blacklight::Catalog
  include Blacklight::Marc::Catalog


  def search_action_url options = {}
    options[:protocol] = request.headers['X-Forwarded-Proto'] or request.protocol
    super options
  end


  configure_blacklight do |config|
    ## Class for sending and receiving requests from a search index
    # config.repository_class = Blacklight::Solr::Repository
    #
    ## Class for converting Blacklight's url parameters to into request parameters for the search index
    # config.search_builder_class = ::SearchBuilder
    #
    ## Model that maps search index responses to the blacklight response model
    # config.response_model = Blacklight::Solr::Response
    #
    ## Should the raw solr document endpoint (e.g. /catalog/:id/raw) be enabled
    # config.raw_endpoint.enabled = false

    ## Default parameters to send to solr for all search-like requests. See also SearchBuilder#processed_parameters
    config.default_solr_params = {
      qt: 'catalog-search',
      rows: 10
    }

    # solr path which will be added to solr base url before the other solr params.
    #config.solr_path = 'select'
    #config.document_solr_path = 'get'

    # items to show per page, each number in the array represent another option to choose from.
    #config.per_page = [10,20,50,100]

    # solr field configuration for search results/index views
    config.index.title_field = 'full_title'
    config.index.display_type_field = 'material_type'
    #config.index.thumbnail_field = 'thumbnail_path_ss'

    config.add_results_document_tool(:bookmark, partial: 'bookmark_control', if: :render_bookmarks_control?)

    config.add_results_collection_tool(:sort_widget)
    config.add_results_collection_tool(:per_page_widget)
    config.add_results_collection_tool(:view_type_group)

    config.add_show_tools_partial(:bookmark, partial: 'bookmark_control', if: :render_bookmarks_control?)
    config.add_show_tools_partial(:email, callback: :email_action, validator: :validate_email_params)
    config.add_show_tools_partial(:sms, if: :render_sms_action?, callback: :sms_action, validator: :validate_sms_params)
    config.add_show_tools_partial(:citation)

    config.add_nav_action(:bookmark, partial: 'blacklight/nav/bookmark', if: :render_bookmarks_control?)
    config.add_nav_action(:search_history, partial: 'blacklight/nav/search_history')

    # solr field configuration for document/show views
    config.show.title_field = 'full_title'
    config.show.display_type_field = 'material_type'
    #config.show.thumbnail_field = 'thumbnail_path_ss'

    # solr fields that will be treated as facets by the blacklight application
    #   The ordering of the field names is the order of the display
    #
    # Setting a limit will trigger Blacklight's 'more' facet values link.
    # * If left unset, then all facet values returned by solr will be displayed.
    # * If set to an integer, then "f.somefield.facet.limit" will be added to
    # solr request, with actual solr request being +1 your configured limit --
    # you configure the number of items you actually want _displayed_ in a page.
    # * If set to 'true', then no additional parameters will be sent to solr,
    # but any 'sniffed' request limit parameters will be used for paging, with
    # paging at requested limit -1. Can sniff from facet.limit or
    # f.specific_field.facet.limit solr request params. This 'true' config
    # can be used if you set limits in :default_solr_params, or as defaults
    # on the solr side in the request handler itself. Request handler defaults
    # sniffing requires solr requests to be made with "echoParams=all", for
    # app code to actually have it echo'd back to see it.
    #
    # :show may be set to false if you don't want the facet to be drawn in the
    # facet bar
    #
    # set :index_range to true if you want the facet pagination view to have facet prefix-based navigation
    #  (useful when user clicks "more" on a large facet and wants to navigate alphabetically across a large set of results)
    # :index_range can be an array or range of prefixes that will be used to create the navigation (note: It is case sensitive when searching values)

    config.add_facet_field 'material_type', label: 'Material Type'
    config.add_facet_field 'publication_dates', label: 'Publication Year'
    config.add_facet_field 'genre_terms_facet', label: 'Genre'
    config.add_facet_field 'topic_terms_facet', label: 'Topic', limit: 20, index_range: 'A'..'Z'
    config.add_facet_field 'languages', label: 'Language', limit: true
    config.add_facet_field 'geographic_terms_facet', label: 'Region'
    config.add_facet_field 'era_terms_facet', label: 'Era'
    config.add_facet_field 'form_terms_facet', label: 'Form'
    config.add_facet_field 'people_facet', label: 'People', limit: 20
    config.add_facet_field 'corporations_facet', label: 'Corporations', limit: 20
    config.add_facet_field 'meetings_facet', label: 'Meetings', limit: 20

    # Have BL send all facet field names to Solr, which has been the default
    # previously. Simply remove these lines if you'd rather use Solr request
    # handler defaults, or have no facets.
    config.add_facet_fields_to_solr_request!

    # solr fields to be displayed in the index (search results) view
    #   The ordering of the field names is the order of the display
    config.add_index_field 'full_title', label: 'Title'
    config.add_index_field 'creator', label: 'Author/Creator'
    config.add_index_field 'contributors', label: 'Contributors'
    config.add_index_field 'material_type', label: 'Material Type'
    config.add_index_field 'languages', label: 'Languages'
    config.add_index_field 'publishers', label: 'Publisher'
    config.add_index_field 'publication_places', label: 'Publication Place'
    config.add_index_field 'publication_dates', label: 'Publication Date'
    config.add_index_field 'main_call_number', label: 'Call number'

    # solr fields to be displayed in the show (single result) view
    #   The ordering of the field names is the order of the display
    config.add_show_field 'full_title', label: 'Title'
    config.add_show_field 'creator', label: 'Author/Creator'
    config.add_show_field 'contributors', label: 'Contributors'
    config.add_show_field 'material_type', label: 'Material Type'
    config.add_show_field 'urls', label: 'URLs'
    # config.add_show_field 'url_suppl_display', label: 'More Information'
    config.add_show_field 'languages', label: 'Languages'
    config.add_show_field 'publishers', label: 'Publisher'
    config.add_show_field 'publication_places', label: 'Publication Place'
    config.add_show_field 'publication_dates', label: 'Publication Date'
    config.add_show_field 'main_call_number', label: 'Call number'
    config.add_show_field 'isbn_numbers', label: 'ISBN'

    # "fielded" search configuration. Used by pulldown among other places.
    # For supported keys in hash, see rdoc for Blacklight::SearchFields
    #
    # Search fields will inherit the :qt solr request handler from
    # config[:default_solr_parameters], OR can specify a different one
    # with a :qt key/value. Below examples inherit, except for subject
    # that specifies the same :qt as default for our own internal
    # testing purposes.
    #
    # The :key is what will be used to identify this BL search field internally,
    # as well as in URLs -- so changing it after deployment may break bookmarked
    # urls.  A display label will be automatically calculated from the :key,
    # or can be specified manually to be different.

    # This one uses all the defaults set by the solr request handler. Which
    # solr request handler? The one set in config[:default_solr_parameters][:qt],
    # since we aren't specifying it otherwise.

    config.add_search_field 'text', label: 'All Fields'


    # Now we see how to over-ride Solr request handler defaults, in this
    # case for a BL "search field", which is really a dismax aggregate
    # of Solr search fields.

    config.add_search_field('title') do |field|
      # solr_parameters hash are sent to Solr as ordinary url query params.
      field.solr_parameters = {
        'spellcheck.dictionary': 'title',
        qf: '${title_qf}',
        pf: '${title_pf}'
      }
    end

    config.add_search_field('Author/Creator') do |field|
      field.solr_parameters = { 'spellcheck.dictionary': 'creator' }
      field.solr_local_parameters = {
        qf: '${creator_qf}',
        pf: '${creator_pf}'
      }
    end

    config.add_search_field('subject') do |field|
      field.solr_parameters = { 'spellcheck.dictionary': 'subject' }
      field.solr_local_parameters = {
        qf: '${subject_qf}',
        pf: '${subject_pf}'
      }
    end

    # "sort results by" select (pulldown)
    # label in pulldown is followed by the name of the SOLR field to sort by and
    # whether the sort is ascending or descending (it must be asc or desc
    # except in the relevancy case).
    config.add_sort_field 'score desc, title_sort asc', label: 'relevance'
    config.add_sort_field 'publication_dates desc, title_sort asc', label: 'publication date'
    config.add_sort_field 'creator_sort asc, title_sort asc', label: 'creator'
    config.add_sort_field 'title_sort asc', label: 'title'

    # If there are more than this many search results, no spelling ("did you
    # mean") suggestion is offered.
    config.spell_max = 5

    # Configuration for autocomplete suggestor
    config.autocomplete_enabled = true
    config.autocomplete_path = 'suggest'
    # if the name of the solr.SuggestComponent provided in your solrcongig.xml is not the
    # default 'mySuggester', uncomment and provide it below
    # config.autocomplete_suggester = 'mySuggester'
  end
end
