# frozen_string_literal: true
class SolrDocument
  include Blacklight::Solr::Document
      # The following shows how to setup this blacklight document to display marc documents
  extension_parameters[:marc_source_field] = :marc_display
  extension_parameters[:marc_format_type] = :marcxml
  use_extension( Blacklight::Solr::Document::Marc) do |document|
    document.key?( :mark_display )
  end
  
  field_semantics.merge!(    
                         :title => "title_display",
                         :author => "author_display",
                         :language => "language_facet",
                         :format => "format",
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

  def material_type_map
      {
          :p => { :name => 'Archival Collection', :icon => 'book' },
          :i => { :name => 'Book (Audio)', :icon => 'headphones' },
          :n => { :name => 'Book (Electronic)', :icon => 'tablet-android-alt' },
          :a => { :name => 'Book (Print)', :icon => 'book' },
          :m => { :name => 'Computer File', :icon => 'file' },
          :b => { :name => 'Database', :icon => 'database' },
          :o => { :name => 'Educational Kit', :icon => 'book' },
          :y => { :name => 'Journal (Online)', :icon => 'question' },
          :q => { :name => 'Journal (Print)', :icon => 'book-alt' },
          :t => { :name => 'Manuscript', :icon => 'question' },
          :e => { :name => 'Map', :icon => 'map' },
          :f => { :name => 'Map', :icon => 'map' },
          :j => { :name => 'Music (CD)', :icon => 'compact-disc' },
          :c => { :name => 'Music (Score)', :icon => 'music' },
          :d => { :name => 'Music (Score)', :icon => 'music' },
          :s => { :name => 'Music (Score), Theses and Dissertations', :icon => 'volume' },
          :r => { :name => 'Physical Object', :icon => 'question' },
          :k => { :name => 'Print Graphics', :icon => 'question' },
          :z => { :name => 'Theses and Dissertations', :icon => 'question' },
          :g => { :name => 'Video (DVD, VHS, Film)', :icon => 'film' }
      }
  end

  def format_name
    material_type_map.dig(self[:material_type].to_sym, :name)
  end

  def format_icon
    material_type_map.dig(self[:material_type].to_sym, :icon)
  end

  private

  def identifier_keys
    %w[
        isbn_numbers
        oclc_numbers
      ]
  end
end
