# frozen_string_literal: true
# Methods added to this helper will be available to all templates in the hosting
# application
module Blacklight
  # A module for useful methods used in layout configuration
  module LayoutHelperBehavior
    ##
    # Classes added to a document's show content div
    # @return [String]
    def show_content_classes
      "#{main_content_classes} show-document"
    end

    ##
    # Classes added to a document's sidebar div
    # @return [String]
    def show_sidebar_classes
      sidebar_classes
    end

    ##
    # Classes used for sizing the main content of a Blacklight page
    # @return [String]
    def main_content_classes
      'content col-12 col-md-8 col-xl-9 order-2'
    end

    ##
    # Classes used for sizing the main content when full width
    # @return [String]
    def main_content_full_width_classes
      'content col-12'
    end

    ##
    # Classes used for sizing the sidebar content of a Blacklight page
    # @return [String]
    def sidebar_classes
      'page-sidebar col-12 col-md-4 col-xl-3 order-1 hidden-print'
    end

    ##
    # Class used for specifying main layout container classes. Can be
    # overwritten to return 'container-fluid' for Bootstrap full-width layout
    # @return [String]
    def container_classes
      'container-fluid'
    end
  end
end

