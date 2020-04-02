# frozen_string_literal: true

module ThumbnailHelper

  def render_thumbnail(document, opts = { counter: nil })
    thumbnail_url = document[:thumbnail_url]
    current_view = params[:action]

    thumbnail_tag = content_tag(:div,
                { class: "document-thumbnail text-center #{current_view}-thumbnail #{'thumbnail-loaded' if thumbnail_url}",
                  data: { 'bib-id': document.id.to_s.parameterize } }) do
      if thumbnail_url.blank?
        svg_icon = "#{asset_pack_path('media/images/icons/regular.svg')}##{document.resource_type_icon}"
        content_tag(:svg, { class: "img-fluid #{current_view}-icon icon" }) do
          concat("<use xlink:href=\"#{svg_icon}\"></use>".html_safe)
          concat("<span class=\"sr-only item-title\">#{document[:full_title]}</span>".html_safe)
        end
      else
        image_tag(thumbnail_url, { class: 'image-fluid', alt: document[:full_title] })
      end
    end

    return link_to_document(document, thumbnail_tag, opts) if current_view == 'index'
    thumbnail_tag
  end
end