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

    if prompt = options.delete(:prompt)
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

  def author_facet_links(list: [])
    links = []

    list.each do |value|
      link = link_to(value, "/?f[public_author_facet][]=#{CGI.escape(value)}",
                     class: "",
                     "data-toggle" => "tooltip",
                     title: "Search for #{value}",
                     'ga-on': 'click',
                     'ga-event-category': 'List Item Link',
                     'ga-event-action': 'Author facet',
                     'ga-event-label': value)
      links.push(link)
    end
    links.join('; ').html_safe
  end

  def index_creator_contrib_field(document, limit: 2)
    creator = document[:creator].nil? ? [] : [document[:creator]]
    contributors = document[:contributors] || []
    combined = creator + contributors
    list_size = combined.length
    limited = combined.slice(0, limit)
    linked = author_facet_links(list: limited)
    more = "<span class='more'>+#{list_size - limit} more</span>"

    "#{linked} #{more if list_size > limit}".html_safe
  end

  def json_str_to_array(value)
    value.map! do |item|
      JSON.parse(item)
    end
  end

  def items_have_notes?(items)
    unless items.nil?
      items.any? { |h| !h['n'].nil? }
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
      if document[:statement_of_responsibility]
        concat(content_tag(:div, document[:statement_of_responsibility],
                           { class: 'show-heading-title__sub' }))
      end
    end
  end
end