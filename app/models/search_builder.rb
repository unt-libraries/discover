# frozen_string_literal: true

class SearchBuilder < Blacklight::SearchBuilder
  include Blacklight::Solr::SearchBuilderBehavior
  include BlacklightRangeLimit::RangeLimitBuilder
  include BlacklightAdvancedSearch::AdvancedSearchBuilder

  self.default_processor_chain += [
    :add_advanced_parse_q_to_solr,
    :add_advanced_search_to_solr,
    :lucene_deftype,
    :advanced_query_page,
    :only_home_facets,
    :modify_numbers_field_query,
  ]

  # Fielded searches require defType=lucene, so we set it here and change it later if necessary
  def lucene_deftype(solr_parameters)
    return if blacklight_params[:q].nil?
    solr_parameters[:defType] = 'lucene'
  end

  def only_home_facets(solr_parameters)
    return if search_parameters?
    return if blacklight_params[:controller] == 'advanced'
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

  # Modify the advanced search form, before any searches have been performed
  def advanced_query_page(solr_parameters)
    return if blacklight_params[:controller] != 'advanced'
    return if search_parameters?
    solr_parameters['facet.method'] = 'enum'
    solr_parameters.delete('stats')
    solr_parameters.delete('stats.field')
    solr_parameters.delete('facet.threads')
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
