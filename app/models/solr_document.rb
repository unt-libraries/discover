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

  def format_icon
    material_type_icon_mapping[self[:material_type].to_sym]
  end

  def material_type_icon_mapping
    {
        :p => 'book', # Archival Collections
        :i => 'headphones', # Books (Audio)
        :n => 'tablet-android-alt', # Books (Electronic)
        :a => 'book', # Books (Print)
        :m => 'file', # Computer Files
        :b => 'database', # Databases
        :o => 'book', # Educational Kits
        :y => 'question', # Journals (Online)
        :q => 'book-alt', # Journals (Print)
        :t => 'question', # Manuscripts
        :e => 'map', # Maps
        :f => 'map', # Maps
        :j => 'compact-disc', # Music (CDs)
        :c => 'music', # Music (Scores)
        :d => 'music', # Music (Scores)
        :s => 'volume', # Music (Scores), Theses and Dissertations
        :r => 'question', # Physical Objects
        :k => 'question', # Print Graphics
        :z => 'question', # Theses and Dissertations
        :g => 'film', # Video (DVD, VHS, Film)
    }
  end

  private

  def identifier_keys
    %w[
        isbn_numbers
        oclc_numbers
      ]
  end
end
