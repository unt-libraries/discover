# frozen_string_literal: true

module AvailabilityHelper

  def document_availability_href(document)
    "#{solr_document_path document}#show-availability"
  end

  def document_availability_context_href(document, counter)
    "#{(document_link_params(document, {:counter => counter}))[:data][:"context-href"]}#show-availability"
  end

  def render_item_button(document, counter, item)
    avail_context_href = document_availability_context_href(document, counter)
    avail_url = document_availability_href(document)
    # <a style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis" data-context-href="<%= avail_context_href %>">
    if item['i'].blank?
      link_text = 'Contact the Service Desk'
    else
      link_text = render "shared/loading-spinner"
    end

    link_to avail_url, class: "availability-btn loading disabled", data: { "context-href": avail_context_href } do
      link_text
    end
  end

  def render_availability_text(item)
    element_text = "Ask at the service desk" if item['i'].blank?
    content_tag(:div, element_text,
                {
                  class: "availability-text #{'d-none' if item['i'].present?}",
                  data: { "item-location": item['l']},
                })
  end

  def render_call_number(item)
    content_tag(:span, item['c'],
                {
                  class: 'blacklight-call-number result__value flex-column text-center d-none tooltip-nolink',
                  data: {
                    "item-call-number": item['c'],
                    toggle: "tooltip",
                    title: "The call number of this item",
                  },
                })
  end

  def render_notes(item)
    return if item['n'].blank?
    content_tag(:span, "See full record for additional info.",
                { class: 'blacklight-notes result__value text-center' })
  end

  def render_more_available(document, counter)
    if document[:has_more_items]
      avail_context_href = document_availability_context_href(document, counter)
      avail_url = document_availability_href(document)
      content_tag(:div, "See full record for additional info.",
                  { class: 'more-items-available mx-auto'}) do
        link_to avail_url, class: "more-available", data: { "context-href": avail_context_href } do
          "More available"
        end
      end
    end
  end
end
