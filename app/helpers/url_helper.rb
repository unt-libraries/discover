# frozen_string_literal: true

module UrlHelper
  # Override and extend Blacklight's URL Helper
  include Blacklight::UrlHelperBehavior
  ##
  # Link to the previous document in the current search context
  def link_to_previous_document(previous_document, opts = {})
    link_opts = session_tracking_params(previous_document, search_session['counter'].to_i - 1).
      merge(class: "previous", rel: 'prev').
      merge(opts)
    link_to_unless previous_document.nil?,
                   raw(t('blacklight.search.entry_pagination_info.previous')),
                   url_for_document(previous_document), link_opts do
      content_tag :span, raw(t('blacklight.search.entry_pagination_info.previous')), class: 'previous'
    end
  end

  ##
  # Link to the next document in the current search context
  def link_to_next_document(next_document, opts = {})
    link_opts = session_tracking_params(next_document, search_session['counter'].to_i + 1).
      merge(class: "next", rel: 'next').
      merge(opts)
    link_to_unless next_document.nil?, raw(t('blacklight.search.entry_pagination_info.next')), url_for_document(next_document), link_opts do
      content_tag :span, raw(t('blacklight.search.entry_pagination_info.next')), class: 'next'
    end
  end

  def link_to_old_catalog(document)
    record_id = document[:id]
    text = 'View in Old Catalog'
    catalog_url = 'https://iii.library.unt.edu/record='
    url = "#{catalog_url}#{record_id}"

    link_to text, url, class: 'nav-link', id: 'catalogLink', target: '_blank', rel: 'noopener'
  end

  def link_to_request_refworks(document)
    document ||= @document
    url = "http://export2refworks.library.unt.edu/processor_a.php?bib=#{document[:id]}"
    content_tag(:span, document[:full_title], class: 'sr-only')
    text = "Add #{content_tag(:span,
                              document[:full_title], class: 'sr-only')} to Refworks".html_safe
    link_to text, url, class: "nav-link", target: "_blank", rel: 'noopener'
  end

  def link_to_request_illiad(document)
    url = construct_illiad_url(document)
    content_tag(:span, document[:full_title], class: 'sr-only')
    text = "Request #{content_tag(:span, document[:full_title], class: 'sr-only')}" \
      "through ILLiad".html_safe
    link_to text, url, class: "nav-link", target: "_blank", rel: 'noopener'
  end

  def link_to_request_item(document, item: nil)
    id = document[:id]
    requestability = item['r']

    case requestability
    when 'catalog'
      url = "https://iii.library.unt.edu/search~S12?/.#{id}/.#{id}/1%2C275%2C275%2CB/request~#{id}"
      text = "Request through Catalog"
      link_to text, url, class: "request-catalog", target: "_blank", rel: 'noopener'
    when 'jlf'
      url = construct_illiad_url(document, item: item)
      text = "Request through ILLiad"
      link_to text, url, class: "request-illiad", target: "_blank", rel: 'noopener'
    when 'aeon'
      url = construct_aeon_url(document, item)
      text = "Request through Aeon"
      link_to text, url, class: "request-aeon", target: "_blank", rel: 'noopener'
    else
      'Cannot request this item'
    end
  end

  def construct_illiad_url(document, item: nil)
    # Construct URL for ILLiad and use gateway if an item is provided

    query_hash = {}

    # Add query string parameters unless values
    query_hash[:sid] = 'Discover Request'
    # Journals and e-journals are 'article', the rest are 'book'
    query_hash['rft.genre'] = (document[:material_type] == 'q' || document[:material_type] == 'y') ? 'article' : 'book'
    query_hash['rft.title'] = document[:full_title]
    query_hash['rft.au'] = document[:creator] || document[:contributors][0] if document[:contributors]
    query_hash['rft.isbn'] = document[:isbn_numbers][0] if document[:isbn_numbers]
    query_hash['rft.issn'] = document[:issn_numbers][0] if document[:issn_numbers]
    # Edition will be added in the future
    query_hash['rft.edition'] = nil
    query_hash['rft.date'] = document[:publication_year_display]
    pub = document[:publication_display] || document[:creation_display] || document[:distribution_display] || document[:manufacture_display]
    query_hash['rft.pub'] = pub.join('; ') unless pub.nil?
    query_hash[:notes] = "Discover record: #{request.base_url}/catalog/#{document[:id]}"
    # Remove nil values
    query_hash.compact!

    if item.nil?
      query_hash[:Action] = '10'
      query_hash[:Form] = '30'
      URI::HTTPS.build(host: 'unt.illiad.oclc.org', path: '/illiad/illiad.dll', query: query_hash.to_query).to_s
    else
      URI::HTTPS.build(host: 'iii.library.unt.edu', path: '/screens/jlf-illiad-gateway.html', query: query_hash.to_query).to_s
    end
  end

  def construct_aeon_url(document, item)
    # Construct URL for Aeon
    #
    # 'Location' & 'Site' parameters are updated via javascript after the Sierra API call

    query_hash = {}

    # Add query string parameters unless values
    query_hash['rft.genre'] = 'monograph'
    query_hash[:ItemTitle] = document[:full_title]
    query_hash[:ItemAuthor] = document[:creator] || document[:contributors][0] if document[:contributors]
    query_hash[:ItemNumber] = "#{document[:id]}a"
    # ItemEdition will be added in the future
    query_hash[:ItemEdition] = nil
    query_hash[:ItemDate] = document[:publication_year_display]
    pub = document[:publication_display] || document[:creation_display] || document[:distribution_display] || document[:manufacture_display]
    query_hash[:ItemPublisher] = pub.join('; ') unless pub.nil?
    # SubLocation will be added in the future
    query_hash[:SubLocation] = nil
    query_hash[:notes] = "Discover record: #{request.base_url}/catalog/#{document[:id]}"
    query_hash[:CallNumber] = item['c']
    query_hash[:Volume] = item['v']
    query_hash[:ReferenceNumber] = item[:b]
    # Remove nil values
    query_hash.compact!

    query_hash[:Action] = '10'
    query_hash[:Form] = '30'

    URI::HTTPS.build(host: 'aeon.library.unt.edu', path: '/logon/', query: query_hash.to_query).to_s
  end

  def feedback_issue_url
    gitlab = t('gitlab')
    host = gitlab[:url]
    path = "#{gitlab[:project_path]}#{gitlab[:issues_path]}"
    endpoint = "#{path}#{gitlab[:new_endpoint]}"

    query_hash = {
      'issue[title]': 'Site feedback',
      'issue[description]': "[your request here, attach file if needed.]\n\n\n\n
<!-- due date, assignee, and label will automatically be filled below -->
<!-- NO EDITS BELOW THIS LINE -->\n
- [PUBLIC URL](#{request.original_url})\n
/assign @UI
/due <in 2 days
/label ~feedback",
    }

    URI::HTTPS.build(host: host, path: endpoint, query: query_hash.to_query).to_s
  end

  def link_to_bento_box_search(text, query)
    url = URI::HTTPS.build(host: 'library.unt.edu', path: '/search/', query: "q=#{query}").to_s
    link_to text, url, target: "_blank", rel: 'noopener'
  end
end
