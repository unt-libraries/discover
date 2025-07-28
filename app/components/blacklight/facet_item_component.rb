# frozen_string_literal: true

module Blacklight
  class FacetItemComponent < Blacklight::Component
    attr_reader :label, :href, :hits

    with_collection_parameter :facet_item

    def initialize(facet_item:, wrapping_element: 'li', suppress_link: false)
      @facet_item = facet_item
      @label = facet_item.label
      @hits = facet_item.hits
      @href = facet_item.href
      @selected = facet_item.selected?
      @wrapping_element = wrapping_element
      @suppress_link = suppress_link
    end

    def call
      # if the downstream app has overridden the helper methods we'd usually call,
      # use the helpers to preserve compatibility
      content = if @selected
                  render_selected_facet_value
                else
                  render_facet_value
                end

      return '' if content.blank?
      return content unless @wrapping_element

      content_tag @wrapping_element, content
    end

    ##
    # Overrides default Blacklight implementation to wrap the facet in a classed anchor tag
    # Standard display of a facet value in a list. Used in both _facets sidebar
    # partial and catalog/facet expanded list. Will output facet value name as
    # a link to add that to your restrictions, with count in parens.
    #
    # @return [String]
    # @private
    def render_facet_value
      link_to(href, class: "facet-values-item list-group-item list-group-item-action", rel: "nofollow") do
        display_value = label

        if @facet_item.respond_to?(:facet_field) && @facet_item.facet_field == 'resource_type_facet' && @facet_item.respond_to?(:value)
          icon = helpers.resource_type_icon(@facet_item.value)
          display_value = helpers.content_tag(:i, '', class: "#{icon}-icon icon fal fa-#{icon}") + " " + display_value
        end

        tag.span(display_value, class: "facet-select facet-label") + render_facet_count
      end
    end

    ##
    # Overrides default Blacklight implementation to wrap the facet in a classed anchor tag
    # Standard display of a SELECTED facet value (e.g. without a link and with a remove button)
    # @see #render_facet_value
    #
    # @private
    def render_selected_facet_value
      # The entire item is a link that removes the facet filter.
      link_to(href, class: "selected list-group-item list-group-item-action facet-values-item", rel: "nofollow") do
        display_value = label

        if @facet_item.respond_to?(:facet_field) && @facet_item.facet_field == 'resource_type_facet' && @facet_item.respond_to?(:value)
          icon = helpers.resource_type_icon(@facet_item.value)
          # Assuming your helpers produce the correct icon HTML (i or svg tag).
          # The `+` here relies on Rails' SafeBuffer to correctly prepend the HTML tag to the string.
          icon_html = helpers.content_tag(:i, '', class: "#{icon}-icon icon fal fa-#{icon}")
          display_value = icon_html + " " + display_value
        end

        label_and_remove_icon = tag.span(class: 'selected facet-label') do
          remove_icon = tag.span(class: 'remove') do
            render(Blacklight::Icons::RemoveComponent.new) +
              tag.span(helpers.t(:'blacklight.search.facets.selected.remove'), class: 'sr-only visually-hidden')
          end

          safe_join([display_value, remove_icon], ' ')
        end

        facet_count = render_facet_count(classes: ['selected'])
        label_and_remove_icon + facet_count
      end
    end

    ##
    # Renders a count value for facet limits. Can be over-ridden locally
    # to change style. And can be called by plugins to get consistent display.
    #
    # @param [Hash] options
    # @option options [Array<String>]  an array of classes to add to count span.
    # @return [String]
    # @private
    def render_facet_count(options = {})
      return '' if hits.blank?

      classes = (options[:classes] || []) << "facet-count badge"
      tag.span(t('blacklight.search.facets.count', number: number_with_delimiter(hits)), class: classes)
    end
  end
end
