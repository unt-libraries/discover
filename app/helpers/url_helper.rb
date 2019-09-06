# frozen_string_literal: true

module UrlHelper
  # Override and extend Blacklight's URL Helper
  include Blacklight::UrlHelperBehavior
  ##
  # Link to the previous document in the current search context
  def link_to_previous_document(previous_document, opts = {})
    link_opts = session_tracking_params(previous_document, search_session['counter'].to_i - 1).merge(class: "previous", rel: 'prev')
    link_to_unless previous_document.nil?, raw(t('blacklight.search.entry_pagination_info.previous')), url_for_document(previous_document), link_opts do
      content_tag :span, raw(t('blacklight.search.entry_pagination_info.previous')), class: 'previous'
    end
  end

  ##
  # Link to the next document in the current search context
  def link_to_next_document(next_document)
    link_opts = session_tracking_params(next_document, search_session['counter'].to_i + 1).merge(class: "next", rel: 'next')
    link_to_unless next_document.nil?, raw(t('blacklight.search.entry_pagination_info.next')), url_for_document(next_document), link_opts do
      content_tag :span, raw(t('blacklight.search.entry_pagination_info.next')), class: 'next'
    end
  end
end