# frozen_string_literal: true

module AvailabilityHelper
  def document_availability_href(document)
    "#{solr_document_path document}#show-availability"
  end

  def document_availability_context_href(document, counter)
    "#{document_link_params(document,
                            { :counter => counter })[:data][:"context-href"]}#show-availability"
  end

  def document_links_media_href(document)
    "#{solr_document_path document}#show-links_media"
  end

  def document_links_media_context_href(document, counter)
    "#{document_link_params(document,
                            { :counter => counter })[:data][:"context-href"]}#show-links_media"
  end

  def document_online_urls(document)
    if document[:urls_json].present?
      json = document[:urls_json].map { |item| JSON.parse(item) }
      urls = json.select { |item| item['t'] == 'fulltext' }
      return urls unless urls.empty?
    end
    false
  end

  def render_online_button(document, counter)
    online_items = document_online_urls(document)
    online_count = online_items.length
    if online_count > 1
      url = document_links_media_href(document)
      link_text = "#{online_count} Available Online"
    else
      url = online_items[0]['u']
      window_target = '_blank'
      link_text = 'FIND IT Online'
    end

    link_to url, class: "availability-btn online", target: window_target,
                 'ga-on': 'click',
                 'ga-event-category': 'List Item Link',
                 'ga-event-action': 'Availability button click',
                 'ga-event-label': link_text,
                 'ga-event-value': '1' do
      link_text
    end
  end

  def render_online_text(document)
    online_items = document_online_urls(document)
    online_count = online_items.length
    return unless online_count == 1
    online_item = online_items[0]
    if online_item['n'].present?
      element_text = online_item['n'].html_safe
      content_tag(:div, element_text)
    end
  end

  def render_item_button(document, counter, item)
    avail_context_href = document_availability_context_href(document, counter)
    avail_url = document_availability_href(document)

    if item['i'].blank?
      link_text = 'Contact the Service Desk'
    end

    link_to avail_url, class: "availability-btn disabled",
                       data: { "context-href": avail_context_href },
                       'ga-on': 'click',
                       'ga-event-category': 'List Item Link',
                       'ga-event-action': 'Availability button click',
                       'ga-event-label': link_text,
                       'ga-event-value': '1' do
      link_text
    end
  end

  def render_availability_text(item)
    element_text = item['i'].blank? ? "Ask at the service desk" : ''
    content_tag(:div, element_text,
                {
                  class: "availability-text #{'d-none' if item['i'].present?}",
                  data: { "item-location": item['l'] },
                })
  end

  def render_call_number(item, document: nil)
    content_tag(:span, item['c'],
                {
                  class: "blacklight-call-number result__value flex-column "\
                         "text-center tooltip-nolink",
                  data: {
                    "item-call-number": item['c'],
                    toggle: "tooltip",
                    title: "The call number of this item",
                  },
                })
  end

  def render_notes(document, items)
    notes = nil
    items.each do |item|
      if item['n'].present?
        notes = true
      end
    end
    if notes.present?
      link_to_document(document, 'See full record for additional info.',
                       { class: 'blacklight-notes result__value text-center' }
      )
    end
  end

  def all_items(items:, more_items: nil)
    # json_str_to_array(more_items).to_s
    more_items ||= []
    items + more_items
  end

  def render_more_available(document, counter)
    if document[:has_more_items]
      avail_context_href = document_availability_context_href(document, counter)
      avail_url = document_availability_href(document)
      content_tag(:div, "See full record for additional info.",
                  { class: 'more-items-available mx-auto' }) do
        link_to avail_url, class: "more-available", data: { "context-href": avail_context_href },
                           'ga-on': 'click',
                           'ga-event-category': 'List Item Link',
                           'ga-event-action': 'Availability button click',
                           'ga-event-label': 'More available',
                           'ga-event-value': '1' do
          "More available"
        end
      end
    end
  end

  def render_check_availability_btn(document, counter)
    avail_context_href = document_availability_context_href(document, counter)
    avail_url = document_availability_href(document)
    content_tag(:div,
                { class: 'no-items' }) do
      link_to avail_url, class: "check-availability d-none", data: { "context-href": avail_context_href },
                         'ga-on': 'click',
                         'ga-event-category': 'List Item Link',
                         'ga-event-action': 'Availability button click',
                         'ga-event-label': 'Check availability',
                         'ga-event-value': '1' do
        "Check availability"
      end
    end
  end
end
