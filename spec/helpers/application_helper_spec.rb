# frozen_string_literal: true

require 'rails_helper'
require 'nokogiri'

describe ApplicationHelper do
  describe '#render_page_title' do
    before do
      allow(helper).to receive(:application_name).and_return('AppName')
      allow(helper).to receive(:site_subtitle).and_return('SiteSubtitle')
    end

    context 'when content_for(:page_title) is set' do
      it 'returns the content for :page_title' do
        helper.content_for(:page_title, 'Custom Page Title')
        expect(helper.render_page_title).to eq('Custom Page Title')
      end
    end

    context 'when @page_title is set' do
      it 'returns the @page_title' do
        assign(:page_title, 'Instance Page Title')
        expect(helper.render_page_title).to eq('Instance Page Title')
      end
    end

    context 'when neither content_for(:page_title) nor @page_title is set' do
      it 'returns a default page title based on application_name and site_subtitle' do
        expect(helper.render_page_title).to eq('AppName: SiteSubtitle')
      end
    end
  end

  describe '#site_subtitle' do
    it 'returns the site_subtitle' do
      allow(helper).to receive(:application_name).and_return('AppName')
      allow(helper).to receive(:site_subtitle).and_return('SiteSubtitle')
      expect(helper.site_subtitle).to eq('SiteSubtitle')
    end

    it 'returns nil if site_subtitle is not set' do
      allow(helper).to receive(:application_name).and_return('AppName')
      allow(helper).to receive(:site_subtitle).and_return(nil)
      expect(helper.site_subtitle).to eq(nil)
    end
  end

  describe '#get_number_search_results' do
    context 'when search results have a total count' do
      it 'returns the total number of search results' do
        response = {
          'response' => {
            'numFound' => 15
          }
        }
        expect(helper.get_number_search_results(response)).to eq '15'
      end
    end

    context 'when search results do not have a total count' do
      it 'returns 0 with delimiter' do
        response = {
          'response' => {}
        }
        expect(helper.get_number_search_results(response)).to eq '0'
      end
    end

    context 'when search results have a large total count' do
      it 'returns the total number of search results with delimiter' do
        response = {
          'response' => {
            'numFound' => 15000
          }
        }
        expect(helper.get_number_search_results(response)).to eq '15,000'
      end
    end
  end

  describe '#format_toc' do
    let(:options) { { value: values } }

    context 'when table of contents has less than primary_threshold items' do
      let(:values) { Array.new(10) { |i| "Item #{i + 1}" } }

      it 'renders the toc_container div with all items' do
        result = helper.format_toc(options)
        parsed_result = Nokogiri::HTML.fragment(result)

        expect(parsed_result.css('.toc_container .toc_list li').size).to eq 10
        expect(parsed_result.css('.toc_container .more-less')).to match_array []
        expect(parsed_result.css('.toc_container .more-max')).to match_array []
      end
    end

    context 'when table of contents has more than primary_threshold items' do
      let(:values) { Array.new(25) { |i| "Item #{i + 1}" } }

      it 'renders the toc_container div with primary items and hidden additional items' do
        result = helper.format_toc(options)
        parsed_result = Nokogiri::HTML.fragment(result)

        expect(parsed_result.css('.toc_container .toc_list')).not_to match_array []
        expect(parsed_result.css('.toc_container .toc_list li').size).to eq 25
        expect(parsed_result.css('.toc_container .toc_list').first.css('li').size).to eq 20
        expect(parsed_result.css('.toc_container .more-max')).not_to match_array []
        expect(parsed_result.css('.toc_container .more-max li').size).to eq 5
        expect(parsed_result.css('.toc_container .more-less')).not_to match_array []
      end
    end
  end

  describe '#json_str_to_hash' do
    let(:items_json) do
      "{\"p\":[{\"s\":\" > \",\"d\":\"United States Congress\"},{\"s\":\" > \",\"d\":\"House\",\"v\":\"United States Congress > House\"},{\"s\":\" > \",\"d\":\"Committee on Natural Resources\",\"v\":\"United States Congress > House > Committee on Natural Resources\"},{\"d\":\"Subcommittee on Oversight and Investigations\",\"v\":\"United States Congress > House > Committee on Natural Resources > Subcommittee on Oversight and Investigations\"}],\"r\":[\"author\"]}"
    end

    it 'returns a HashWithIndifferentAccess' do
      items_hash = json_str_to_hash(items_json)

      expect(items_hash.class).to eql ActiveSupport::HashWithIndifferentAccess
    end

    it 'properly maps values' do
      items_hash = {
        "p" => [
          { "s" => " > ", "d" => "United States Congress" },
          { "s" => " > ", "d" => "House", "v" => "United States Congress > House" },
          { "s" => " > ", "d" => "Committee on Natural Resources", "v" => "United States Congress > House > Committee on Natural Resources" },
          { "d" => "Subcommittee on Oversight and Investigations", "v" => "United States Congress > House > Committee on Natural Resources > Subcommittee on Oversight and Investigations" },
        ], "r" => ["author"],
      }

      expect(json_str_to_hash(items_json)).to eql items_hash
    end

    it 'elements accessible by string key' do
      expect(json_str_to_hash(items_json)["p"].first["s"]).to eql " > "
    end

    it 'elements accessible by hash key' do
      expect(json_str_to_hash(items_json)[:p].first[:s]).to eql " > "
    end

    context 'when value is blank' do
      let(:value) { '' }

      it 'returns nil' do
        result = helper.json_str_to_hash(value)
        expect(result).to be_nil
      end
    end

    context 'when value is a valid JSON string' do
      let(:value) { '{"key": "value", "number": 42}' }

      it 'returns a Ruby hash with the same key-value pairs' do
        result = helper.json_str_to_hash(value)
        expected_hash = { 'key' => 'value', 'number' => 42 }.with_indifferent_access

        expect(result).to eq(expected_hash)
      end
    end

    context 'when value is an invalid JSON string' do
      let(:value) { 'invalid json' }

      it 'raises a JSON::ParserError' do
        expect { helper.json_str_to_hash(value) }.to raise_error(JSON::ParserError)
      end
    end
  end

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

    context 'when value is blank' do
      let(:value) { [] }

      it 'returns nil' do
        result = helper.json_str_to_array(value)
        expect(result).to be_nil
      end
    end

    context 'when value is an array of valid JSON strings' do
      let(:value) { ['{"key": "value"}', '{"number": 42}'] }

      it 'returns an array of Ruby hashes with the same key-value pairs' do
        result = helper.json_str_to_array(value)
        expected_array = [
          { 'key' => 'value' }.with_indifferent_access,
          { 'number' => 42 }.with_indifferent_access
        ]

        expect(result).to eq(expected_array)
      end
    end

    context 'when value contains an invalid JSON string' do
      let(:value) { ['{"key": "value"}', 'invalid json'] }

      it 'raises a JSON::ParserError' do
        expect { helper.json_str_to_array(value) }.to raise_error(JSON::ParserError)
      end
    end
  end

  describe 'json_to_links' do
    let(:json_value) do
      [
        {
          "a": "Author",
          "b": "Before",
          "p": [
            { "d": "Part 1", "v": "Part1Value", "s": "," },
            { "d": "Part 2", "v": "Part2Value", "s": ";" }
          ],
          "r": ["Relationship"]
        }.with_indifferent_access
      ]
    end

    let(:options) do
      {
        value: json_value,
        config: { link_to_facet: "example_facet" }
      }
    end

    it 'returns HTML links with the correct structure' do
      result = helper.json_to_links(options)
      parsed_result = Nokogiri::HTML.fragment(result)

      expect(parsed_result.css('div.result__value__row').text.strip).to start_with('Before')
      expect(parsed_result.css('div.result__value__row a:nth-child(1)').text).to eq 'Part 1'
      expect(parsed_result.css('div.result__value__row span.separator:nth-child(2)').text).to eq ','
      expect(parsed_result.css('div.result__value__row a:nth-child(3)').text).to eq 'Part 2'
      expect(parsed_result.css('div.result__value__row span.separator:nth-child(4)').text).to eq ';'
      expect(parsed_result.css('div.result__value__row').text.strip).to end_with('Relationship')
    end
  end

  describe 'related_json_to_links' do
    let(:json_value) do
      [
        {
          b: "Before",
          p: [
            { d: "Display 1", s: ",", a: "Author1", t: "Title1", cn: "CN1", sn: "SN1" },
            { d: "Display 2", s: ";", a: "Author2", t: "Title2" }
          ]
        }.with_indifferent_access
      ]
    end

    let(:options) do
      {
        value: json_value,
        config: { label: "Related" }
      }
    end

    it 'returns HTML links with the correct structure' do
      result = helper.related_json_to_links(options)
      parsed_result = Nokogiri::HTML.fragment(result)

      expect(parsed_result.css('div.result__value__row').text.strip).to start_with('Before')
      expect(parsed_result.css('div.result__value__row a:nth-child(1)').text).to eq 'Display 1'
      # expect(parsed_result.css('div.result__value__row span.separator:nth-child(2)').text).to eq ','
      # expect(parsed_result.css('div.result__value__row a:nth-child(3)').text).to eq 'Display 2'
      # expect(parsed_result.css('div.result__value__row span.separator:nth-child(4)').text).to eq ';'
    end

    it 'generates the correct search URL for each link' do
      result = helper.related_json_to_links(options)
      parsed_result = Nokogiri::HTML.fragment(result)

      link_1 = parsed_result.css('div.result__value__row a:nth-child(1)')[0]['href']
      expect(link_1).to include(search_catalog_url)
      expect(link_1).to include('q=%22Author1%22+AND+%22Title1%22+AND+%22CN1%22+AND+%22SN1%22')
      expect(link_1).to include('search_field=text')

      # link_2 = parsed_result.css('div.result__value__row a:nth-child(3)')[0]['href']
      # expect(link_2).to include(search_catalog_url)
      # expect(link_2).to include('q=%22Author2%22+AND+%22Title2%22')
      # expect(link_2).to include('search_field=text')
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
