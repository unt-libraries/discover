# frozen_string_literal: true

module CatalogHelper
  include Blacklight::CatalogHelperBehavior

  def format_urls(urls_json)
    field_data = urls_json[:value]
    contents = field_data.map do |item|
      json = JSON.parse item
      link_to "#{json['n']}", json['u']
    end
    content_tag 'span', contents.join('<br>'), nil, false
  end

  def index_format_items(items_json)
    field_data = items_json[:value]
    contents = field_data.map do |item|
      json = JSON.parse item
      link_to "#{json['n']} (#{json['t']})", json['u']
    end
    content_tag 'span', contents.join('<br>'), nil, false
  end
end