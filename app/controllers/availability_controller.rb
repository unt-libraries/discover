class AvailabilityController < ApplicationController
  def items
    get_items_availability(params)
  end

  private

  def get_items_availability(params)
    @api_failures = 0
    @access_token = get_access_token
    item_ids = params[:availability][:item_id]
    @bib_id_string = item_ids.join(',')

    render json: get_items
  end

  def bearer_headers(headers = {})
    {
      :headers => {
        :authorization => "Bearer #{@access_token}",
      }.merge(headers),
    }
  end

  def basic_headers(encoded_credentials, headers = {})
    {
      :headers => {
        :authorization => "Basic #{encoded_credentials}",
      }.merge(headers),
    }
  end

  def check_access_token_expiry
    options = bearer_headers
    base_uri = "https://iii.library.unt.edu/iii/sierra-api/v6/info/token"

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
    response = HTTParty.post('https://iii.library.unt.edu/iii/sierra-api/v6/token', options)
    @access_token = response['access_token']

    set_session_token
  end

  def get_items
    options = bearer_headers
    options[:timeout] = 5 # seconds
    uri = "https://iii.library.unt.edu/iii/sierra-api/v6/items/?"
    bib_ids = "id=#{@bib_id_string}"
    fields = "fields=location,status,holdCount"
    parameters = "suppressed=false&deleted=false"
    response = HTTParty.get("#{uri}#{bib_ids}&#{fields}&#{parameters}", options)

    # TODO: Need to work on error handling
    api_error_codes = [
      102, # HTTP 500, Internal server error, Number format error
      123, # HTTP 401, Unauthorized, invalid_grant
    ]
    if api_error_codes.include?(response['code']) && @api_failures < 2
      @api_failures += 1
      get_new_access_token
      puts 'api failures', @api_failures
      puts 'api response', response
      get_items
    else
      puts 'api success'
      response
    end
  end
end
