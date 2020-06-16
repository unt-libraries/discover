# frozen_string_literal: true

module FacetsHelper
  include Blacklight::FacetsHelperBehavior

  ##
  # Render a collection of facet fields.
  # @see #render_facet_limit
  #
  # @param [Array<String>] fields
  # @param [Hash] options
  # @return String
  def render_home_facet_partials(fields = nil, options = {}) # rubocop:disable Airbnb/OptArgParameters
    response = options.delete(:response)
    safe_join(facets_from_request(fields, response).map do |display_facet|
      render_home_facet_limit(display_facet, options)
    end.compact, "\n")
  end

  ##
  # Renders a single section for facet limit with a specified
  # solr field used for faceting. Can be over-ridden for custom
  # display on a per-facet basis.
  #
  # @param [Blacklight::Solr::Response::Facets::FacetField] display_facet
  # @param [Hash] options parameters to use for rendering the facet limit partial
  # @option options [String] :partial partial to render
  # @option options [String] :layout partial layout to render
  # @option options [Hash] :locals locals to pass to the partial
  # @return [String]
  def render_home_facet_limit(display_facet, options = {})
    field_config = facet_configuration_for_field(display_facet.name)
    return unless field_config.home == true
    return unless should_render_facet?(display_facet, field_config)

    options = options.dup
    options[:partial] ||= facet_partial_name(display_facet)
    options[:layout] ||= "facet_layout" unless options.key?(:layout)
    options[:locals] ||= {}
    options[:locals][:field_name] ||= display_facet.name
    options[:locals][:facet_field] ||= field_config
    options[:locals][:display_facet] ||= display_facet
    options[:locals][:facet_field][:collapse] =
      field_config[:home_collapse].nil? ? true : field_config[:home_collapse]

    render(options)
  end

  ##
  # Overrides default Blacklight implementation
  # Renders the list of values
  # removes any elements where render_facet_item returns a nil value. This enables an application
  # to filter undesireable facet items so they don't appear in the UI
  def render_facet_limit_list(paginator, facet_field, options = nil) # rubocop:disable Airbnb/OptArgParameters
    safe_join(paginator.items.map do |item|
      render_facet_item(facet_field, item).merge({ :label => item.value })
    end.compact.map do |item|
      if item[:selected]
        ga_category = "facet removed - sidebar"
      else
        ga_category = "facet selected - #{has_search_parameters? ? 'results' : 'home'}"
      end
      link_to(item[:rendered_element],
              item[:path],
              class: "#{item[:selected] ? 'selected ' : ''}list-group-item "\
                "list-group-item-action facet-values-item",
              'ga-on': 'click',
              'ga-event-category': ga_category,
              'ga-event-action': facet_field,
              'ga-event-label': item[:label],
              'ga-event-value': '1')
    end)
  end

  ##
  # Overrides default Blacklight implementation
  # Standard display of a facet value in a list. Used in both _facets sidebar
  # partial and catalog/facet expanded list. Will output facet value name as
  # a link to add that to your restrictions, with count in parens.
  #
  # @param [Blacklight::Solr::Response::Facets::FacetField] facet_field
  # @param [Blacklight::Solr::Response::Facets::FacetItem] item
  # @param [Hash] options
  # @option options [Boolean] :suppress_link display the facet, but don't link to it
  # @return [Hash]
  def render_facet_value(facet_field, item, options = {})
    if facet_field == 'resource_type_facet'
      display_value = facet_display_value(facet_field, item)
      display_value = resource_type_facet_display_value(item.value) + ' ' + display_value
    else
      display_value = facet_display_value(facet_field, item)
    end

    {
      :rendered_element => content_tag(:span, display_value,
                                       class: "facet-select facet-label") +
        render_facet_count(item.hits),
      :path => path_for_facet(facet_field, item),
      :selected => false,
    }
  end

  ##
  # Overrides default Blacklight implementation
  # Standard display of a SELECTED facet value (e.g. without a link and with a remove button)
  # @see #render_facet_value
  # @param [Blacklight::Solr::Response::Facets::FacetField] facet_field
  # @param [String] item
  def render_selected_facet_value(facet_field, item)
    remove_href = search_action_path(search_state.remove_facet_params(facet_field, item))

    if facet_field == 'resource_type_facet'
      display_value = facet_display_value(facet_field, item)
      display_value = resource_type_facet_display_value(item.value) + ' ' + display_value
    else
      display_value = facet_display_value(facet_field, item)
    end

    rendered_element = content_tag(:span, class: "selected facet-label") do
      concat(display_value)
      # Remove icon
      concat(content_tag(:span, class: "remove") do
        content_tag(:i, '', class: "fa fa-times-circle remove-icon",
                            "data-toggle" => "tooltip", "data-title" => "Remove facet")
      end)
    end + render_facet_count(item.hits, classes: ["selected"])
    {
      :rendered_element => rendered_element,
      :path => remove_href,
      :selected => true,
    }
  end

  ##
  # Overrides default Blacklight implementation
  # Renders a count value for facet limits. Can be over-ridden locally
  # to change style. And can be called by plugins to get consistent display.
  #
  # @param [Integer] num number of facet results
  # @param [Hash] options
  # @option options [Array<String>]  an array of classes to add to count span.
  # @return [String]
  def render_facet_count(num, options = {})
    classes = (options[:classes] || []) << %w(facet-count badge)
    content_tag("span", t('blacklight.search.facets.count',
                          number: number_with_delimiter(num)), class: classes)
  end

  ##
  # Add icon for resource type facets
  #
  # @param [String] item
  # @return [String]
  def resource_type_facet_display_value(item)
    icon = resource_type_icon(item)
    content_tag(:i, '', class: "#{icon}-icon icon fa-fw fal fa-#{icon}")
  end

  def resource_type_icon(item)
    resource_type_map.dig(item.to_sym, :icon)
  end

  def resource_type_label(item)
    resource_type_map.dig(item.to_sym, :label)
  end

  # Shares some overlap with /app/models/solr_document.rb#resource_type_map
  def resource_type_map
    {
      :archives_manuscripts => { :label => 'Archives/<wbr>Manuscripts'.html_safe, :icon => 'archive' },
      :audio => { :label => 'Audio', :icon => 'headphones' },
      :books => { :label => 'Books', :icon => 'book' },
      :educational_kits => { :label => 'Educational Kits', :icon => 'child' },
      :equipment => { :label => 'Equipment', :icon => 'cube' },
      :games => { :label => 'Games', :icon => 'gamepad' },
      :images => { :label => 'Images', :icon => 'image' },
      :journals_periodicals => { :label => 'Journals/<wbr>Periodicals'.html_safe, :icon => 'book-alt' },
      :maps => { :label => 'Maps', :icon => 'map' },
      :music_recordings => { :label => 'Music Recordings', :icon => 'music' },
      :music_scores => { :label => 'Music Scores', :icon => 'list-music' },
      :newspapers => { :label => 'Newspapers', :icon => 'newspaper' },
      :objects_artifacts => { :label => 'Objects/<wbr>Artifacts'.html_safe, :icon => 'cube' },
      :online_databases => { :label => 'Online Databases', :icon => 'database' },
      :software => { :label => 'Software', :icon => 'code' },
      :spoken_recordings => { :label => 'Spoken Recordings', :icon => 'microphone' },
      :theses_dissertations => { :label => 'Theses/<wbr>Dissertations'.html_safe, :icon => 'book' },
      :video_film => { :label => 'Video/<wbr>Film'.html_safe, :icon => 'film' },
    }
  end
end
