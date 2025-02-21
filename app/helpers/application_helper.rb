module ApplicationHelper
  include Blacklight::BlacklightHelperBehavior

  ##
  # Get the name of this application from an i18n string
  # key: blacklight.application_name
  # Try first in the current locale, then the default locale
  #
  # @return [String] the application name
  def render_page_title
    (content_for(:page_title) if content_for?(:page_title)) || @page_title || "#{application_name}: #{site_subtitle}"
  end

  ##
  # Get the site subtitle of this application from an i18n string.
  # key: blacklight.site_subtitle
  # Try first in the current locale, then the default locale
  #
  # @return [String] the site subtitle
  def site_subtitle
    # It's important that we don't use ActionView::Helpers::CacheHelper#cache here
    # because it returns nil.
    Rails.cache.fetch 'blacklight/site_subtitle' do
      t('blacklight.site_subtitle',
        default: t('blacklight.site_subtitle', locale: I18n.default_locale))
    end
  end

  ##
  # Return the number of search results from the response object
  #
  # @param [Blacklight::Solr::Response] response
  # @return [String]
  def get_number_search_results(response)
    number_with_delimiter(response['response']['numFound'])
  end


  def bootstrap_select_tag(name, option_tags = nil, options = {}) # rubocop:disable Airbnb/OptArgParameters
    option_tags ||= ""
    html_name = (options[:multiple] == true && !name.to_s.ends_with?("[]")) ? "#{name}[]" : name

    if options.include?(:include_blank)
      include_blank = options.delete(:include_blank)
      options_for_blank_options_tag = { value: "" }

      if include_blank == true
        include_blank = ""
        options_for_blank_options_tag[:label] = " "
      end

      if include_blank
        option_tags = content_tag("a".freeze, include_blank, options_for_blank_options_tag).
          safe_concat(option_tags)
      end
    end

    if prompt = options.delete(:prompt) # rubocop:disable AssignmentInCondition
      option_tags = content_tag("a".freeze, prompt, value: "").safe_concat(option_tags)
    end

    content_tag "div".freeze, option_tags, { "name" => html_name, "id" => sanitize_to_id(name) }.
      update(options.stringify_keys)
  end

  def bootstrap_options_for_select(container, selected = nil) # rubocop:disable Airbnb/OptArgParameters
    return container if String === container

    selected, disabled = extract_selected_and_disabled(selected).map do |r|
      Array(r).map(&:to_s)
    end

    container.map do |element|
      html_attributes = option_html_attributes(element)
      text, value = option_text_and_value(element).map(&:to_s)

      html_attributes[:href] = "#"
      html_attributes[:class] = "dropdown-item"
      html_attributes['data-search-field'] = value
      html_attributes['data-pretty'] = text
      html_attributes[:selected] ||= option_value_selected?(value, selected)
      html_attributes[:disabled] ||= disabled && option_value_selected?(value, disabled)

      tag_builder.content_tag_string("a", text, html_attributes)
    end.join("\n").html_safe
  end

  def dropdown_label_for_search_field(key)
    field_config = blacklight_config.search_fields[key]
    field_config ||= blacklight_config.search_fields['text']

    field_config.display_label('search')
  end

  ##
  # Formats the table of contents for the show view.
  # If there are more than `primary_threshold` lines in the TOC, anything over that threshold
  # is split into a hidden container that the user must reveal.
  # @param [Hash] options - field options
  # @return [String] HTML elements joined together
  def format_toc(options = {})
    values = options[:value]
    primary_threshold = 20
    delimiter = '--'
    # TOC is a multivalued field, so this combines multiple entries using the delimiter
    combined_values = values.join(delimiter)
    split_items = combined_values.split(delimiter)
    item_elements = split_items.map.with_index do |toc_item, index|
      content_tag :li, toc_item, class: 'toc_item', data: { 'toc-index': index }
    end

    if item_elements.size > primary_threshold
      primary_items = item_elements.take(primary_threshold).join
      more_items = item_elements.drop(primary_threshold).join
      more_count = item_elements.size - primary_threshold

      primary_tag = content_tag :ul, primary_items.html_safe, class: 'toc_list'
      more_tag = content_tag :ul, more_items.html_safe, class: 'toc_list more-max d-none'
      more_button = content_tag :div, class: "more-less text-center" do
        "<a href='#' onclick='return false' class='reveal-more'>
          <span class='more-text d-block'>View #{more_count} more #{'line'.pluralize(more_count)}</span>
          <i class='fal fa-chevron-down more-icon d-inline-block'></i>
        </a>
        <a href='#' onclick='return false' class='reveal-less d-none'>
          <span class='less-text d-block'>View less</span>
          <i class='fal fa-chevron-up less-icon d-inline-block'></i>
        </a>".html_safe
      end

      full_toc = content_tag :span, { data: { 'more_scope': true, 'showing_less': true } } do
        concat(primary_tag)
        concat(more_tag)
        concat(more_button)
      end
    else
      full_toc = content_tag :ul, item_elements.join.html_safe, class: 'toc_list'
    end

    content_tag :div, full_toc, class: 'toc_container'
  end

  ##
  # Converts a single JSON string from solr to Ruby hash
  # Used for single value fields
  # @param value [String] JSON string
  # @return [Hash] Ruby hash
  def json_str_to_hash(value)
    return if value.blank?
    JSON.parse(value).with_indifferent_access
  end

  ##
  # Converts Array of JSON strings from solr to array of Ruby hashes
  # @param value [Array] Array of JSON strings
  # @return [Array] Array of Ruby hashes
  def json_str_to_array(value)
    return if value.blank?
    value.map do |item|
      json_str_to_hash(item)
    end
  end

  ##
  # Converts JSON to links and replaces the separator with a emdash
  # @param value [String] JSON string
  # @return [String] HTML string
  def sub_gen_json_to_links(options = {})
    options[:new_separator] = ' — '
    json_to_links(options)
  end

  ##
  # Helper method for catalog_controller specific to json provided by solr for some fields
  # @param [Hash] options - field options
  # {
  #   "a": "", # Optional, string. Author/contributor facet heading that goes with this title.
  #   "b": "", # Optional, string. Display text to display before the title heading parts.
  #   "p": Array{obj}. Parts of the heading. Contains an array of objs, each describing a heading part, in order.
  #     [
  #       {
  #         "d": String. Display term. This is the text to display for this segment.
  #         "v": String. Value term. This is the full facet value this segment links to.
  #         "s": String. Separator. Display this as non-linked text immediately following the display <a> element.
  #       }
  #     ],
  #   "r": [String]. Relationship. Optional, string. Display text to display after the title heading parts.
  # }
  # @return [String] HTML links joined together
  def json_to_links(options = {})
    values = options[:value]
    facet = options[:config][:link_to_facet]

    values.map do |item|
      content_tag(:div, class: 'result__value__row hierarchical-link') do
        author = item['a'] || nil
        before_text = item['b'].blank? ? '' : "#{item['b']} "
        relationship = item['r'].blank? ? '' : ", #{item['r'].join(', ')}"
        item_count = item['p'].size
        item['p'].map.with_index do |i, idx|
          display = i['d']
          value = i['v']
          separator = i['s'] || ' '
          separator = options[:new_separator] if options[:new_separator].present? && i['s'].present?
          separator_element = "<span class=\"separator\">#{separator}</span>".html_safe
          if value.present?
            json_value_to_facet_link(i, facet, author: author, context: 'show').concat(separator_element)
          else
            content_tag(:span, "#{display}#{separator_element}".html_safe)
          end
        end.join.prepend(before_text).strip.concat(relationship).html_safe
      end
    end.join.html_safe
  end

  ##
  # Helper method for catalog_controller specific to json provided by solr related works and
  # serial continuity fields
  # @param [Hash] options - field options
  # @return [String] HTML links joined together
  def related_json_to_links(options = {})
    values = options[:value]
    label = options[:config][:label]

    values.map do |item|
      content_tag(:div, class: 'result__value__row') do
        before_text = "#{item['b']} "
        item['p'].map do |i|
          display = i['d']
          separator = i['s'] || ' '
          terms = {
            'Author/Creator' => i['a'],
            :title => i['t'],
            :control_number => i['cn'],
            :standard_number => i['sn'],
          }.compact
          link_data = {
            "data-toggle" => "tooltip",
            'ga-on': 'click',
            'ga-event-category': 'Bib Record',
            'ga-event-action': label,
            'ga-event-label': display,
          }
          if terms.count > 1
            search_string = terms.map { |key, val| "\"#{val}\"" }.join(" AND ")
            link_to("#{display}",
                    search_catalog_url(
                      q: search_string,
                      search_field: 'text'
                    ),
                    link_data.merge({ title: "Search: #{search_string}" }),
            ).concat(separator)
          elsif terms.count === 1
            link_to("#{display}",
                    search_catalog_url(
                      q: "\"#{terms.values.first}\"",
                      search_field: terms.keys.first,
                    ),
                    link_data.merge({ title: "Search: #{display}" }),
            ).concat(separator)
          else
            "#{display}#{separator}"
          end
        end.join.prepend(before_text).strip.html_safe
      end
    end.join.html_safe
  end

  ##
  # Takes a single json value and returns a link to search the facet
  # @param [Hash] data
  # @return [String] HTML link
  def json_value_to_facet_link(data, facet, author: nil, context: nil)
    display = data['d']
    value = data['v']
    author_facet = author.present? ? "f[author_contributor_facet][]=#{CGI.escape(author)}&" : ''
    ga_category = context == 'show' ? 'Bib Record' : 'List Item Link'

    link_to(display, "/?#{author_facet}f[#{facet}][]=#{CGI.escape(value)}",
            class: "",
            "data-toggle" => "tooltip",
            title: "Search: #{value.split('!', 2).last}",
            'ga-on': 'click',
            'ga-event-category': ga_category,
            'ga-event-action': "#{facet}",
            'ga-event-label': value)
  end

  ##
  # Combines the author and contributor fields, cuts down to the first 2, returns HTML
  # @param [SolrDocument] document
  # @param [Integer] limit
  # @return [String] HTML of combined links
  def index_creator_contrib_field(document, limit: 2)
    creator = document[:author_json].blank? ? [] : [json_str_to_hash(document[:author_json])]
    contributors = document[:contributors_json].blank? ? [] : json_str_to_array(document[:contributors_json])
    combined = creator + contributors
    list_size = combined.length
    limited = combined.slice(0, limit)
    linked = limited.map do |item|
      # If it is a multi-part item, we use the value for both display and value
      if item[:p].length > 1
        last_part = item['p'].last
        display = get_split_facet_display(last_part[:v])
        value = last_part[:v]
        part = {
          :d => display,
          :v => value,
        }.with_indifferent_access
      else
        item[:p].first[:v] ||= item[:p].first[:d]
        part = item[:p].first
      end
      json_value_to_facet_link(part, 'author_contributor_facet', context: 'index').strip
    end.join('; ').html_safe

    more = "<span class='more'>+#{list_size - limit} more</span>"

    "#{linked} #{more if list_size > limit}".html_safe
  end

  def items_have_notes?(items)
    unless items.nil?
      items.any? { |h| h['n'].present? }
    end
  end

  ##
  # Override function from Blacklight 7.3
  # Render the document "heading" (title) in a content tag
  # @overload render_document_heading(document, options)
  #   @param [SolrDocument] document
  #   @param [Hash] options
  #   @option options [Symbol] :tag
  # @overload render_document_heading(options)
  #   @param [Hash] options
  #   @option options [Symbol] :tag
  def render_document_heading(*args)
    options = args.extract_options!
    document = args.first
    tag = options.fetch(:tag, :h4)
    document ||= @document # rubocop:disable Rails/HelperInstanceVariable
    responsibility_display = document[:responsibility_display]

    content_tag(:div, class: 'show-heading-title') do
      concat(content_tag(tag, presenter(document).heading,
                         { class: "show-heading-title__main",
                           itemprop: "name" }))
      if responsibility_display
        concat(content_tag(:div, responsibility_display,
                           { class: 'show-heading-title__sub' }))
      end
    end
  end

  ##
  # Checks the current search parameters to determine whether to show a control number field
  # @param [Hash] params - Parameters of the current search
  # @param [String] field_name - The name of the field to check
  # @return [Boolean]
  def display_control_number?(params, field_name)
    non_sudoc_fields = ['call_number', 'standard_number', 'control_number']

    if field_name == 'sudocs_display'
      if params[:search_field].blank? || params[:search_field] == 'sudoc'
        return true
      end
      !non_sudoc_fields.include?(params[:search_field])
    else
      if params.present? && params[:search_field].present?
        return true if field_name.include? params[:search_field]
      end
    end
    false
  end

  def accessible_remove_label(label, value)
    if label.blank?
      t('blacklight.search.filters.remove.value', value: value)
    else
      t('blacklight.search.filters.remove.label_value', label: label, value: value)
    end
  end

  def banner_dismissed?(banner)
    cookies["banner_dismissed_#{banner}"]
  end

  ##
  # Returns the current search context for use in templates
  def search_context_query
    if current_search_session.blank? || current_search_session[:query_params].blank?
      return
    end
    current_search_session[:query_params].to_json
  end

  def render_badges(document)
    date_added = document[:date_added]
    if recently_added?(date_added)
      content_tag(:span, recently_added_badge(date_added), class: 'badges_container')
    end
  end

  def recently_added?(date_added)
    return false if date_added.blank?
    added = DateTime.parse(date_added).to_date
    added > 3.months.ago
  end

  def recently_added_badge(date_added)
    added = DateTime.parse(date_added).to_date
    added_string = added.strftime('%B %Y')

    content_tag(:span, "Added #{added_string}",
                class: 'badge blacklight-date_added')
  end
end
