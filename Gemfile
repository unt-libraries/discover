source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '~> 3.4.3'

gem 'bootsnap', '>= 1.18.4', require: false
gem 'httparty', '~> 0.23.1'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.13.0'
# Use PostgreSQL as the database for Active Record
gem 'pg', '~> 1.5.9'
gem 'puma', '~> 6.6.0'
gem 'rails', '~> 7.0.8'
gem 'vite_rails'
gem 'rsolr', '~> 2.6.0'
gem 'rubocop-airbnb'
# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]

gem 'blacklight', '7.38.0'
gem 'blacklight_advanced_search', '~> 7.0'
gem 'blacklight-marc', '~> 8.1.2'
gem 'blacklight_range_limit', '8.1.0' # Something breaks in the views with 8.2.0 through 8.5.0

group :development do
  gem 'listen', '~> 3.9'
  # Access an interactive console on exception pages or by calling 'console' anywhere in the code.
  gem 'web-console', '~> 4.2'
end

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
  gem 'capybara', '~> 3'
  gem 'rails-controller-testing'
  gem 'rspec-rails', '~> 7.1'
  gem 'solr_wrapper', '>= 0.3'
  # drb removed from Ruby standard library in 3.4.0
  gem 'drb'
end
