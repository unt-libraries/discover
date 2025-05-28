require 'rails_helper'

RSpec.describe AvailabilityController, type: :controller do
  describe "POST #items" do
    let(:item_ids) { %w[123 456] }
    let(:params) { { availability: { item_id: item_ids } } }
    let(:mock_access_token) { "mock_token" }
    let(:mock_items_response) { { "item1" => "available", "item2" => "checked_out" }.to_json }

    before do
      allow(controller).to receive(:get_access_token).and_return(mock_access_token)
      allow(controller).to receive(:get_items).and_return(mock_items_response)
    end

    it "calls get_items_availability with params" do
      post :items, params: params, format: :json

      expect(assigns(:access_token)).to eq(mock_access_token)
      expect(assigns(:bib_id_string)).to eq(item_ids.join(','))
      expect(assigns(:api_failures)).to eq(0)
    end

    it "assigns @access_token" do
      post :items, params: params, format: :json
      expect(assigns(:access_token)).to eq(mock_access_token)
    end

    it "assigns @bib_id_string correctly" do
      post :items, params: params, format: :json
      expect(assigns(:bib_id_string)).to eq("123,456")
    end

    it "assigns @api_failures (initialized value)" do
      post :items, params: params, format: :json
      expect(assigns(:api_failures)).to eq(0)
    end

    it "renders the json returned by get_items" do
      post :items, params: params, format: :json
      expect(response.content_type).to eq("application/json; charset=utf-8")
      expect(response.body).to eq(mock_items_response)
    end

    it "returns a successful response" do
      post :items, params: params, format: :json
      expect(response).to be_successful
    end

    context "when get_access_token returns nil (simulating token failure)" do
      before do
        allow(controller).to receive(:get_access_token).and_return(nil)
      end

      it "still attempts to call get_items and renders its response" do
        post :items, params: params, format: :json
        expect(assigns(:access_token)).to be_nil
        expect(response.body).to eq(mock_items_response)
      end
    end
  end
end
