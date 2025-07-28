# frozen_string_literal: true

module Blacklight
  module Icons
    # This is the remove (x) icon for the facets and constraints.
    # You can override the default svg by setting:
    #   Blacklight::Icons::RemoveComponent.svg = '<svg>your SVG here</svg>'
    class RemoveComponent < Blacklight::Icons::IconComponent
      self.svg = <<~SVG
        <svg class="svg-inline--fa fa-circle-xmark remove-icon" data-bs-toggle="tooltip" data-bs-title="Remove facet" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="circle-xmark" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg="">
          <path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"></path>
        </svg>
      SVG
    end
  end
end
