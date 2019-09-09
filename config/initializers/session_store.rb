# To resolve authenticity_token error on 'show' view in development environment

Rails.application.config.session_store :cookie_store, key: '_discover_session'