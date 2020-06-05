# frozen_string_literal: true

class SearchBuilder < Blacklight::SearchBuilder
  include Blacklight::Solr::SearchBuilderBehavior
  include BlacklightAdvancedSearch::AdvancedSearchBuilder

  self.default_processor_chain += [:add_advanced_parse_q_to_solr, :add_advanced_search_to_solr]

  ##
  # @example Adding a new step to the processor chain
  #   self.default_processor_chain += [:add_custom_data_to_query]
  #
  #   def add_custom_data_to_query(solr_parameters)
  #     solr_parameters[:custom] = blacklight_params[:user_value]
  #   end

  self.default_processor_chain += [:filter_out_suppressed_records, :only_home_facets]

  def filter_out_suppressed_records(solr_parameters)
    solr_parameters[:fq] ||= []
    solr_parameters[:fq] << 'suppressed:false'
  end

  def only_home_facets(solr_parameters)
    return if search_parameters?
    solr_parameters['facet.field'] = ["access_facet", "resource_type_facet", "media_type_facet", "collection_facet"]
    solr_parameters['facet.pivot'] = []
  end

  ##
  # Check if any search parameters have been set
  # @return [Boolean]
  def search_parameters?
    !blacklight_params[:q].nil? || blacklight_params[:f].present? ||
      blacklight_params[:search_field] == 'advanced'
  end
end
