# frozen_string_literal: true

class CatalogController < ApplicationController
  include BlacklightAdvancedSearch::Controller

  include Blacklight::Catalog
  include BlacklightRangeLimit::ControllerOverride

  include Blacklight::Marc::Catalog

  def search_action_url(options = {})
    options[:protocol] = request.headers['X-Forwarded-Proto'] || request.protocol
    super options
  end

  configure_blacklight do |config|
    # default advanced config values
    config.advanced_search ||= Blacklight::OpenStructWithHashAccess.new
    config.advanced_search[:qt] ||= 'catalog-search'
    config.advanced_search[:url_key] ||= 'advanced'
    config.advanced_search[:query_parser] ||= 'dismax'
    config.advanced_search[:form_solr_parameters] ||= {
      'facet.field' => %w(access_facet resource_type_facet media_type_facet languages collection_facet building_facet shelf_facet),
      'facet.limit' => -1,
      'facet.sort' => 'index',
      'f.access_facet.facet.limit' => -1,
      'f.resource_type_facet.facet.limit' => -1,
      'f.media_type_facet.facet.limit' => -1,
      'f.languages.facet.limit' => -1,
      'f.collection_facet.facet.limit' => -1,
      'f.building_facet.facet.limit' => -1,
      'f.shelf_facet.facet.limit' => -1,
      'facet.query' => [],
    }

    ## Class for sending and receiving requests from a search index
    # config.repository_class = Blacklight::Solr::Repository
    #
    ## Class for converting Blacklight url parameters to request parameters for the search index
    # config.search_builder_class = ::SearchBuilder
    #
    ## Model that maps search index responses to the blacklight response model
    # config.response_model = Blacklight::Solr::Response
    #
    ## Should the raw solr document endpoint (e.g. /catalog/:id/raw) be enabled
    # config.raw_endpoint.enabled = false

    ## Default parameters to send to solr for all search-like requests.
    ## See also SearchBuilder#processed_parameters
    config.default_solr_params = {
      qt: 'catalog-search',
      rows: 10,
    }

    # solr path which will be added to solr base url before the other solr params.
    # config.solr_path = 'select'
    # config.document_solr_path = 'get'

    # items to show per page, each number in the array represent another option to choose from.
    config.per_page = [10, 20, 50, 100]
    config.default_per_page = 50
    config.max_per_page = 100

    ##############################################
    # Configuration for search results/index views
    ##############################################

    # solr field configuration
    config.index.title_field = 'title_display'
    config.index.display_type_field = 'resource_type'
    # config.index.thumbnail_field = 'thumbnail_path_ss'

    config.add_results_document_tool(:bookmark, partial: 'bookmark_control',
                                                if: :render_bookmarks_control?)

    config.add_results_collection_tool(:sort_widget)
    # config.add_results_collection_tool(:per_page_widget)
    config.add_results_collection_tool(:view_type_group)

    config.add_show_tools_partial(:bookmark, partial: 'bookmark_control',
                                             if: :render_bookmarks_control?)
    config.add_show_tools_partial(:email, callback: :email_action,
                                          validator: :validate_email_params)
    config.add_show_tools_partial(:sms, if: :render_sms_action?, callback: :sms_action,
                                        validator: :validate_sms_params)
    # TODO: add citation functionality
    # config.add_show_tools_partial(:citation)
    config.show.document_actions.delete(:sms)
    config.show.document_actions.delete(:email)

    config.add_nav_action(:bookmark, partial: 'blacklight/nav/bookmark',
                                     if: :render_bookmarks_control?)
    config.add_nav_action(:search_history, partial: 'blacklight/nav/search_history')

    #######################################
    # Configuration for document/show views
    #######################################

    # solr field configuration for document/show views
    config.show.title_field = 'title_display'
    config.show.display_type_field = 'resource_type'
    # config.show.thumbnail_field = 'thumbnail_path_ss'

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
    # set :index_range to true if you want the facet pagination view to have facet prefix-based
    # navigation (useful when user clicks "more" on a large facet and wants to navigate
    # alphabetically across a large set of results) :index_range can be an array or range of
    # prefixes that will be used to create the navigation (note: It is case sensitive
    # when searching values)
    #
    # set `home` to true for it to appear on the home screen facets list. Default is false.
    # set `home_collapse` true to collapse on the home page, false to expand it. Default is true

    # Group priority
    config.add_facet_field 'access_facet', label: 'Access', home: true, home_collapse: false,
                                           collapse: false, sort: 'index', group: 'priority'
    config.add_facet_field 'resource_type_facet', label: 'Resource Type', home: true,
                                                  home_collapse: false, collapse: false,
                                                  sort: 'index',
                                                  helper_method: :resource_type_label,
                                                  group: 'priority'
    config.add_facet_field 'media_type_facet', label: 'Format or Media Type', home: true, group: 'priority',
                                               limit: 10

    # Group location
    config.add_facet_field 'collection_facet', label: 'Collection', home: true, limit: false,
                                               sort: 'index', group: 'location'
    config.add_facet_field 'building_facet', label: 'Building Location', limit: false,
                                             sort: 'index', group: 'location'
    config.add_facet_field 'shelf_facet', label: 'Shelf Location', limit: 10,
                                          sort: 'index', group: 'location'

    # Group date
    config.add_facet_field 'publication_year_range_facet', label: 'Publication Date',
                                                           range: {
                                                             assumed_boundaries: [1000, Time.now.year + 10],
                                                           }, group: 'date'
    config.add_facet_field 'newly_added_facet', label: 'Newly Added', home: true, :query => {
      :weeks_1 => { label: 'Within the last week', fq: "date_added:[NOW-7DAYS/DAY TO NOW/DAY]" },
      :weeks_2 => { label: 'Within the last 2 weeks', fq: "date_added:[NOW-14DAYS/DAY TO NOW/DAY]" },
      :weeks_3 => { label: 'Within the last 3 weeks', fq: "date_added:[NOW-21DAYS/DAY TO NOW/DAY]" },
      :months_1 => { label: 'Within the last month', fq: "date_added:[NOW-1MONTH/DAY TO NOW/DAY]" },
      :months_2 => { label: 'Within the last 2 months', fq: "date_added:[NOW-2MONTHS/DAY TO NOW/DAY]" },
      :months_3 => { label: 'Within the last 3 months', fq: "date_added:[NOW-3MONTHS/DAY TO NOW/DAY]" },
      :months_6 => { label: 'Within the last 6 months', fq: "date_added:[NOW-6MONTHS/DAY TO NOW/DAY]" },
    }, group: 'date'

    # Group language
    config.add_facet_field 'languages', label: 'Language', limit: 10, group: 'language'

    # Group publication
    config.add_facet_field 'author_contributor_facet', label: 'Author or Contributor', limit: 10,
                                                       helper_method: :get_split_facet_display,
                                                       index_range: 'a'..'z', group: 'publication'
    config.add_facet_field 'meeting_facet', label: 'Meeting or Event', limit: 10,
                                            helper_method: :get_split_facet_display,
                                            index_range: 'a'..'z', group: 'publication'
    config.add_facet_field 'title_series_facet', label: 'Title or Series', limit: 10, index_range: 'a'..'z',
                                                 helper_method: :get_split_facet_display,
                                                 group: 'publication'

    # Group subjects
    config.add_facet_field 'genre_facet', label: 'Genre', limit: 10,
                                          helper_method: :get_split_facet_display,
                                          index_range: 'a'..'z', group: 'subjects'
    config.add_facet_field 'topic_facet', label: 'Subject - Topic', limit: 10,
                                          helper_method: :get_split_facet_display,
                                          index_range: 'a'..'z', group: 'subjects'
    config.add_facet_field 'region_facet', label: 'Subject - Region', limit: 10,
                                           helper_method: :get_split_facet_display,
                                           index_range: 'a'..'z', group: 'subjects'
    config.add_facet_field 'era_facet', label: 'Subject - Era', limit: 10,
                                        helper_method: :get_split_facet_display,
                                        index_range: 'a'..'z', group: 'subjects'

    # Group game
    config.add_facet_field 'games_duration_facet', label: 'Games - Duration', sort: 'index',
                                                   helper_method: :get_split_facet_display,
                                                   group: 'game'
    config.add_facet_field 'games_players_facet', label: 'Games - Number of Players', sort: 'index',
                                                  helper_method: :get_split_facet_display,
                                                  group: 'game'
    config.add_facet_field 'games_ages_facet', label: 'Games - Recommended Age', sort: 'index',
                                               helper_method: :get_split_facet_display,
                                               group: 'game'

    # Hidden facets
    config.add_facet_field 'subject_heading_facet', label: 'Subject', show: false,
                                                    helper_method: :get_split_facet_display

    config.add_facet_field 'genre_heading_facet', label: 'Genre', show: false,
                                                  helper_method: :get_split_facet_display

    # Have BL send all facet field names to Solr, which has been the default
    # previously. Simply remove these lines if you'd rather use Solr request
    # handler defaults, or have no facets.
    config.add_facet_fields_to_solr_request!

    # solr fields to be displayed in the index (search results) view
    #   The ordering of the field names is the order of the display
    config.add_index_field 'author_json', label: 'Author/Creator', if: false,
                                          link_to_facet: 'author_contributor_facet'
    config.add_index_field 'contributors_json', label: 'Contributors', if: false,
                                                link_to_facet: 'author_contributor_facet'

    config.add_index_field 'resource_type', label: 'Resource Type', no_label: true,
                                            display: :resource_type, accessor: 'resource_type_name'

    # Publication-related statements
    config.add_index_field 'publication_display',
                           label: 'Publication', no_label: true, display: :pub_statements,
                           tooltip: 'Statement(s) about the publication, release, or '\
                             'issuing of the resource.'
    config.add_index_field 'distribution_display',
                           label: 'Distribution', no_label: true, display: :pub_statements,
                           tooltip: 'Statement(s) about the distribution of the resource.'
    config.add_index_field 'manufacture_display',
                           label: 'Printing', no_label: true, display: :pub_statements,
                           tooltip: 'Statement(s) about the printing, casting, or '\
                             'manufacture of the published resource.'
    config.add_index_field 'creation_display',
                           label: 'Creation', no_label: true, display: :pub_statements,
                           tooltip: 'Statement(s) about the creation or making of the original, '\
                             'unpublished version of the resource.'

    config.add_index_field 'publishers', label: 'Publisher',
                                         separator_options: { words_connector: '; ' },
                                         no_label: true
    config.add_index_field 'publication_places', label: 'Publication Place',
                                                 separator_options: { words_connector: '; ' },
                                                 no_label: true
    config.add_index_field 'publication_dates', label: 'Publication Date',
                                                separator_options: { words_connector: '; ' },
                                                no_label: true
    config.add_index_field 'sudocs_display', no_label: true, display: :control_numbers,
                                             label: 'SuDocs Numbers'
    config.add_index_field 'call_numbers_display', no_label: true, display: :control_numbers,
                                                   label: 'Call Numbers'
    config.add_index_field 'all_standard_numbers', no_label: true, display: :control_numbers,
                                                   label: 'All Standard Numbers'
    config.add_index_field 'all_control_numbers', no_label: true, display: :control_numbers,
                                                  label: 'All Control Numbers'
    config.add_index_field 'items_json', label: 'Items', display: :availability
    config.add_index_field 'has_more_items', if: false

    # solr fields to be displayed in the show (single result) view
    # The ordering of the field names is the order of the display
    # The :display property controls where in the template the field appears

    config.add_show_field 'resource_type', label: 'Resource Type', no_label: true,
                                           display: :priority, accessor: 'resource_type_name'

    # Publication-related statements
    config.add_show_field 'creation_display',
                          label: 'Creation', display: :priority,
                          tooltip: 'Statement(s) about the creation or making of the original, '\
                            'unpublished version of the resource.'
    config.add_show_field 'publication_display',
                          label: 'Publication', display: :priority,
                          tooltip: 'Statement(s) about the publication, release, or issuing of '\
                            'the resource.'
    config.add_show_field 'distribution_display',
                          label: 'Distribution', display: :priority,
                          tooltip: 'Statement(s) about the distribution of the resource.'
    config.add_show_field 'manufacture_display',
                          label: 'Printing', display: :priority,
                          tooltip: 'Statement(s) about the printing, casting, or manufacture of '\
                            'the published resource.'
    config.add_show_field 'copyright_display',
                          label: 'Copyright', display: :priority,
                          tooltip: 'Date that the resource was copyrighted.'

    # Links and media
    config.add_show_field 'urls_json', label: 'Links & Media', helper_method: :links_media_urls,
                                       display: :links_media

    # Availability
    config.add_show_field 'items_json', label: 'Items', display: :availability
    config.add_show_field 'has_more_items', if: false

    # TOC and Summary
    config.add_show_field 'toc_notes', label: 'Table of Contents'
    config.add_show_field 'summary_notes', label: 'Summary'

    config.add_show_field 'author_json', label: 'Author/Creator', accessor: 'json_str_to_hash',
                                         helper_method: :json_to_links,
                                         link_to_facet: 'author_contributor_facet'
    config.add_show_field 'contributors_json', label: 'Contributors', accessor: 'json_str_to_array',
                                               helper_method: :json_to_links,
                                               link_to_facet: 'author_contributor_facet'
    config.add_show_field 'meetings_json', label: 'Meetings', accessor: 'json_str_to_array',
                                           helper_method: :json_to_links,
                                           link_to_facet: 'meeting_facet'
    config.add_show_field 'series_creators', label: 'Series Creators',
                                             link_to_facet: 'public_author_facet'

    # Language Field
    config.add_show_field 'languages', label: 'Languages', link_to_facet: 'languages'
    config.add_show_field 'language_notes'

    # Title Fields
    config.add_show_field 'non_truncated_title_display', label: 'Full Title'
    config.add_show_field 'main_work_title_json', label: 'Main Work',
                                                  accessor: 'json_str_to_hash',
                                                  helper_method: :title_json_to_links,
                                                  link_to_facet: 'title_series_facet'
    config.add_show_field 'included_work_titles_json', label: 'Included Works',
                                                       accessor: 'json_str_to_array',
                                                       helper_method: :title_json_to_links,
                                                       link_to_facet: 'title_series_facet'
    config.add_show_field 'related_work_titles_json', label: 'Related Works',
                                                      accessor: 'json_str_to_array',
                                                      helper_method: :title_json_to_links,
                                                      link_to_facet: 'title_series_facet'
    config.add_show_field 'related_series_titles_json', label: 'Related Series',
                                                        accessor: 'json_str_to_array',
                                                        helper_method: :title_json_to_links,
                                                        link_to_facet: 'title_series_facet'
    config.add_show_field 'variant_titles_notes', label: 'Alternate Titles'

    # Publication Notes Fields
    config.add_show_field 'current_publication_frequency', label: 'Publication Frequency'
    config.add_show_field 'former_publication_frequency'
    config.add_show_field 'publication_date_notes'

    # Subject Search Fields
    config.add_show_field 'subject_headings_json', label: 'Subjects',
                                                   accessor: 'json_str_to_array',
                                                   helper_method: :json_to_links,
                                                   link_to_facet: :subject_heading_facet
    config.add_show_field 'genre_headings_json', label: 'Genres',
                                                 accessor: 'json_str_to_array',
                                                 helper_method: :json_to_links,
                                                 link_to_facet: :genre_heading_facet

    # Performance Fields
    config.add_show_field 'performers'
    config.add_show_field 'production_credits'
    config.add_show_field 'performance_medium'

    # Notes Fields
    config.add_show_field 'dissertation_notes'
    config.add_show_field 'notes', label: 'General Notes'

    # Physical Description Fields
    config.add_show_field 'physical_description'
    config.add_show_field 'physical_medium', label: 'Physical Characteristics',
                                             separator_options: {
                                               :words_connector => '; ',
                                               :two_words_connector => '; ',
                                               :last_word_connector => '; ',
                                             }
    config.add_show_field 'audio_characteristics', separator_options: {
      :words_connector => '; ',
      :two_words_connector => '; ',
      :last_word_connector => '; ',
    }
    config.add_show_field 'projection_characteristics', label: 'Film Characteristics',
                                                        separator_options: {
                                                          :words_connector => '; ',
                                                          :two_words_connector => '; ',
                                                          :last_word_connector => '; ',
                                                        }
    config.add_show_field 'video_characteristics', separator_options: {
      :words_connector => '; ',
      :two_words_connector => '; ',
      :last_word_connector => '; ',
    }
    config.add_show_field 'digital_file_characteristics', label: 'Digital Characteristics',
                                                          separator_options: {
                                                            :words_connector => '; ',
                                                            :two_words_connector => '; ',
                                                            :last_word_connector => '; ',
                                                          }
    config.add_show_field 'graphic_representation'
    config.add_show_field 'geospatial_data'

    # Call Number Fields
    config.add_show_field 'call_numbers_display', label: 'Call Numbers'
    config.add_show_field 'sudocs_display', label: 'SuDocs Numbers',
                                            tooltip: 'Government Document Classification Number'
    # Standard Number Fields
    config.add_show_field 'isbns_display', label: 'ISBNs'
    config.add_show_field 'issns_display', label: 'ISSNs'
    config.add_show_field 'other_standard_numbers_display', label: 'Other Standard Numbers'
    config.add_show_field 'lccns_display', label: 'Library of Congress Control Numbers'
    config.add_show_field 'oclc_numbers_display', label: 'OCLC Numbers'
    config.add_show_field 'other_control_numbers_display', label: 'Other Control Numbers'

    # Notes fields -- eventually we will have a lot more of these

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
      field.solr_parameters = { 'spellcheck.dictionary': 'default' }
      field.solr_local_parameters = {
        qf: '$title_qf',
        pf: '$title_pf',
      }
    end

    config.add_search_field('Author/Creator') do |field|
      field.solr_parameters = { 'spellcheck.dictionary': 'default' }
      field.solr_local_parameters = {
        qf: '$creator_qf',
        pf: '$creator_pf',
      }
    end

    config.add_search_field('subject') do |field|
      field.solr_parameters = { 'spellcheck.dictionary': 'default' }
      field.qt = 'catalog-search'
      field.solr_local_parameters = {
        qf: '$subject_qf',
        pf: '$subject_pf',
      }
    end

    config.add_search_field('genre') do |field|
      field.solr_parameters = { 'spellcheck.dictionary': 'default' }
      field.qt = 'catalog-search'
      field.solr_local_parameters = {
        qf: '$genre_qf',
        pf: '$genre_pf',
      }
    end

    config.add_search_field('call_number') do |field|
      field.qt = 'catalog-numtype-search'
      field.include_in_advanced_search = false
      field.solr_local_parameters = {
        df: 'call_numbers_search',
      }
    end

    config.add_search_field('sudoc') do |field|
      field.label = 'SuDocs'
      field.qt = 'catalog-numtype-search'
      field.include_in_advanced_search = false
      field.solr_local_parameters = {
        df: 'sudocs_search',
      }
    end

    config.add_search_field('standard_number') do |field|
      field.label = 'Standard # (ISBN/ISSN)'
      field.qt = 'catalog-numtype-search'
      field.include_in_advanced_search = false
      field.solr_local_parameters = {
        df: 'standard_numbers_search',
      }
    end

    config.add_search_field('control_number') do |field|
      field.label = 'Control # (LCCN/OCLC)'
      field.qt = 'catalog-numtype-search'
      field.include_in_advanced_search = false
      field.solr_local_parameters = {
        df: 'control_numbers_search',
      }
    end

    # "sort results by" select (pulldown)
    # label in pulldown is followed by the name of the SOLR field to sort by and
    # whether the sort is ascending or descending (it must be asc or desc
    # except in the relevancy case).
    config.add_sort_field 'score desc, title_sort asc', label: 'Relevance'
    config.add_sort_field 'publication_sort desc, title_sort asc', label: 'Publication Date'
    config.add_sort_field 'author_sort asc, title_sort asc', label: 'Author/Creator'
    config.add_sort_field 'title_sort asc', label: 'Title'
    config.add_sort_field 'date_added desc, title_sort asc', label: 'Newest to the Libraries'

    # If there are more than this many search results, no spelling ("did you
    # mean") suggestion is offered.
    config.spell_max = 5

    # Configuration for autocomplete suggestor
    config.autocomplete_enabled = false
    # config.autocomplete_path = 'suggest'
    # if the name of the solr.SuggestComponent provided in your solrcongig.xml is not the
    # default 'mySuggester', uncomment and provide it below
    # config.autocomplete_suggester = 'mySuggester'
  end
end
