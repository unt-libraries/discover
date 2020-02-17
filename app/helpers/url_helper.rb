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

  def link_to_request_refworks(document)
    url = "http://export2refworks.library.unt.edu/processor_a.php?bib=#{document[:id]}"
    content_tag(:span, document[:full_title], class: 'sr-only')
    text = "Add #{content_tag(:span, document[:full_title], class: 'sr-only')} to Refworks".html_safe
    link_to text, url, class: "", target: "_blank"
  end

  def link_to_request_illiad(document)
    url = construct_illiad_url(document)
    content_tag(:span, document[:full_title], class: 'sr-only')
    text = "Request #{content_tag(:span, document[:full_title], class: 'sr-only')} through ILLiad".html_safe
    link_to text, url, class: "", target: "_blank"
  end

  def link_to_request_item(document, item=nil)
    id = document[:id]
    call_number = item['c']
    barcode = item['b']
    notes = item['n']
    requestability = item['r']

    case requestability
    when 'catalog'
      url = "https://iii.library.unt.edu/search~S12?/.#{id}/.#{id}/1%2C275%2C275%2CB/request~#{id}"
      text = "Request through Catalog"
      "<a href=\"#{url}\" target=\"_blank\">#{text}</a>".html_safe
    when 'jlf'
      url = construct_illiad_url(document, item)
      text = "Request through ILLiad"
      link_to text, url, class: "", target: "_blank"
    when 'aeon'
      'Request through Aeon (coming soon)'
    else
      'Not requestable'
    end
  end

  def construct_illiad_url(document, item=nil)
    # Construct URL for ILLiad and use gateway if an item is provided

    # Journals and e-journals are 'article', the rest are 'book'
    genre = (document[:material_type] == 'q' || document[:material_type] == 'y') ? 'article' : 'book'
    au = document[:creator] || document[:contributors][0] unless document[:contributors].nil? || nil
    notes = "Discover record: #{request.base_url}/catalog/#{document[:id]}"
    pub = if !document[:publication_display].nil?
            document[:publication_display].join('; ')
          elsif !document[:creation_display].nil?
            document[:creation_display].join('; ')
          elsif !document[:distribution_display].nil?
            document[:distribution_display].join('; ')
          elsif !document[:manufacture_display].nil?
            document[:manufacture_display].join('; ')
          end

    # Required parameters
    query_hash = {
        :sid => 'Discover Request',
        'rft.genre' => genre,
        'rft.au' => au,
        :notes => notes,
    }

    # Optional parameters
    query_hash['rft.title'] = document[:full_title] unless document[:full_title].nil?
    query_hash['rft.date'] = document[:publication_year_display] unless document[:publication_year_display].nil?
    query_hash['rft.edition'] = "" unless document[:edition].nil?
    query_hash['rft.isbn'] = document[:isbn_numbers][0] unless document[:isbn_numbers].nil?
    query_hash['rft.issn'] = document[:issn_numbers][0] unless document[:issn_numbers].nil?
    query_hash['rft.pub'] = pub unless pub.nil?

    if item.nil?
      query_hash[:Action] = '10'
      query_hash[:Form] = '30'
      URI::HTTPS.build(host: 'unt.illiad.oclc.org', path: '/illiad/illiad.dll', query: query_hash.to_query).to_s
    else
      URI::HTTPS.build(host: 'iii.library.unt.edu', path: '/screens/jlf-illiad-gateway.html', query: query_hash.to_query).to_s
    end
  end
end