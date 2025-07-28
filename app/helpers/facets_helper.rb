# frozen_string_literal: true

module FacetsHelper
  include Blacklight::FacetsHelperBehavior

  ##
  # Add icon for resource type facets
  #
  # @param [String] item
  # @return [String]
  def resource_type_facet_display_value(item)
    icon = resource_type_icon(item)
    content_tag(:i, '', class: "#{icon}-icon icon fal fa-#{icon}")
  end

  def resource_type_icon(item)
    resource_type_map.dig(item.to_sym, :icon)
  end

  def resource_type_label(item)
    label = if item.is_a?(String)
              item.to_sym
            elsif item.is_a?(Symbol)
              item
            else
              item.first.to_sym
            end

    resource_type_map[label][:label] if resource_type_map[label]
  end

  # Shares some overlap with /app/models/solr_document.rb#resource_type_map
  def resource_type_map
    {
      :archives_manuscripts => { :label => 'Archives/<wbr>Manuscripts'.html_safe, :icon => 'archive' },
      :audio => { :label => 'Audio', :icon => 'headphones' },
      :books => { :label => 'Books', :icon => 'book' },
      :educational_kits => { :label => 'Educational Kits', :icon => 'child' },
      :equipment => { :label => 'Equipment', :icon => 'cube' },
      :games => { :label => 'Games', :icon => 'gamepad' },
      :images => { :label => 'Images', :icon => 'image' },
      :journals_periodicals => { :label => 'Journals/<wbr>Periodicals'.html_safe, :icon => 'book-alt' },
      :maps => { :label => 'Maps', :icon => 'map' },
      :music_recordings => { :label => 'Music Recordings', :icon => 'music' },
      :music_scores => { :label => 'Music Scores', :icon => 'list-music' },
      :newspapers => { :label => 'Newspapers', :icon => 'newspaper' },
      :objects_artifacts => { :label => 'Objects/<wbr>Artifacts'.html_safe, :icon => 'cube' },
      :online_databases => { :label => 'Online Databases', :icon => 'database' },
      :software => { :label => 'Software', :icon => 'code' },
      :spoken_recordings => { :label => 'Spoken Recordings', :icon => 'microphone' },
      :theses_dissertations => { :label => 'Theses/<wbr>Dissertations'.html_safe, :icon => 'book' },
      :video_film => { :label => 'Video/<wbr>Film'.html_safe, :icon => 'film' },
    }
  end
end
