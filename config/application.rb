require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Discover
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.0

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    # Application configuration can go into files in config/initializers, which is loaded later
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # This tells Rails to use our routes for error handling instead of static error pages
    config.exceptions_app = routes

    # See https://github.com/projectblacklight/blacklight/issues/2768
    config.active_record.yaml_column_permitted_classes = [HashWithIndifferentAccess]

    # This allows the app to run behind a load balancer that manages SSL certificates
    config.middleware.use ActionDispatch::SSL, redirect: false
  end
end
