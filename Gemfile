source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '~> 2.7.8'

gem 'bootsnap', '>= 1.1.0', require: false
# Use CoffeeScript for .coffee assets and views
gem 'coffee-rails', '~> 4.2'
gem 'httparty', '~> 0.17.3'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.5'
# Use PostgreSQL as the database for Active Record
gem 'pg', '~> 1.5.3'
gem 'puma', '~> 4.2.1'
gem 'rails', '~> 5.2.4.2'
gem 'rsolr', '>= 1.0', '< 3'
gem 'rubocop-airbnb'
# gem 'twitter-typeahead-rails', '0.11.1.pre.corejavascript'
# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]
gem 'uglifier', '>= 2.7.2'
gem 'webpacker', '~> 5.4.3'

gem 'blacklight', '7.13.2'
gem 'blacklight_advanced_search', '>= 7.0.0', '< 8'
gem 'blacklight-marc', '>= 7.0.0', '< 8'
gem 'blacklight_range_limit', '>= 7', '< 8'
gem 'view_component', '= 2.82.0' # 3.0.0 required by blacklight does not work.

group :development do
  gem 'listen', '>= 3.0.5', '< 3.2'
  gem 'meta_request'
  # Access an interactive console on exception pages or by calling 'console' anywhere in the code.
  gem 'web-console', '>= 3.3.0'
end

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
  gem 'capybara'
  gem 'rspec-rails', '~> 4.0.0'
  gem 'solr_wrapper', '>= 0.3'
end
