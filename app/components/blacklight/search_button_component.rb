# frozen_string_literal: true

module Blacklight
  class SearchButtonComponent < Blacklight::Component
    def initialize(text:, id:)
      @text = text
      @id = id
    end

    def call
      tag.button(class: 'btn btn-lg btn-unt-green search-btn d-flex align-items-center', type: 'submit', id: @id) do
        render(Blacklight::Icons::SearchComponent.new) +
        tag.span(@text, class: "submit-search-text d-none d-sm-inline")
      end
    end
  end
end
