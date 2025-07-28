# frozen_string_literal: true

module ThumbnailHelper
  def render_thumbnail(document, opts = {})
    thumbnail_url = document[:thumbnail_url]
    current_view = action_name

    thumbnail_tag = content_tag(:div, {
      class: "document-thumbnail text-center #{current_view}-thumbnail "\
        "#{'thumbnail-loaded' if thumbnail_url}",
      data: { 'bib-id': document.id.to_s.parameterize },
    }) do
      if thumbnail_url.blank?
        icon = document.resource_type_icon
        content_tag(:div, {
          class: "img-fluid #{current_view}-icon icon",
          "aria-hidden": true,
          tabindex: -1,
        }) do
          concat(content_tag(:i, '', class: "#{icon}-icon icon fal fa-#{icon} img-fluid"))
          concat(content_tag(:span, document[:full_title], class: 'visually-hidden item-title'))
        end
      else
        image_tag('data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
                  {
                    class: 'img-fluid lazyload',
                    data: { src: thumbnail_url },
                    alt: document[:full_title],
                    "aria-hidden": true,
                    tabindex: -1,
                  })
      end
    end

    return link_to_document(document, thumbnail_tag, opts) if current_view == 'index'
    thumbnail_tag
  end
end
