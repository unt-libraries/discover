module ApplicationHelper
  def render_format_with_icon value
    content_tag :span do
      content_tag(:span, '', class: "fal fa-#{value.is_a?(String)}") +
          content_tag(:span, value)
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

  #
  def bootstrap_select_tag(name, option_tags = nil, options = {})
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
        option_tags = content_tag("a".freeze, include_blank, options_for_blank_options_tag).safe_concat(option_tags)
      end
    end

    if prompt = options.delete(:prompt)
      option_tags = content_tag("a".freeze, prompt, value: "").safe_concat(option_tags)
    end

    content_tag "div".freeze, option_tags, { "name" => html_name, "id" => sanitize_to_id(name) }.update(options.stringify_keys)
  end

  #
  def bootstrap_options_for_select(container, selected = nil)
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

  #
  def dropdown_label_for_search_field(key)
    field_config = blacklight_config.search_fields[key]
    field_config ||= blacklight_config.search_fields['text']

    field_config.display_label('search')
  end

  def author_facet_links(options={})
    links = []

    options[:value].each do |value|
      link = link_to(value, "/?f[public_author_facet][]=#{CGI.escape(value)}",
                     class: "",
                     "data-toggle" => "tooltip",
                     title: "Search for #{value}")
      links.push(link)
    end
    links.join('; ').html_safe
  end
end