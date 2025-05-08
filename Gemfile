source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '~> 3.1.7'

gem 'bootsnap', '>= 1.17.1', require: false
gem 'httparty', '~> 0.17.3'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.11.5'
# Use PostgreSQL as the database for Active Record
gem 'pg', '~> 1.5.4'
gem 'puma', '~> 6.0'
gem 'rails', '~> 7.0.8'
gem 'rsolr', '~> 2.5'
gem 'rubocop-airbnb'
# gem 'twitter-typeahead-rails', '0.11.1.pre.corejavascript'
# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]
gem 'uglifier', '~> 4.2'
gem 'webpacker', '~> 5.4.4'

# Add net-http gem to resolve this issue: https://github.com/ruby/net-imap/issues/16
gem "net-http"

gem 'blacklight', '7.38.0'
gem 'blacklight_advanced_search', '~> 7.0'
gem 'blacklight-marc', '~> 8.1.2'
gem 'blacklight_range_limit', '8.1.0' # Something breaks in the views with 8.2.0 through 8.5.0
gem 'view_component', '>= 2.82.0', '< 4' # 4.x does not work as of 1/23/24

group :development do
  gem 'listen', '>= 3.0.5', '< 3.2'
  # Access an interactive console on exception pages or by calling 'console' anywhere in the code.
  gem 'web-console', '~> 4.2'
end

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
  gem 'capybara', '~> 3'
  gem 'rails-controller-testing'
  gem 'rspec-rails', '~> 5.0'
  gem 'solr_wrapper', '>= 0.3'
end
