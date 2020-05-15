# frozen_string_literal: true

require "rails_helper"

describe ApplicationHelper do
  describe "#json_str_to_array" do
    let(:items_json) do
      [
        '{ "c": "LPZ", "b": "5001570078", "i": "6162830", "n": null, "r": "catalog", "v": null }',
        '{ "c": "LPZ", "b": "5000509568", "i": "6162831", "n": null, "r": null, "v": "Suppl." }',
      ]
    end

    it 'returns an Array' do
      items_array = json_str_to_array(items_json)

      expect(items_array.class).to eql Array
    end

    it 'properly maps values' do
      items_array = [
        { "c" => "LPZ", "b" => "5001570078", "i" => "6162830", "n" => nil, "r" => "catalog", "v" => nil },
        { "c" => "LPZ", "b" => "5000509568", "i" => "6162831", "n" => nil, "r" => nil, "v" => "Suppl." },
      ]

      expect(json_str_to_array(items_json)).to eql items_array
    end
  end

  describe "#items_have_notes?" do
    let(:items_no_notes) do
      [
        { "c" => "LPZ", "b" => "5001570078", "i" => "6162830", "n" => nil, "r" => "catalog", "v" => nil },
        { "c" => "LPZ", "b" => "5000509568", "i" => "6162831", "n" => nil, "r" => nil, "v" => "Suppl." },
      ]
    end

    let(:items_1_notes) do
      [
        { "c" => "LPZ", "b" => "5001570078", "i" => "6162830", "n" => "notes are here", "r" => "catalog", "v" => nil },
        { "c" => "LPZ", "b" => "5000509568", "i" => "6162831", "n" => nil, "r" => nil, "v" => "Suppl." },
      ]
    end

    let(:items_all_notes) do
      [
        { "c" => "LPZ", "b" => "5001570078", "i" => "6162830", "n" => "notes are here", "r" => "catalog", "v" => nil },
        { "c" => "LPZ", "b" => "5000509568", "i" => "6162831", "n" => nil, "notes here too" => nil, "v" => "Suppl." },
        { "c" => "LPZ", "b" => "5000509568", "i" => "6162831", "n" => nil, "more notes" => nil, "v" => "Suppl." },
      ]
    end

    let(:no_items) do
      []
    end

    it "returns true or false for notes" do
      expect(items_have_notes?(items_no_notes)).to eql false
      expect(items_have_notes?(items_1_notes)).to eql true
      expect(items_have_notes?(items_all_notes)).to eql true
      expect(items_have_notes?(no_items)).to eql false
    end
  end
end
