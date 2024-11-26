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

  def construct_summon_search_url(document)
    record_title = document[:title_display]
    record_title.downcase!
    record_title.gsub!(/[&:;,.'"\/\\\[\]()]/, '')
    record_title.gsub!(/(^|\s)((a|an|the|of|and|or|in|on|for|from|to|not|be|is|am|are)(\s|$))+/, ' ')
    record_title.gsub!(/^\s*/, '')
    record_title.gsub!(/^((.*?\s){5}).*$/, '\1')
    record_title.gsub!(/\s*$/, '')

    query_hash = {
      :q => record_title,
      :fvf => 'ContentType,Journal Article,f|IsScholarly,true,f|IsFullText,true,f',
    }

    # Can't use URI::HTTPS.build for the URL because Summon uses a #! in the path
    "https://untexas.summon.serialssolutions.com/#!/search?#{query_hash.to_query}"
  end

  def link_to_summon_search(document)
    text = 'Find Related Articles'
    url = construct_summon_search_url(document)

    link_to text, url, class: 'nav-link', id: 'relatedArticlesLink', target: '_blank', rel: 'noopener',
                       'ga-on': 'click',
                       'ga-event-category': 'Bib Record',
                       'ga-event-action': 'Tools link click',
                       'ga-event-label': 'Find Related Articles',
                       'ga-event-value': '1'
  end

  def construct_google_scholar_search_url(document)
    query_hash = { :q => document[:title_display] }

    URI::HTTPS.build(host: 'scholar.google.com', path: '/scholar', query: query_hash.to_query).to_s
  end

  def link_to_google_scholar_search(document)
    text = 'Search in Google Scholar'
    url = construct_google_scholar_search_url(document)

    link_to text, url, class: 'nav-link', id: 'googleScholarLink', target: '_blank', rel: 'noopener',
                       'ga-on': 'click',
                       'ga-event-category': 'Bib Record',
                       'ga-event-action': 'Tools link click',
                       'ga-event-label': 'Search in Google Scholar',
                       'ga-event-value': '1'
  end

  def link_to_old_catalog(document)
    record_id = document[:id]
    text = 'View in Legacy Catalog'
    catalog_url = 'https://iii.library.unt.edu/record='
    url = "#{catalog_url}#{record_id}"

    link_to text, url, class: 'nav-link', id: 'catalogLink', target: '_blank', rel: 'noopener nofollow',
                       'ga-on': 'click',
                       'ga-event-category': 'Bib Record',
                       'ga-event-action': 'Tools link click',
                       'ga-event-label': 'Old Catalog',
                       'ga-event-value': '1'
  end

  def link_to_request_refworks(document)
    url = "https://export2refworks.library.unt.edu/processor_a.php?bib=#{document[:id]}"
    content_tag(:span, document[:full_title], class: 'sr-only')
    text = "Add #{content_tag(:span,
                              document[:full_title], class: 'sr-only')} to Refworks".html_safe
    link_to text, url, class: "nav-link", target: "_blank", rel: 'noopener',
                       'ga-on': 'click',
                       'ga-event-category': 'Bib Record',
                       'ga-event-action': 'Tools link click',
                       'ga-event-label': 'Refworks',
                       'ga-event-value': '1'
  end

  def construct_illiad_url(document, item: nil)
    # Construct URL for ILLiad and use gateway if an item is provided

    query_hash = {}

    if document[:author_json].present?
      author_json = json_str_to_hash(document[:author_json])['p'].last
      author = author_json['v'] || author_json['d']
    elsif document[:contributors_json].present?
      contrib_json = json_str_to_array(document[:contributors_json]).first['p'].last
      author = contrib_json['v'] || contrib_json['d']
    end

    # Add query string parameters unless values
    query_hash[:sid] = 'Discover Request'
    # Journals and e-journals are 'article', the rest are 'book'
    query_hash['rft.genre'] = (document[:material_type] == 'q' || document[:material_type] == 'y') ? 'article' : 'book'
    query_hash['rft.title'] = "#{document[:title_display]}#{" / #{document[:responsibility_display]}" if document[:responsibility_display].present?}"
    query_hash['rft.au'] = author
    query_hash['rft.isbn'] = document[:isbn_numbers][0] if document[:isbn_numbers]
    query_hash['rft.issn'] = document[:issn_numbers][0] if document[:issn_numbers]
    query_hash['rft.edition'] = document[:editions_display].first if document[:editions_display]
    query_hash['rft.date'] = document[:publication_year_display]
    pub = document[:publication_display] || document[:creation_display] || document[:distribution_display] || document[:manufacture_display]
    query_hash['rft.pub'] = pub.join('; ') unless pub.nil?
    query_hash[:notes] = "Discover record: #{request.base_url}/catalog/#{document[:id]}"
    # Remove nil values
    query_hash.compact!

    if item.nil?
      query_hash[:Action] = '10'
      query_hash[:Form] = '30'
      URI::HTTPS.build(host: 'ill.library.unt.edu', path: '/illiad/illiad.dll', query: query_hash.to_query).to_s
    else
      URI::HTTPS.build(host: 'iii.library.unt.edu', path: '/screens/jlf-illiad-gateway.html', query: query_hash.to_query).to_s
    end
  end

  def link_to_request_illiad(document)
    url = construct_illiad_url(document)
    content_tag(:span, document[:full_title], class: 'sr-only')
    text = "Request #{content_tag(:span, document[:full_title], class: 'sr-only')}" \
      "through ILL".html_safe
    link_to text, url, class: "nav-link", target: "_blank", rel: 'noopener',
                       'data-bs-toggle': 'tooltip',
                       'data-bs-title': 'Request through Interlibrary Loan',
                       'ga-on': 'click',
                       'ga-event-category': 'Bib Record',
                       'ga-event-action': 'Tools link click',
                       'ga-event-label': 'Illiad',
                       'ga-event-value': '1'
  end

  def construct_catalog_request_url(document, item_index: nil)
    id = document[:id]
    query_hash = {}

    if document[:author_json].present?
      author_json = json_str_to_hash(document[:author_json])['p'].last
      author = author_json['v'] || author_json['d']
    elsif document[:contributors_json].present?
      contrib_json = json_str_to_array(document[:contributors_json]).first['p'].last
      author = contrib_json['v'] || contrib_json['d']
    end

    # Add query string parameters unless values
    query_hash[:requestItemIndex] = item_index
    query_hash[:sid] = 'Discover Request'
    query_hash[:bibId] = "#{document[:id]}a"
    # Journals and e-journals are 'article', the rest are 'book'
    query_hash['rft.genre'] = (document[:material_type] == 'q' || document[:material_type] == 'y') ? 'article' : 'book'
    query_hash['rft.title'] = document[:title_display].present? ? "#{document[:title_display]}#{" / #{document[:responsibility_display]}" if document[:responsibility_display].present?}" : 'none'
    query_hash['rft.au'] = author || 'none'
    query_hash['rft.isbn'] = document[:isbn_numbers].first if document[:isbn_numbers]
    query_hash['rft.issn'] = document[:issn_numbers].first if document[:issn_numbers]
    query_hash['rft.edition'] = document[:editions_display].first if document[:editions_display]
    query_hash['rft.date'] = document[:publication_year_display] || 'none'
    pub = document[:publication_display] || document[:creation_display] || document[:distribution_display] || document[:manufacture_display]
    query_hash['rft.pub'] = pub.present? ? pub.join('; ') : 'none'
    query_hash[:notes] = "Discover record: #{request.base_url}/catalog/#{document[:id]}"
    # Remove nil values
    query_hash.compact!

    URI::HTTPS.build(host: 'iii.library.unt.edu', path: '/search~S12', query: "/.#{id}/.#{id}/1%2C275%2C275%2CB/request~#{id}&#{query_hash.to_query}").to_s
  end

  def construct_aeon_url(document, item: nil)
    # Construct URL for Aeon
    #
    # 'Location' & 'Site' parameters are updated via javascript after the Sierra API call

    query_hash = {}

    if document[:author_json].present?
      author_json = json_str_to_hash(document[:author_json])['p'].last
      author = author_json['v'] || author_json['d']
    elsif document[:contributors_json].present?
      contrib_json = json_str_to_array(document[:contributors_json]).first['p'].last
      author = contrib_json['v'] || contrib_json['d']
    end

    # Add query string parameters unless values
    query_hash['rft.genre'] = 'monograph'
    query_hash[:ItemTitle] = document[:title_display].present? ? "#{document[:title_display]}#{" / #{document[:responsibility_display]}" if document[:responsibility_display].present?}" : 'none'
    query_hash[:ItemAuthor] = author || 'none'
    query_hash[:ItemNumber] = "#{document[:id]}a"
    query_hash[:ItemEdition] = document[:editions_display].first if document[:editions_display]
    query_hash[:ItemDate] = document[:publication_year_display] || 'none'
    pub = document[:publication_display] || document[:creation_display] || document[:distribution_display] || document[:manufacture_display]
    query_hash[:ItemPublisher] = pub.present? ? pub.join('; ') : 'none'
    query_hash[:SubLocation] = document[:library_has_display].join("\n") if document[:library_has_display]
    query_hash[:notes] = "Discover record: #{request.base_url}/catalog/#{document[:id]}"
    query_hash[:CallNumber] = item.present? ? item['c'] || 'none' : 'none'
    query_hash[:Volume] = item.present? ? item['v'] || 'none' : 'none'
    query_hash[:ReferenceNumber] = item.present? ? item[:b] : 'none'
    # Remove nil values
    query_hash.compact!

    query_hash[:Action] = '10'
    query_hash[:Form] = '30'

    URI::HTTPS.build(host: 'aeon.library.unt.edu', path: '/logon/', query: query_hash.to_query).to_s
  end

  def construct_finding_aid_url(document)
    # Construct URL for Finding Aids

    json = document[:urls_json].map { |item| JSON.parse(item) }
    urls = json.select { |item| item['t'] != 'fulltext' }
    url = urls.select { |item| item['u'].include?('findingaids.library.unt.edu') }
    url = url.first['u']
    url = url.sub('controlcard', 'findingaid')

    "#{url}#boxfolder"
  end

  def link_to_request_item(document, item: nil, item_index: nil)
    requestability = item['r']
    data = {}

    case requestability
    when 'catalog'
      url = construct_catalog_request_url(document, item_index: item_index)
      text = "<i class='fal fa-fw fa-truck'></i> Request pickup"
      el_class = "request-catalog"
      data['bib-title'] = "#{document[:title_display]}#{" / #{document[:responsibility_display]}" if document[:responsibility_display].present?}"
      data['aeon-url'] = construct_aeon_url(document)
      data['illiad-url'] = construct_illiad_url(document)
      data['bs-toggle'] = 'tooltip'
      data['bs-title'] = 'Place a request to have this item delivered to a pickup location when it becomes available.'
    when 'jlf'
      url = construct_illiad_url(document, item: item)
      text = "<i class='fal fa-fw fa-warehouse-alt'></i> Request from JLF Remote"
      el_class = "request-illiad"
      data['bs-toggle'] = 'tooltip'
      data['bs-title'] = 'This item is located at the Joint Library Facility Remote Storage location. Request it through ILLiad.'
    when 'aeon'
      url = construct_aeon_url(document, item: item)
      text = "<i class='fal fa-fw fa-archive'></i> Request on-site use"
      el_class = "request-aeon"
      data['bs-toggle'] = 'tooltip'
      data['bs-title'] = 'Reading Room Use Only. Place a request through Aeon to use this item at the library.'
    when 'finding_aid'
      url = construct_finding_aid_url(document)
      text = "<i class='fal fa-fw fa-archive'></i> Request on-site use"
      el_class = "request-finding-aid"
      data['bs-toggle'] = 'tooltip'
      data['bs-title'] = 'Reading Room Use Only. Place a request through the finding aid to use this item at the library.'
    else
      return 'Cannot request this item'
    end

    link_to text.html_safe, url, class: el_class, target: "_blank", rel: 'noopener',
                       data: data,
                       'ga-on': 'click',
                       'ga-event-category': 'Bib Record',
                       'ga-event-action': 'Availability request click',
                       'ga-event-label': text,
                       'ga-event-value': '1'
  end

  def link_to_worldcat_citations(document)
    url = "https://worldcat.org/oclc/#{document[:oclc_numbers].first}?page=citation"
    text = 'Cite This'
    link_to text, url, class: "nav-link", target: "_blank", rel: 'noopener',
                       'ga-on': 'click',
                       'ga-event-category': 'Bib Record',
                       'ga-event-action': 'Tools link click',
                       'ga-event-label': 'Cite',
                       'ga-event-value': '1'
  end

  def feedback_issue_email
    email_add = t('urls.feedback_email')

    headers = [
      ['subject', CGI.escape('Discover site feedback').gsub("+", "%20")],
      [
        'body',
        CGI.escape("[your request here, attach file if needed.]\n\n\n\n
<!-- NO EDITS BELOW THIS LINE -->\n
- [PUBLIC URL](#{request.original_url})
- User Agent: {{userAgent}}").gsub("+", "%20"),
      ],
    ]

    URI::MailTo.build({ :to => email_add, :headers => headers })
  end

  def link_to_bento_box_search(text, query)
    url = URI::HTTPS.build(host: 'library.unt.edu', path: '/search/', query: "q=#{query}").to_s
    link_to text, url, target: "_blank", rel: 'noopener'
  end
end
