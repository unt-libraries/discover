# frozen_string_literal: true

class SolrDocument
  include Blacklight::Solr::Document
  # The following shows how to setup this blacklight document to display marc documents
  extension_parameters[:marc_source_field] = :marc_display
  extension_parameters[:marc_format_type] = :marcxml
  use_extension(Blacklight::Solr::Document::Marc) do |document|
    document.key?(:mark_display)
  end

  field_semantics.merge!(
    :title => "title_display",
    :author => "author_display",
    :language => "language_facet",
    :resource_type => "resource_type",
    :identifier => "isbn_s"
  )

  # self.unique_key = 'id'

  # Email uses the semantic field mappings below to generate the body of an email.
  SolrDocument.use_extension(Blacklight::Document::Email)

  # SMS uses the semantic field mappings below to generate the body of an SMS email.
  SolrDocument.use_extension(Blacklight::Document::Sms)

  # DublinCore uses the semantic field mappings below to assemble an OAI-compliant Dublin Core document
  # Semantic mappings of solr stored fields. Fields may be multi or
  # single valued. See Blacklight::Document::SemanticFields#field_semantics
  # and Blacklight::Document::SemanticFields#to_semantic_values
  # Recommendation: Use field names from Dublin Core
  use_extension(Blacklight::Document::DublinCore)

  def identifier_data
    values = identifiers.each_with_object({}) do |identifier, hsh|
      hsh[identifier.data_key.to_sym] ||= []
      hsh[identifier.data_key.to_sym] << identifier.value
    end

    values[:'bib-id'] = id unless id.nil?
    values
  end

  def identifiers
    @identifiers ||= identifier_keys.flat_map do |key|
      fetch(key, []).map do |value|
        Identifier.new(key, value)
      end
    end.compact
  end

  # Shares overlap with /app/helpers/facets_helper.rb#resource_type_map
  def resource_type_map
    {
      :unknown => { :label => 'Unknown', :icon => 'question-square' },
      :book => { :label => 'Book', :icon => 'book' },
      :online_database => { :label => 'Online Database', :icon => 'database' },
      :music_score => { :label => 'Music Score', :icon => 'music' },
      :map => { :label => 'Map', :icon => 'map' },
      :video_film => { :label => 'Video/Film', :icon => 'film' },
      :audiobook => { :label => 'Audiobook', :icon => 'headphones' },
      :music_recording => { :label => 'Music Recording', :icon => 'music' },
      :print_graphic => { :label => 'Print Graphic', :icon => 'images' },
      :software => { :label => 'Software', :icon => 'file' },
      :video_game => { :label => 'Video Game', :icon => 'gamepad' },
      :eresource => { :label => 'E-Resource', :icon => '' },
      :ebook => { :label => 'E-Book', :icon => 'tablet-android-alt' },
      :educational_kit => { :label => 'Educational Kit', :icon => 'book' },
      :archival_collection => { :label => 'Archival Collection', :icon => 'book' },
      :print_journal => { :label => 'Print Journal/Periodical', :icon => 'book-alt' },
      :object_artifact => { :label => 'Object/Artifact', :icon => 'cube' },
      :tabletop_game => { :label => 'Tabletop Game', :icon => 'game-board' },
      :equipment => { :label => 'Equipment', :icon => 'cube' },
      :score_thesis => { :label => 'Music Score (Thesis/Dissertation)', :icon => 'volume' },
      :manuscript => { :label => 'Manuscript', :icon => 'scroll' },
      :ejournal => { :label => 'E-Journal', :icon => 'book-alt' },
      :thesis_dissertation => { :label => 'Theses/Dissertation', :icon => 'book' },
    }
  end

  def resource_type_name
    resource_type_map.dig(self[:resource_type].to_sym, :label)
  end

  def resource_type_icon
    resource_type_map.dig(self[:resource_type].to_sym, :icon)
  end

  ##
  # Converts a single JSON string from solr to Ruby hash
  # Used for single value fields
  # @param value [String] JSON string
  # @return [Hash] Ruby hash
  def json_str_to_hash(value)
    return if first(value).blank?
    JSON.parse(first(value)).with_indifferent_access
  end

  ##
  # Converts Array of JSON strings from solr to Ruby hashes
  # Used for multi-value fields
  # @param value [Array] Array of JSON strings
  # @return [Array] Array of Ruby hashes
  def json_str_to_array(value)
    return if self[value].blank?

    self[value].map do |item|
      JSON.parse(item).with_indifferent_access
    end
  end

  private

  def identifier_keys
    %w(
      isbn_numbers
      oclc_numbers
    )
  end
end
