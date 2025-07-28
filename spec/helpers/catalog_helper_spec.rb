# frozen_string_literal: true

require "rails_helper"

describe CatalogHelper do
  describe '#links_media_urls' do
    let(:urls_json) { { value: [url_json], config: { label: 'label' } } }
    let(:result) { helper.links_media_urls(urls_json) }

    context 'when the link type is booking' do
      let(:urls_json) { { value: ['{"n":"foo","u":"https://example.com","t":"booking"}'], config: { label: 'test' } } }

      context 'with COVID restricted' do
        before do
          allow(Rails.application.credentials[Rails.env.to_sym]).to receive(:[]).with(:COVID_RESTRICTED).and_return(true)
        end

        it 'returns nil' do
          expect(result).to eq('')
        end
      end

      context 'without COVID_RESTRICTED' do
        before do
          allow(Rails.application.credentials[Rails.env.to_sym]).to receive(:[]).with(:COVID_RESTRICTED).and_return(false)
        end

        it 'returns a link with correct text and url' do
          expect(result).to have_link 'foo', href: 'https://example.com'
        end

        it 'has the correct classes' do
          expect(result).to have_css '.link-media-item, .booking'
        end

        it 'has the correct attributes' do
          expect(result).to have_selector '[data-link-type="booking"]'
          expect(result).to have_selector '[target="_blank"]'
          expect(result).to have_selector '[rel="noopener"]'
        end
      end
    end

    context 'when the link type is fulltext' do
      let(:urls_json) { { value: ['{"n":"foo","u":"https://example.com","t":"fulltext"}'], config: { label: 'test' } } }

      it 'returns a link with correct text and url' do
        expect(result).to have_link 'foo', href: 'https://example.com'
      end

      it 'has the correct classes' do
        expect(result).to have_css '.link-media-item, .fulltext'
      end

      it 'has the correct attributes' do
        expect(result).to have_selector '[data-link-type="fulltext"]'
        expect(result).to have_selector '[target="_blank"]'
        expect(result).to have_selector '[rel="noopener"]'
      end
    end

    context 'when the link type is link' do
      let(:urls_json) { { value: ['{"n":"foo","u":"https://example.com","t":"link", "l": "bar"}'], config: { label: 'test' } } }

      it 'returns a link with correct text and url' do
        expect(result).to have_link 'foo', href: 'https://example.com'
      end

      it 'has the correct classes' do
        expect(result).to have_css '.link-media-item, .link'
      end

      it 'has the correct attributes' do
        expect(result).to have_selector '[data-link-type="link"]'
        expect(result).to have_selector '[target="_blank"]'
        expect(result).to have_selector '[rel="noopener"]'
      end

      context 'when the n field is missing' do
        let(:urls_json) { { value: ['{"u":"https://example.com","t":"link", "l": "bar"}'], config: { label: 'test' } } }

        it 'returns a link with correct text and url' do
          expect(result).to have_link 'bar', href: 'https://example.com'
        end
      end

      context 'when the n and l fields are missing' do
        let(:urls_json) { { value: ['{"u":"https://example.com","t":"link"}'], config: { label: 'test' } } }

        it 'returns a link with correct text and url' do
          expect(result).to have_link 'https://example.com', href: 'https://example.com'
        end
      end
    end

    context 'when the link type is unknown' do
      let(:urls_json) { { value: ['{"n":"test","u":"https://example.com","t":"unknown"}'], config: { label: 'test' } } }

      it 'returns a link with correct text and url' do
        expect(result).to have_link 'test', href: 'https://example.com'
      end

      it 'has the correct classes' do
        expect(result).to have_css '.link-media-item, .unknown'
      end

      it 'has the correct attributes' do
        expect(result).to have_selector '[data-link-type="unknown"]'
        expect(result).to have_selector '[target="_blank"]'
        expect(result).to have_selector '[rel="noopener"]'
      end
    end
  end

  describe '#get_split_facet_display' do
    let(:result) { helper.get_split_facet_display('foo!baz') }

    it 'returns a string' do
      expect(result).to be_a(String)
    end

    it 'returns the correct string' do
      expect(result).to eq('baz')
    end
  end
end
