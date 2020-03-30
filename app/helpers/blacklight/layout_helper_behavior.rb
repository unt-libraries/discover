# frozen_string_literal: true
# Methods added to this helper will be available to all templates in the hosting
# application
module Blacklight
  # A module for useful methods used in layout configuration
  module LayoutHelperBehavior
    ##
    # Classes added to a document's sidebar div
    # @return [String]
    def show_sidebar_desktop_classes
      "d-none d-md-block col-md-3 col-xl-2 order-first show-thumbnail-tools"
    end

    ##
    # Classes added to a document's sidebar div
    # @return [String]
    def show_right_sidebar_desktop_classes
      "d-none d-lg-block col-lg-3 col-xl-3 order-last"
    end

    ##
    # Classes added to a document's sidebar div
    # @return [String]
    def show_sidebar_mobile_classes
      "d-md-none show-thumbnail-tools"
    end

    ##
    # # Classes added to a document's show breadcrumb and search div
    # @return [String]
    def show_breadcrumb_search_classes
      "show-breadcrumb-search"
    end

    ##
    # Classes added to a document's show content div
    # @return [String]
    def show_content_classes
      "show-document"
    end

    ##
    # Classes used for sizing the main content of a Blacklight page
    # @return [String]
    def main_content_classes
      'content col order-2'
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

