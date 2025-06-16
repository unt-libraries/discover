require 'rails_helper'

RSpec.describe "ErrorsController", type: :request do
  describe "GET /404" do
    context "when requesting HTML format" do
      it "returns an HTTP 404 status and renders the not_found template using the blacklight layout" do
        get not_found_path
        expect(response).to have_http_status(:not_found)
        expect(response).to render_template(:not_found)
        expect(response).to render_template(layout: 'blacklight')
      end
    end

    context "when requesting JSON format" do
      it "returns an HTTP 404 status with an empty body" do
        get not_found_path, as: :json
        expect(response).to have_http_status(:not_found)
        expect(response.body).to be_empty
      end
    end
  end

  describe "GET /500" do
    context "when requesting HTML format" do
      it "returns an HTTP 500 status and renders the internal_server_error template using the blacklight layout" do
        get internal_server_error_path
        expect(response).to have_http_status(:internal_server_error)
        expect(response).to render_template(:internal_server_error)
        expect(response).to render_template(layout: 'blacklight')
      end
    end

    context "when requesting JSON format" do
      it "returns an HTTP 500 status with an empty body" do
        get internal_server_error_path, as: :json
        expect(response).to have_http_status(:internal_server_error)
        expect(response.body).to be_empty
      end
    end
  end
end
