# Joins values using configured value or linebreak
class CustomJoin < Blacklight::Rendering::AbstractStep
  include ActionView::Helpers::TextHelper

  def render
    options = config.separator_options || { :words_connector => '<br>' }
    next_step(values.map { |x| html_escape(x) }.to_sentence(options).html_safe)
  end

  private

  def html_escape(*args)
    ERB::Util.html_escape(*args)
  end
end
