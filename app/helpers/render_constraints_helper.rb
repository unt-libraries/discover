# This is necessary as of BL 7.38.0 and blacklight_advanced_search 7.0.0 to prevent
# search result constraints from being rendered twice.
# This overrides blacklight_advanced_search's override of the default behavior.
module RenderConstraintsHelper
  include BlacklightAdvancedSearch::RenderConstraintsOverride

  ##
  # Render the facet constraints
  # @deprecated
  # @param [Blacklight::SearchState,Hash] params_or_search_state query parameters
  # @return [String]
  def render_constraints_filters(params_or_search_state = search_state)
    Deprecation.warn(Blacklight::RenderConstraintsHelperBehavior, 'render_constraints_filters is deprecated')
    search_state = convert_to_search_state(params_or_search_state)

    return "".html_safe unless search_state.filters.any?

    Deprecation.silence(Blacklight::RenderConstraintsHelperBehavior) do
      safe_join(search_state.filters.map do |field|
        render_filter_element(field.key, field.values, search_state)
      end, "\n")
    end
  end
end
