require_relative 'boot'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Discover
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 5.2
    # TODO: This is necessary to load Zeitwerk. Can remove when load_defaults version >= 6.0
    # TODO: look into zeitwork, things like range limit don't seem to be loading correctly with it enabled
    # config.autoloader = :zeitwerk

    # This tells Rails to use our routes for error handling instead of static error pages
    config.exceptions_app = routes

    # See https://github.com/projectblacklight/blacklight/issues/2768
    config.active_record.yaml_column_permitted_classes = [HashWithIndifferentAccess]

    config.middleware.use ActionDispatch::SSL, redirect: false

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration can go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded after loading
    # the framework and any gems in your application.
  end
end
