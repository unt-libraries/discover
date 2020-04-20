# frozen_string_literal: true

module CatalogHelper
  include Blacklight::CatalogHelperBehavior

  def links_media_urls(urls_json)
    field_data = urls_json[:value]
    contents = field_data.map do |item|
      json = JSON.parse item
      link_text = json['n'] || json['l'] || json['u']
      link_type = json['t']
      if link_type == 'fulltext'
        content_tag :div do
          fulltext_link(json)
        end
      else
        content_tag :div do
          link_to "#{link_text}", json['u'], class: "link-media-item #{link_type}",
                                             data: { "link-type": link_type }
        end
      end
    end
    content_tag 'span', contents.join(''), nil, false
  end

  def index_format_items(items_json)
    field_data = items_json[:value]
    contents = field_data.map do |item|
      json = JSON.parse item
      link_to "#{json['n']} (#{json['t']})", json['u']
    end
    content_tag 'span', contents.join('<br>'), nil, false
  end

  private

  def fulltext_link(item)
    link_text = item['n'] || item['l'] || item['u']
    link_type = item['t']
    find_it_img_el = content_tag :span, ' ', class: 'find-it-image'
    text_el = content_tag :span, link_text
    html_options = {
      class: "link-media-item #{link_type}",
      data: { "link-type": link_type },
    }
    link_to(item['u'], html_options) do
      concat(find_it_img_el)
      concat(text_el)
    end
  end

  def get_date_facet_display(value)
    value.split('|')[1]
  end

  def link_to_subject_search(data)
    field_data = data[:value]
    contents = field_data.map do |item|
      link_text = item
      content_tag :div do
        link_to "#{link_text}",
                search_catalog_url(
                  q: "#{link_text}",
                  search_field: 'subject'
                ), data: { "link-type": '' }
      end
    end
    content_tag 'span', contents.join(''), nil, false
  end
end
