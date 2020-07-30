module ApplicationHelper
  include Blacklight::BlacklightHelperBehavior
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
  # Helper method for catalog_controller specific to json provided by solr for author fields
  # @param [Hash] options - field options
  # @return [String] HTML links joined together
  def author_json_to_links(options = {})
    values = options[:value]
    facet = options[:config][:link_to_facet]

    values.map do |item|
      relator = item['r'].blank? ? '' : ", #{item['r'].join(', ')}"
      item['p'].map do |i|
        i['v'] ||= i['d']
        json_value_to_facet_link(i, facet, context: 'show')
      end.join.strip.concat(relator)
    end.join('<br>').html_safe
  end

  ##
  # Helper method for catalog_controller specific to json provided by solr for title fields
  # @param [Hash] options - field options
  # @return [String] HTML links joined together
  def title_json_to_links(options = {})
    values = options[:value]
    facet = options[:config][:link_to_facet]

    values.map do |item|
      author = item['a']
      before_text = "#{item['b']} "
      item['p'].map do |i|
        if i['v'].present?
          json_value_to_facet_link(i, facet, author: author, context: 'show')
        else
          "#{i['d']}#{i['s'] || ' '}"
        end
      end.join.prepend(before_text).strip
    end.join('<br>').html_safe
  end

  ##
  # Takes a single json value and returns a link to search the facet
  # @param [Hash] data
  # @return [String] HTML link
  def json_value_to_facet_link(data, facet, author: nil, context: nil)
    display = data['d']
    value = data['v']
    separator = data['s'] || ' '
    author_facet = author.present? ? "f[author_contributor_facet][]=#{CGI.escape(author)}&" : ''
    ga_category = context == 'show' ? 'Bib Record' : 'List Item Link'

    link_to(display, "/?#{author_facet}f[#{facet}][]=#{CGI.escape(value)}",
            class: "",
            "data-toggle" => "tooltip",
            title: "Search for #{display}",
            'ga-on': 'click',
            'ga-event-category': ga_category,
            'ga-event-action': "#{facet}",
            'ga-event-label': value).concat(separator)
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
        display = last_part[:v]
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

    content_tag(:div, class: 'show-heading-title') do
      concat(content_tag(tag, presenter(document).heading,
                         { class: 'show-heading-title__main', itemprop: "name" }))
      if document[:responsibility_display]
        concat(content_tag(:div, document[:responsibility_display],
                           { class: 'show-heading-title__sub' }))
      end
    end
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
end
