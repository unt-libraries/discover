# frozen_string_literal: true

module Blacklight
  module Icons
    # This is the magnifing glass icon for the search button.
    # You can override the default svg by setting:
    #   Blacklight::Icons::SearchComponent.svg = '<svg>your SVG here</svg>'
    class SearchComponent < Blacklight::Icons::IconComponent
      self.svg = <<~SVG
        <svg class="svg-inline--fa fa-magnifying-glass me-2" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="magnifying-glass" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg="">
          <path fill="currentColor" d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"></path>
        </svg>
      SVG
    end
  end
end
