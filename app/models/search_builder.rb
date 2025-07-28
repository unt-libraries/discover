# frozen_string_literal: true

class SearchBuilder < Blacklight::SearchBuilder
  include Blacklight::Solr::SearchBuilderBehavior
  include BlacklightRangeLimit::RangeLimitBuilder

  self.default_processor_chain += [
    :lucene_deftype,
    :only_home_facets,
    :advanced_search_facets,
    :modify_numbers_field_query,
    :limit_facet_fields_to_current_facet,
  ]

  # For debugging purposes, we can add a JSON payload to the response
  def add_json_payload_to_response
    solr_parameters[:debug] = 'timing'
  end

  # Fielded searches require defType=lucene, so we set it here and change it later if necessary
  def lucene_deftype(solr_parameters)
    return if blacklight_params[:q].nil?

    solr_parameters[:defType] = 'lucene'
  end

  # Only return facets that are configured to be shown on the home page
  def only_home_facets(solr_parameters)
    return unless homepage?
    solr_parameters['facet.method'] = 'enum'
    solr_parameters.delete('stats')
    solr_parameters.delete('stats.field')
    solr_parameters.delete('facet.threads')
    solr_parameters.delete('defType')
    solr_parameters['facet.field'] = blacklight_config.facet_fields.select { |_, v| v[:home] && v[:query].blank? }.keys
    # Filter query values that belong on the home page and assign filter.query
    has_query = blacklight_config.facet_fields.select { |_, v| v[:home] && v[:query].present? }.values
    solr_parameters['facet.query'] = has_query.map { |val| val.query.values.map { |v| v[:fq] } }.flatten
    solr_parameters['facet.pivot'] = []
  end

  # Configure facets for the advanced search form display
  def advanced_search_facets(solr_parameters)
    return unless advanced_search_form_page?

    # Get the list of facets that should be included in advanced search
    advanced_facets = if blacklight_config.advanced_search[:solr_parameters] && blacklight_config.advanced_search[:solr_parameters]['facet.field']
      blacklight_config.advanced_search[:solr_parameters]['facet.field']
    else
      # Fallback to facets configured with include_in_advanced_search != false
      blacklight_config.facet_fields.select { |_, config| config.fetch(:include_in_advanced_search, true) }.keys
    end

    # Apply the form_solr_parameters configuration from the catalog controller
    if blacklight_config.advanced_search[:solr_parameters]
      blacklight_config.advanced_search[:solr_parameters].each do |key, value|
        solr_parameters[key] = value
      end
    end

    # Remove facet parameters for fields not in advanced search
    solr_parameters.keys.select { |key| key.start_with?('f.') }.each do |key|
      # Extract field name from parameter like "f.field_name.facet.limit"
      field_name = key.match(/^f\.([^.]+)\./)[1] rescue nil
      if field_name && !advanced_facets.include?(field_name)
        solr_parameters.delete(key)
      end
    end

    # Ensure only advanced facets are in facet.field
    solr_parameters['facet.field'] = advanced_facets

    solr_parameters['facet.method'] = 'enum'
    solr_parameters['rows'] = 0
    solr_parameters.delete('stats')
    solr_parameters.delete('stats.field')
    solr_parameters.delete('facet.threads')
  end

  # Modify the query to be more suitable for solr when searching number fields
  def modify_numbers_field_query(solr_parameters)
    return unless solr_parameters[:qt] == 'catalog-numtype-search'
    matches = /^(?<query_type>{.*})(?<query>.*)$/.match(solr_parameters[:q])
    if matches.present? && matches[:query_type].present?
      solr_parameters[:q] = %Q(#{matches[:query_type]}"#{matches[:query].gsub!(/^["'‘’“”]*(.*?)["'‘’“”]*$/, '\1')}")
    end
  end

  # When on a facet "more" page, remove all other facet fields from the request
  def limit_facet_fields_to_current_facet(solr_parameters)
    return unless facet_page?

    current_facet_field = blacklight_params[:id]
    return if current_facet_field.blank?

    # Remove parameters for other facets - fixed implementation
    solr_parameters.keys.each do |key|
      if key.start_with?('f.') && !key.start_with?("f.#{current_facet_field}.")
        solr_parameters.delete(key)
      end
    end

    # Remove general facet parameters that are not needed
    solr_parameters.delete('facet.field')
    solr_parameters.delete('facet.query')
    solr_parameters.delete('facet.pivot')
    solr_parameters.delete('stats')
    solr_parameters.delete('stats.field')

    # Set the facet.field to only the current facet
    solr_parameters['facet.field'] = [current_facet_field]
  end

  # TODO: This is a starting point for the left anchored facet suggestion
  # def add_anchored_facet_suggestion_parameters(solr_params)
  #   return if facet.blank? || facet_suggestion_query.blank?
  #
  #   solr_params[:'facet.prefix'] = facet_suggestion_query[0..50]
  #   solr_params[:'facet.prefix.ignoreCase'] = true
  # end

  private

  # ============================================================================
  # VIEW CONTEXT DETECTION
  # ============================================================================

  def homepage?
    # current_action_context == 'index' && !search_parameters? && !advanced_search_page? && !blacklight_params[:f].present?
    controller_action == 'index' && !has_search_parameters?
  end

  ##
  # Check if we're on search results page
  # @return [Boolean]
  def search_results_page?
    controller_action == 'index' && has_search_parameters?
  end

  ##
  # Check if we're on a document show page
  # @return [Boolean]
  def show_page?
    controller_action == 'show'
  end

  ##
  # Check if we're on the advanced search form page
  # @return [Boolean]
  def advanced_search_form_page?
    controller_action == 'advanced_search'
  end

  ##
  # Check if we're on a facet "more" page
  # @return [Boolean]
  def facet_page?
    controller_action == 'facet'
  end

  # ============================================================================
  # SEARCH TYPE DETECTION
  # ============================================================================

  ##
  # Check if this is an advanced search (has clause parameters)
  # @return [Boolean]
  def advanced_search?
    # BL8 uses clause-based parameters for advanced search
    blacklight_params[:clause].present? ||
      blacklight_params[:advanced_type] == 'advanced'
  end

  ##
  # Check if this is a simple search (has q parameter but no clause)
  # @return [Boolean]
  def simple_search?
    blacklight_params[:q].present? && !advanced_search?
  end

  ##
  # Check if this is a faceted search (has facet constraints)
  # @return [Boolean]
  def faceted_search?
    blacklight_params[:f].present? ||
      blacklight_params[:f_inclusive].present? ||
      blacklight_params[:range].present?
  end

  ##
  # Check if any search parameters are present
  # @return [Boolean]
  def has_search_parameters?
    simple_search? || advanced_search? || faceted_search?
  end

  # ============================================================================
  # UTILITY METHODS
  # ============================================================================

  ##
  # Get the current controller action
  # @return [String]
  def controller_action
    search_state.controller.try(:params).try(:[], :action) ||
      blacklight_params[:action] ||
      'index'
  end
end
