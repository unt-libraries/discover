# frozen_string_literal: true

module CatalogHelper
  include Blacklight::CatalogHelperBehavior

  def links_media_urls(urls_json)
    field_data = urls_json[:value]
    contents = field_data.map do |item|
      json = JSON.parse item
      link_text = json['n'] || json['l'] || json['u']
      link_type = json['t']
      if link_type == 'booking' && Rails.application.credentials[Rails.env.to_sym][:COVID_RESTRICTED]
        nil
      elsif link_type == 'fulltext'
        fulltext_link(json, {
          target: "_blank",
          rel: "noopener",
        })
      else
        link_text = link_text.html_safe if link_type == 'link'
        link_to link_text, json['u'], class: "link-media-item #{link_type}",
                                           target: "_blank",
                                           rel: "noopener",
                                           data: { "link-type": link_type }
      end
    end
    contents.join('').html_safe
  end

  def get_split_facet_display(value)
    value.split('!', 2).last
  end

  private

  def fulltext_link(item, opts = {})
    link_text = item['n'] || item['l'] || item['u']
    link_text = link_text.html_safe
    link_type = item['t']
    find_it_img_el = content_tag :span, ' ', class: 'find-it-image'
    text_el = content_tag :span, link_text
    html_options = {
      class: "link-media-item #{link_type}",
      data: { "link-type": link_type },
    }.merge(opts)
    link_to(item['u'], html_options) do
      concat(find_it_img_el)
      concat(text_el)
    end
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
