class ErrorsController < ApplicationController
  rescue_from ActionView::MissingTemplate do |exception|
    # Log the original error for debugging purposes
    Rails.logger.error("Caught a MissingTemplate error while rendering an error page: #{exception.message}")

    # For any non-HTML format that doesn't have a template, respond with just
    # the correct HTTP status code and an empty body.
    head status
  end

  def not_found
    render(:status => 404)
  end

  def internal_server_error
    render(:status => 500)
  end
end
