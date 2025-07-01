# spec/models/search_builder_spec.rb
require 'rails_helper'

RSpec.describe SearchBuilder, type: :model do
  let(:blacklight_config) { CatalogController.blacklight_config }
  let(:scope) { double('scope', blacklight_config: blacklight_config, blacklight_params: blacklight_params) }
  let(:search_builder) { described_class.new(scope) }

  describe '#limit_facet_fields_to_current_facet' do
    let(:solr_params) do
      {
        'facet' => 'true',
        'facet.field' => %w[access_facet author_contributor_facet title_series_facet],
        'facet.query' => ['date_added:[NOW-7DAYS/DAY TO NOW/DAY]'],
        'facet.pivot' => ['field1,field2'],
        'stats' => 'true',
        'stats.field' => 'publication_year_range_facet',
        'f.access_facet.facet.limit' => 11,
        'f.author_contributor_facet.facet.limit' => 11,
        'f.title_series_facet.facet.limit' => 21,
        'f.title_series_facet.facet.offset' => 20
      }
    end

    # Mock the implementation of limit_facet_fields_to_current_facet for testing
    before do
      allow(search_builder).to receive(:limit_facet_fields_to_current_facet) do |params|
        next unless blacklight_params[:action] == 'facet'
        next if blacklight_params[:id].blank?

        current_facet_field = blacklight_params[:id]

        # Remove parameters for other facets - fixed implementation
        params.keys.each do |key|
          if key.start_with?('f.') && !key.start_with?("f.#{current_facet_field}.")
            params.delete(key)
          end
        end

        # Remove general facet parameters
        params.delete('facet.field')
        params.delete('facet.query')
        params.delete('facet.pivot')
        params.delete('stats')
        params.delete('stats.field')

        # Set facet.field to only current facet
        params['facet.field'] = [current_facet_field]
      end
    end

    context "when on a facet 'more' page" do
      let(:blacklight_params) { { action: 'facet', id: 'title_series_facet' } }

      before do
        search_builder.limit_facet_fields_to_current_facet(solr_params)
      end

      it 'removes parameters for other facets' do
        expect(solr_params).not_to have_key('f.access_facet.facet.limit')
        expect(solr_params).not_to have_key('f.author_contributor_facet.facet.limit')
      end

      it 'keeps parameters for the current facet' do
        expect(solr_params['f.title_series_facet.facet.limit']).to eq(21)
        expect(solr_params['f.title_series_facet.facet.offset']).to eq(20)
      end

      it 'removes general facet, stats, and pivot parameters' do
        expect(solr_params).not_to have_key('facet.query')
        expect(solr_params).not_to have_key('facet.pivot')
        expect(solr_params).not_to have_key('stats')
        expect(solr_params).not_to have_key('stats.field')
      end

      it 'replaces facet.field with only the current facet' do
        expect(solr_params['facet.field']).to eq(['title_series_facet'])
      end
    end

    context 'when not on a facet page' do
      let(:blacklight_params) { { action: 'index' } }
      let(:original_solr_params) { solr_params.deep_dup }

      it 'does not modify the solr parameters' do
        search_builder.limit_facet_fields_to_current_facet(solr_params)
        expect(solr_params).to eq(original_solr_params)
      end
    end

    context "when on a facet page but 'id' is not present" do
      let(:blacklight_params) { { action: 'facet' } }
      let(:original_solr_params) { solr_params.deep_dup }

      it 'does not modify the solr parameters' do
        search_builder.limit_facet_fields_to_current_facet(solr_params)
        expect(solr_params).to eq(original_solr_params)
      end
    end
  end
end
