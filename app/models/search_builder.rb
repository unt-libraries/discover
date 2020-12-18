# frozen_string_literal: true

class SearchBuilder < Blacklight::SearchBuilder
  include Blacklight::Solr::SearchBuilderBehavior
  include BlacklightRangeLimit::RangeLimitBuilder
  include BlacklightAdvancedSearch::AdvancedSearchBuilder

  self.default_processor_chain += [:add_advanced_parse_q_to_solr, :add_advanced_search_to_solr]

  ##
  # @example Adding a new step to the processor chain
  #   self.default_processor_chain += [:add_custom_data_to_query]
  #
  #   def add_custom_data_to_query(solr_parameters)
  #     solr_parameters[:custom] = blacklight_params[:user_value]
  #   end

  self.default_processor_chain += [
    :filter_out_suppressed_records,
    :only_home_facets,
    :modify_numbers_field_query,
  ]

  def filter_out_suppressed_records(solr_parameters)
    solr_parameters[:fq] ||= []
    solr_parameters[:fq] << 'suppressed:false'
  end

  def only_home_facets(solr_parameters)
    return if search_parameters?
    solr_parameters['facet.field'] = blacklight_config.facet_fields.select { |_, v| v[:home] && v[:query].blank? }.keys
    # Filter query values that belong on the home page and assign filter.query
    has_query = blacklight_config.facet_fields.select { |_, v| v[:home] && v[:query].present? }.values
    solr_parameters['facet.query'] = has_query.map { |val| val.query.values.map { |v| v[:fq] } }.flatten
    solr_parameters['facet.pivot'] = []
  end

  # Modify the query to be more suitable for solr when searching number fields
  def modify_numbers_field_query(solr_parameters)
    return if solr_parameters[:qt] != 'catalog-numtype-search'
    matches = /^(?<query_type>{.*})(?<query>.*)$/.match(solr_parameters[:q])
    if matches.present? && matches[:query_type].present?
      solr_parameters[:q] = %Q(#{matches[:query_type]}"#{matches[:query].gsub!(/^["'‘’“”]*(.*?)["'‘’“”]*$/, '\1')}")
    end
  end

  ##
  # Check if any search parameters have been set
  # @return [Boolean]
  def search_parameters?
    !blacklight_params[:q].nil? || blacklight_params[:f].present? ||
      blacklight_params[:search_field] == 'advanced'
  end
end
