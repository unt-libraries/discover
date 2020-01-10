class AvailabilityController < ApplicationController
  def items
    get_items_availability(params)
  end

  private

  def get_items_availability(params)
    @api_failures = 0
    @access_token = get_access_token
    item_id = params[:availability][:item_id]
    item_string = item_id.join(',')

    render json: get_items(item_string)
  end

  def bearer_headers(headers = {})
    {
      :headers => {
        :authorization => "Bearer #{@access_token}",
      }.merge(headers)
    }
  end

  def basic_headers(encoded_credentials, headers = {})
    {
      :headers => {
        :authorization => "Basic #{encoded_credentials}"
      }.merge(headers)
    }
  end

  def check_access_token_expiry
    options = bearer_headers
    base_uri = "https://iii.library.unt.edu/iii/sierra-api/v5/info/token"

    HTTParty.get("#{base_uri}", options)
  end

  def session_token?
    session.key?(:sierra_access_token)
  end

  def get_session_token
    session[:sierra_access_token]
  end

  def set_session_token
    session[:sierra_access_token] = @access_token
  end

  def get_access_token
    session_token? ? get_session_token : get_new_access_token
  end

  def get_new_access_token
    sierra_key = Rails.application.credentials[Rails.env.to_sym][:SIERRA_API_KEY]
    sierra_secret = Rails.application.credentials[Rails.env.to_sym][:SIERRA_API_SECRET]
    encoded_credentials = Base64.encode64("#{sierra_key}:#{sierra_secret}")
    options = basic_headers(encoded_credentials)
    response = HTTParty.post('https://iii.library.unt.edu/iii/sierra-api/v5/token', options)
    @access_token = response['access_token']

    set_session_token
  end

  def get_items(bib_ids)
    options = bearer_headers
    uri = "https://iii.library.unt.edu/iii/sierra-api/v5/items/?"
    bib_ids = "id=#{bib_ids}"
    fields = "fields=location,status"
    response = HTTParty.get("#{uri}#{bib_ids}&#{fields}", options)

    # TODO: Need to work on error handling
    if response['code'] == 123 && @api_failures < 2
      @api_failures += 1
      get_new_access_token
      puts 'api failures', @api_failures
      get_items(bib_ids)
    else
      response
    end
  end
end