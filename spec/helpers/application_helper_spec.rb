# frozen_string_literal: true

require "rails_helper"

describe ApplicationHelper do
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

  describe '#author_json_to_links' do
    let(:items_json) do
      {
        :value => [
          { "p" => [{ "d" => "France" }] },
          { "p" => [
            { "s" => " > ", "d" => "United States Congress" },
            { "s" => " > ", "d" => "Senate", "v" => "United States Congress > Senate" },
            {
              "d" => "Committee on Energy and Natural Resources",
              "v" => "United States Congress > Senate > Committee on Energy and Natural Resources",
            },
          ] },
          { "p" => [{ "d" => "Bullett, Gerald William, 1894-1958" }] },
          { "p" => [{ "d" => "Beethoven, Ludwig van, 1770-1827" }] },
          { "p" => [{ "d" => "Isidore of Seville" }] },
          { "p" => [{ "d" => "Fauré, Gabriel, 1845-1924" }] },
          { "p" => [{ "d" => "Poe, Edgar Allan, 1809-1849" }] },
          { "p" => [{ "d" => "Plato" }] },
          { "p" => [{ "d" => "Central Institute of Indian Languages" }] },
        ],
        :config => {
          :link_to_facet => 'author_contributor_facet',
        },
      }
    end

    let(:different_display_value) do
      {
        :value => [
          { "p" => [{ "d" => "France" }] },
          { "p" => [
            { "s" => " > ", "d" => "United States Congress" },
            { "s" => " > ", "d" => "Senate", "v" => "United States Congress > Senate" },
            {
              "d" => "Committee on Energy and Natural Resources",
              "v" => "United States Congress > Senate > Committee on Energy and Natural Resources",
            },
          ] },
        ],
        :config => {
          :link_to_facet => 'author_contributor_facet',
        },
      }
    end

    it 'outputs correct html' do
      output_html = '<a class="" data-toggle="tooltip" title="Search for France" ga-on="click" ga-event-category="Bib Record" ga-event-action="author_contributor_facet" ga-event-label="France" href="/?f[author_contributor_facet][]=France">France</a>' \
        '<br>' \
        '<a class="" data-toggle="tooltip" title="Search for United States Congress" ga-on="click" ga-event-category="Bib Record" ga-event-action="author_contributor_facet" ga-event-label="United States Congress" href="/?f[author_contributor_facet][]=United+States+Congress">United States Congress</a> &gt; <a class="" data-toggle="tooltip" title="Search for Senate" ga-on="click" ga-event-category="Bib Record" ga-event-action="author_contributor_facet" ga-event-label="United States Congress &gt; Senate" href="/?f[author_contributor_facet][]=United+States+Congress+%3E+Senate">Senate</a> &gt; <a class="" data-toggle="tooltip" title="Search for Committee on Energy and Natural Resources" ga-on="click" ga-event-category="Bib Record" ga-event-action="author_contributor_facet" ga-event-label="United States Congress &gt; Senate &gt; Committee on Energy and Natural Resources" href="/?f[author_contributor_facet][]=United+States+Congress+%3E+Senate+%3E+Committee+on+Energy+and+Natural+Resources">Committee on Energy and Natural Resources</a>' \
        '<br>' \
        '<a class="" data-toggle="tooltip" title="Search for Bullett, Gerald William, 1894-1958" ga-on="click" ga-event-category="Bib Record" ga-event-action="author_contributor_facet" ga-event-label="Bullett, Gerald William, 1894-1958" href="/?f[author_contributor_facet][]=Bullett%2C+Gerald+William%2C+1894-1958">Bullett, Gerald William, 1894-1958</a>' \
        '<br>' \
        '<a class="" data-toggle="tooltip" title="Search for Beethoven, Ludwig van, 1770-1827" ga-on="click" ga-event-category="Bib Record" ga-event-action="author_contributor_facet" ga-event-label="Beethoven, Ludwig van, 1770-1827" href="/?f[author_contributor_facet][]=Beethoven%2C+Ludwig+van%2C+1770-1827">Beethoven, Ludwig van, 1770-1827</a>' \
        '<br>' \
        '<a class="" data-toggle="tooltip" title="Search for Isidore of Seville" ga-on="click" ga-event-category="Bib Record" ga-event-action="author_contributor_facet" ga-event-label="Isidore of Seville" href="/?f[author_contributor_facet][]=Isidore+of+Seville">Isidore of Seville</a>' \
        '<br>' \
        '<a class="" data-toggle="tooltip" title="Search for Fauré, Gabriel, 1845-1924" ga-on="click" ga-event-category="Bib Record" ga-event-action="author_contributor_facet" ga-event-label="Fauré, Gabriel, 1845-1924" href="/?f[author_contributor_facet][]=Faur%C3%A9%2C+Gabriel%2C+1845-1924">Fauré, Gabriel, 1845-1924</a>' \
        '<br>' \
        '<a class="" data-toggle="tooltip" title="Search for Poe, Edgar Allan, 1809-1849" ga-on="click" ga-event-category="Bib Record" ga-event-action="author_contributor_facet" ga-event-label="Poe, Edgar Allan, 1809-1849" href="/?f[author_contributor_facet][]=Poe%2C+Edgar+Allan%2C+1809-1849">Poe, Edgar Allan, 1809-1849</a>' \
        '<br>' \
        '<a class="" data-toggle="tooltip" title="Search for Plato" ga-on="click" ga-event-category="Bib Record" ga-event-action="author_contributor_facet" ga-event-label="Plato" href="/?f[author_contributor_facet][]=Plato">Plato</a>' \
        '<br>' \
        '<a class="" data-toggle="tooltip" title="Search for Central Institute of Indian Languages" ga-on="click" ga-event-category="Bib Record" ga-event-action="author_contributor_facet" ga-event-label="Central Institute of Indian Languages" href="/?f[author_contributor_facet][]=Central+Institute+of+Indian+Languages">Central Institute of Indian Languages</a>'

      expect(author_json_to_links(items_json)).to eql output_html
    end

    it 'uses correct display value' do
      output_html = '<a class="" data-toggle="tooltip" title="Search for France" ga-on="click" ga-event-category="Bib Record" ga-event-action="author_contributor_facet" ga-event-label="France" href="/?f[author_contributor_facet][]=France">France</a>' \
        '<br>' \
        '<a class="" data-toggle="tooltip" title="Search for United States Congress" ga-on="click" ga-event-category="Bib Record" ga-event-action="author_contributor_facet" ga-event-label="United States Congress" href="/?f[author_contributor_facet][]=United+States+Congress">United States Congress</a> &gt; <a class="" data-toggle="tooltip" title="Search for Senate" ga-on="click" ga-event-category="Bib Record" ga-event-action="author_contributor_facet" ga-event-label="United States Congress &gt; Senate" href="/?f[author_contributor_facet][]=United+States+Congress+%3E+Senate">Senate</a> &gt; <a class="" data-toggle="tooltip" title="Search for Committee on Energy and Natural Resources" ga-on="click" ga-event-category="Bib Record" ga-event-action="author_contributor_facet" ga-event-label="United States Congress &gt; Senate &gt; Committee on Energy and Natural Resources" href="/?f[author_contributor_facet][]=United+States+Congress+%3E+Senate+%3E+Committee+on+Energy+and+Natural+Resources">Committee on Energy and Natural Resources</a>'
      expect(author_json_to_links(different_display_value)).to eql output_html
    end
  end

  describe '#title_json_to_links' do
    let(:items_json) do
      {
        :value => [
          { "a" => "United States Congress > House", "p" => [{ "d" => "Testing remote [United States Congress, House]", "v" => "testing_remote!Testing remote" }] },
          { "a" => "Isidore of Seville", "p" => [{ "s" => " > ", "d" => "Etymologiae [by Isidore of Seville]", "v" => "etymologiae!Etymologiae" }, { "s" => " > ", "d" => "Liber 3", "v" => "etymologiae_liber_3!Etymologiae > Liber 3" }, { "s" => " | ", "d" => "Capitulum 15-23", "v" => "etymologiae_liber_3_capitulum_15_23!Etymologiae > Liber 3 > Capitulum 15-23" }, { "d" => "English", "v" => "etymologiae_liber_3_capitulum_15_23_english!Etymologiae > Liber 3 > Capitulum 15-23 | English" }] },
          { "a" => "Fauré, Gabriel, 1845-1924", "p" => [{ "s" => " > ", "d" => "Nocturnes, piano [by Fauré, G.]", "v" => "nocturnes_piano_by_faure_g!Nocturnes, piano [by Fauré, G.]" }, { "d" => "No. 11, op. 104, no. 1, F♯ minor", "v" => "nocturnes_piano_by_faure_g_no_11_op_104_no_1_f_minor!Nocturnes, piano [by Fauré, G.] > No. 11, op. 104, no. 1, F♯ minor" }] },
          { "a" => "Poe, Edgar Allan, 1809-1849", "p" => [{ "s" => " | ", "d" => "Works [of Poe, E.A.] (Complete)", "v" => "works_of_poe_e_a_complete!Works [of Poe, E.A.] (Complete)" }, { "d" => "Hebrew, 1949", "v" => "works_of_poe_e_a_complete_hebrew_1949!Works [of Poe, E.A.] (Complete) | Hebrew, 1949" }] },
        ],
        :config => {
          :link_to_facet => 'title_series_facet',
        },
      }
    end

    let(:related_series) do
      {
        :value => [
          {
            "a" => "Central Institute of Indian Languages",
            "p" => [
              {
                "s" => " | ",
                "d" => "CIIL linguistic atlas series [Central Institute of Indian Languages]",
                "v" => "ciil_linguistic_atlas_series!CIIL linguistic atlas series",
              },
              {
                "d" => "1",
              }
            ],
          },
          { "p" => [{ "d" => "Wonders of man", "v" => "wonders_of_man!Wonders of man" }] },
          { "p" => [{ "d" => "Bibliographies of modern authors; no. 27 | ISSN: 0749-470X" }] },
        ],
        :config => {
          :link_to_facet => 'title_series_facet',
        },
      }
    end

    it 'outputs correct html' do
      output_html = '<a class="" data-toggle="tooltip" title="Search for Testing remote [United States Congress, House]" ga-on="click" ga-event-category="Bib Record" ga-event-action="title_series_facet" ga-event-label="testing_remote!Testing remote" href="/?f[author_contributor_facet][]=United+States+Congress+%3E+House&amp;f[title_series_facet][]=testing_remote%21Testing+remote">Testing remote [United States Congress, House]</a>' \
        '<br>' \
        '<a class="" data-toggle="tooltip" title="Search for Etymologiae [by Isidore of Seville]" ga-on="click" ga-event-category="Bib Record" ga-event-action="title_series_facet" ga-event-label="etymologiae!Etymologiae" href="/?f[author_contributor_facet][]=Isidore+of+Seville&amp;f[title_series_facet][]=etymologiae%21Etymologiae">Etymologiae [by Isidore of Seville]</a> &gt; <a class="" data-toggle="tooltip" title="Search for Liber 3" ga-on="click" ga-event-category="Bib Record" ga-event-action="title_series_facet" ga-event-label="etymologiae_liber_3!Etymologiae &gt; Liber 3" href="/?f[author_contributor_facet][]=Isidore+of+Seville&amp;f[title_series_facet][]=etymologiae_liber_3%21Etymologiae+%3E+Liber+3">Liber 3</a> &gt; <a class="" data-toggle="tooltip" title="Search for Capitulum 15-23" ga-on="click" ga-event-category="Bib Record" ga-event-action="title_series_facet" ga-event-label="etymologiae_liber_3_capitulum_15_23!Etymologiae &gt; Liber 3 &gt; Capitulum 15-23" href="/?f[author_contributor_facet][]=Isidore+of+Seville&amp;f[title_series_facet][]=etymologiae_liber_3_capitulum_15_23%21Etymologiae+%3E+Liber+3+%3E+Capitulum+15-23">Capitulum 15-23</a> | <a class="" data-toggle="tooltip" title="Search for English" ga-on="click" ga-event-category="Bib Record" ga-event-action="title_series_facet" ga-event-label="etymologiae_liber_3_capitulum_15_23_english!Etymologiae &gt; Liber 3 &gt; Capitulum 15-23 | English" href="/?f[author_contributor_facet][]=Isidore+of+Seville&amp;f[title_series_facet][]=etymologiae_liber_3_capitulum_15_23_english%21Etymologiae+%3E+Liber+3+%3E+Capitulum+15-23+%7C+English">English</a>' \
        '<br>' \
        '<a class="" data-toggle="tooltip" title="Search for Nocturnes, piano [by Fauré, G.]" ga-on="click" ga-event-category="Bib Record" ga-event-action="title_series_facet" ga-event-label="nocturnes_piano_by_faure_g!Nocturnes, piano [by Fauré, G.]" href="/?f[author_contributor_facet][]=Faur%C3%A9%2C+Gabriel%2C+1845-1924&amp;f[title_series_facet][]=nocturnes_piano_by_faure_g%21Nocturnes%2C+piano+%5Bby+Faur%C3%A9%2C+G.%5D">Nocturnes, piano [by Fauré, G.]</a> &gt; <a class="" data-toggle="tooltip" title="Search for No. 11, op. 104, no. 1, F♯ minor" ga-on="click" ga-event-category="Bib Record" ga-event-action="title_series_facet" ga-event-label="nocturnes_piano_by_faure_g_no_11_op_104_no_1_f_minor!Nocturnes, piano [by Fauré, G.] &gt; No. 11, op. 104, no. 1, F♯ minor" href="/?f[author_contributor_facet][]=Faur%C3%A9%2C+Gabriel%2C+1845-1924&amp;f[title_series_facet][]=nocturnes_piano_by_faure_g_no_11_op_104_no_1_f_minor%21Nocturnes%2C+piano+%5Bby+Faur%C3%A9%2C+G.%5D+%3E+No.+11%2C+op.+104%2C+no.+1%2C+F%E2%99%AF+minor">No. 11, op. 104, no. 1, F♯ minor</a>' \
        '<br>' \
        '<a class="" data-toggle="tooltip" title="Search for Works [of Poe, E.A.] (Complete)" ga-on="click" ga-event-category="Bib Record" ga-event-action="title_series_facet" ga-event-label="works_of_poe_e_a_complete!Works [of Poe, E.A.] (Complete)" href="/?f[author_contributor_facet][]=Poe%2C+Edgar+Allan%2C+1809-1849&amp;f[title_series_facet][]=works_of_poe_e_a_complete%21Works+%5Bof+Poe%2C+E.A.%5D+%28Complete%29">Works [of Poe, E.A.] (Complete)</a> | <a class="" data-toggle="tooltip" title="Search for Hebrew, 1949" ga-on="click" ga-event-category="Bib Record" ga-event-action="title_series_facet" ga-event-label="works_of_poe_e_a_complete_hebrew_1949!Works [of Poe, E.A.] (Complete) | Hebrew, 1949" href="/?f[author_contributor_facet][]=Poe%2C+Edgar+Allan%2C+1809-1849&amp;f[title_series_facet][]=works_of_poe_e_a_complete_hebrew_1949%21Works+%5Bof+Poe%2C+E.A.%5D+%28Complete%29+%7C+Hebrew%2C+1949">Hebrew, 1949</a>'

      expect(title_json_to_links(items_json)).to eql output_html
    end

    it 'doesn\'t link if missing v value' do
      output_html = '<a class="" data-toggle="tooltip" title="Search for CIIL linguistic atlas series [Central Institute of Indian Languages]" ga-on="click" ga-event-category="Bib Record" ga-event-action="title_series_facet" ga-event-label="ciil_linguistic_atlas_series!CIIL linguistic atlas series" href="/?f[author_contributor_facet][]=Central+Institute+of+Indian+Languages&amp;f[title_series_facet][]=ciil_linguistic_atlas_series%21CIIL+linguistic+atlas+series">CIIL linguistic atlas series [Central Institute of Indian Languages]</a> | 1' \
        '<br>' \
        '<a class="" data-toggle="tooltip" title="Search for Wonders of man" ga-on="click" ga-event-category="Bib Record" ga-event-action="title_series_facet" ga-event-label="wonders_of_man!Wonders of man" href="/?f[title_series_facet][]=wonders_of_man%21Wonders+of+man">Wonders of man</a>' \
        '<br>' \
        'Bibliographies of modern authors; no. 27 | ISSN: 0749-470X'

      expect(title_json_to_links(related_series)).to eql output_html
    end
  end
end
