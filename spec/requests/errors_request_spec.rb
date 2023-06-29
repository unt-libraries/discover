require 'rails_helper'

RSpec.describe "Errors", type: :request do
  describe "GET /404" do
    it "returns http not found" do
      get not_found_path
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "GET /500" do
    it "returns http internal server error" do
      get internal_server_error_path
      expect(response).to have_http_status(:internal_server_error)
    end
  end
end
