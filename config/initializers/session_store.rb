# To resolve authenticity_token error on 'show' view in development environment
# From https://github.com/rails/rails/issues/24257#issuecomment-524573445
if Rails.env.production?
  Rails.application.config.session_store(
      :cookie_store,
      key: '_<app name>_session',
      domain: '.<domain>',
      secure: true
  )
end