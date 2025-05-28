require 'rails_helper'

RSpec.describe ApplicationController, type: :controller do
  controller do
    def index
      render html: ''
    end
  end

  describe "inheritance and included modules" do
    it "inherits from ActionController::Base" do
      expect(described_class.superclass).to eq(ActionController::Base)
    end

    it "includes Blacklight::Controller" do
      expect(described_class.ancestors).to include(Blacklight::Controller)
    end
  end
end
