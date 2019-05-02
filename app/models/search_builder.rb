# frozen_string_literal: true
class SearchBuilder < Blacklight::SearchBuilder
  include Blacklight::Solr::SearchBuilderBehavior

  ##
  # @example Adding a new step to the processor chain
  #   self.default_processor_chain += [:add_custom_data_to_query]
  #
  #   def add_custom_data_to_query(solr_parameters)
  #     solr_parameters[:custom] = blacklight_params[:user_value]
  #   end

  self.default_processor_chain += [:filter_out_suppressed_records]

  def filter_out_suppressed_records(solr_parameters)
    solr_parameters[:fq] ||= []
    solr_parameters[:fq] << 'suppressed:false'
  end
end
