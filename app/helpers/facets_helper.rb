# frozen_string_literal: true

module FacetsHelper
  include Blacklight::FacetsHelperBehavior

  ##
  # Overrides default Blacklight implementation
  # Renders the list of values
  # removes any elements where render_facet_item returns a nil value. This enables an application
  # to filter undesireable facet items so they don't appear in the UI
  def render_facet_limit_list(paginator, facet_field, options = nil)
    safe_join(paginator.items.map do |item|
      render_facet_item(facet_field, item)
    end.compact.map do |item|
      link_to(item[:rendered_element],
             item[:path],
             class: "#{item[:selected] ? 'selected ' : ''}list-group-item list-group-item-action facet-values-item")
    end)
  end

  ##
  # Overrides default Blacklight implementation
  # Renders a single facet item
  def render_facet_item(facet_field, item)
    if facet_in_params?(facet_field, item.value)
      render_selected_facet_value(facet_field, item)
    else
      render_facet_value(facet_field, item)
    end
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
    {
      :rendered_element => content_tag(:span, facet_display_value(facet_field, item), class: "facet-select facet-label") + render_facet_count(item.hits),
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

    rendered_element = content_tag(:span, class: "selected facet-label") do
      concat(facet_display_value(facet_field, item))
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
    content_tag("span", t('blacklight.search.facets.count', number: number_with_delimiter(num)), class: classes)
  end

end