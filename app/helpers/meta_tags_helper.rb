module MetaTagsHelper
  def meta_title
    render_page_title ? render_page_title : DEFAULT_META['title']
  end

  def meta_site_name
    DEFAULT_META['title']
  end

  def meta_description(document = @document, options = {})
    if document
      responsibility = document[:responsibility_display]&.upcase_first
      resource_type = document.resource_type_name
      published = document[:publication_display]&.first
      location = document[:building_locations]&.first || 'Online'
      call_number = document[:call_numbers_display]&.first || ''

      "#{responsibility}#{'; ' if responsibility}#{resource_type}, published #{published};"\
      " @ UNT Libraries Denton - #{location}#{', ' if call_number}#{call_number}"
    else
      DEFAULT_META['meta_description']
    end
  end

  def meta_image
    meta_image = (content_for?(:meta_image) ? content_for(:meta_image) : DEFAULT_META["meta_image"])
    # little twist to make it work equally with an asset or a url
    # meta_image.starts_with?("http") ? meta_image : image_url(meta_image)
  end
end