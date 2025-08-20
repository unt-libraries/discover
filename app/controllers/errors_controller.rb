class ErrorsController < ApplicationController
  rescue_from ActionView::MissingTemplate do |exception|
    # Log the original error for debugging purposes
    Rails.logger.error("Caught a MissingTemplate error while rendering an error page: #{exception.message}")

    # For any non-HTML format that doesn't have a template, respond with just
    # the correct HTTP status code and an empty body.
    head :internal_server_error
  end

  def not_found
    respond_to do |format|
      format.html { render status: :not_found }
      format.any  { head :not_found }
    end
  end

  def internal_server_error
    respond_to do |format|
      format.html { render status: :internal_server_error }
      format.any  { head :internal_server_error }
    end
  end

end
