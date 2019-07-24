# frozen_string_literal: true

module FacetsHelper
  include Blacklight::FacetsHelperBehavior

  ##
  # Overrides default Blacklight implementation
  # Standard display of a SELECTED facet value (e.g. without a link and with a remove button)
  # @see #render_facet_value
  # @param [Blacklight::Solr::Response::Facets::FacetField] facet_field
  # @param [String] item
  def render_selected_facet_value(facet_field, item)
    remove_href = search_action_path(search_state.remove_facet_params(facet_field, item))
    content_tag(:span, class: "facet-label") do
      content_tag(:span, facet_display_value(facet_field, item), class: "selected") +
          # remove link
          link_to(remove_href, class: "remove") do
            content_tag(:i, '', class: "fa fa-times-circle remove-icon",
                        "data-toggle" => "tooltip", "data-title" => "Remove facet")
          end
    end + render_facet_count(item.hits, classes: ["selected"])
  end

end