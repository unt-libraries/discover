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
      :archive => { :label => 'Archival Collection', :icon => 'archive' },
      :audio_computer => { :label => 'Computer Audio File', :icon => 'computer-speaker' },
      :audio_music => {  :label => 'Music Recording', :icon => 'music' },
      :audio_music_cassette => { :label => 'Music Cassette', :icon => 'cassette-tape' },
      :audio_music_cd => {  :label => 'Music CD', :icon => 'compact-disc' },
      :audio_music_record => {  :label => 'Music Record', :icon => 'record-vinyl' },
      :audio_music_streaming => { :label => 'Streaming Music', :icon => 'cloud-music' },
      :audio_spoken => { :label => 'Audio Recording', :icon => 'microphone' },
      :audio_spoken_book => { :label => 'Audiobook', :icon => 'headphones' },
      :audio_spoken_cassette => { :label => 'Audio Cassette', :icon => 'cassette-tape' },
      :audio_spoken_cd => {  :label => 'Audio CD', :icon => 'compact-disc' },
      :audio_spoken_record => {  :label => 'Audio Record', :icon => 'record-vinyl' },
      :audio_spoken_streaming => { :label => 'Streaming Audio', :icon => 'cloud-music' },
      :book => { :label => 'Book', :icon => 'book' },
      :book_thesis => { :label => 'Thesis/Dissertation', :icon => 'book' },
      :database => {  :label => 'Online Database', :icon => 'database' },
      :document_computer => { :label => 'Digital File/Document', :icon => 'file' },
      :ebook => {  :label => 'E-Book', :icon => 'tablet-android-alt' },
      :ejournal => { :label => 'E-Journal', :icon => 'book-alt' },
      :equipment => { :label => 'Equipment', :icon => 'cube' },
      :film => { :label => 'Motion Picture', :icon => 'camera-movie' },
      :filmstrip => { :label => 'Filmstrip', :icon => 'film-alt' },
      :game_computer => { :label => 'Computer Game', :icon => 'gamepad' },
      :game_console => { :label => 'Console Game', :icon => 'gamepad' },
      :game_handheld => {  :label => 'Handheld Game', :icon => 'game-console-handheld' },
      :game_tabletop => {  :label => 'Tabletop Game', :icon => 'game-board' },
      :graphic => {  :label => 'Graphic', :icon => 'images' },
      :journal => {  :label => 'Journal/Periodical', :icon => 'book-alt' },
      :kit => { :label => 'Educational Kit', :icon => 'child' },
      :manuscript => {  :label => 'Manuscript', :icon => 'scroll' },
      :map => {  :label => 'Map', :icon => 'map' },
      :newspaper => { :label => 'Newspaper', :icon => 'newspaper' },
      :object => {  :label => 'Object/Artifact', :icon => 'cube' },
      :slide => {  :label => 'Slide', :icon => 'square' },
      :score => {  :label => 'Music Score', :icon => 'list-music' },
      :score_thesis => {  :label => 'Music Score, Thesis/Dissertation', :icon => 'volume' },
      :software => { :label => 'Computer Program', :icon => 'code' },
      :software_computer => {  :label => 'Computer Program', :icon => 'code' },
      :unknown => { :label => 'Unknown', :icon => 'question-square' },
      :video_bluray => { :label => 'Blu-ray Video', :icon => 'compact-disc' },
      :video_dvd => {  :label => 'DVD Video', :icon => 'compact-disc' },
      :video_film => { :label => 'Video/Film', :icon => 'film' },
      :video_laserdisc => {  :label => 'Laserdisc Video', :icon => 'compact-disc' },
      :video_music_dvd => {  :label => 'Music DVD Video', :icon => 'compact-disc' },
      :video_music_vhs => {  :label => 'Music VHS Video', :icon => 'vhs' },
      :video_streaming => {  :label => 'Streaming Video', :icon => 'video' },
      :video_vhs => {  :label => 'VHS Video', :icon => 'vhs' },
    }
  end

  def resource_type_name
    resource_type = self[:resource_type].split('!', 2)
    main_type = resource_type.first
    sub_type = resource_type[1]
    "#{resource_type_map.dig(main_type.to_sym, :label)}#{" (#{sub_type})" if sub_type.present?}"
  end

  def resource_type_icon
    resource_type = self[:resource_type].split('!', 2)
    resource_type_map.dig(resource_type.first.to_sym, :icon)
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
