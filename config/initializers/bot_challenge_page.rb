BotChallengePage.configure do |config|

  # Can globally disable in configuration if desired
  config.enabled = true

  # Get from CloudFlare Turnstile: https://www.cloudflare.com/application-services/products/turnstile/
  # Some testing keys are also available: https://developers.cloudflare.com/turnstile/troubleshooting/testing/
  config.cf_turnstile_sitekey = ENV['TURNSTILE_SITE_KEY'] || Rails.application.credentials[Rails.env.to_sym][:TURNSTILE_SITE_KEY] || "1x00000000000000000000AA"
  config.cf_turnstile_secret_key = ENV['TURNSTILE_SECRET_KEY'] || Rails.application.credentials[Rails.env.to_sym][:TURNSTILE_SECRET_KEY] || "1x0000000000000000000000000000000AA"

  # Testing keys
  # Always pass testing sitekey: "1x00000000000000000000AA"
  # config.cf_turnstile_sitekey = "1x00000000000000000000AA"
  # Always pass testing secret_key: "1x0000000000000000000000000000000AA"
  # config.cf_turnstile_secret_key = "1x0000000000000000000000000000000AA"


  # For rate-limiting, we need a rails cache store that keeps state, by default
  # will use `config.action_controller.cache_store` or Rails.cache, but if you'd
  # like to use a separate store database, eg. :
  # config.store = ActiveSupport::Cache::RedisCacheStore.new(url: "...")

  # Filter to omit requests from bot challenge control, executed in controller instance context
  #
  config.skip_when = ->(config) {
    # Skip when the IP is on the whitelist
    whitelist_value =
      ENV["TURNSTILE_IP_WHITELIST"].presence ||
      Rails.application.credentials.dig(Rails.env.to_sym, :TURNSTILE_IP_WHITELIST)

    cidrs = case whitelist_value
            when String then whitelist_value.split(",").map(&:strip).reject(&:blank?)
            when Array then whitelist_value.map(&:to_s).map(&:strip).reject(&:blank?)
            else []
            end

    forwarded_for = request.headers["X-Forwarded-For"].to_s
    client_ip_from_proxy = forwarded_for.split(",").first.to_s.strip
    client_ip = client_ip_from_proxy.presence || request.remote_ip

    request_ip = IPAddr.new(client_ip)
    cidrs.map { |cidr| IPAddr.new(cidr) }.any? { |range| range.include?(request_ip) }

  #   # maybe you want to globally exempt a heartbeat path
  #   current_page?(rails_health_check_path) ||
  #
  #   # Here's a way to identify browser `fetch` API requests; note
  #   # it can be faked by an "attacker" so you might not want to do this globally
  #   (request.headers["sec-fetch-dest"] == "empty") ||
  #
  #   # Maybe you want to exempt an uptime checker or other trusted bot
  #   #based on shared secret
  #   (headers["x-some-secret"] == "some_shared_secret")
  }

  # Hook after a bot challenge is presented, for logging or other
  # config.after_blocked = ->(bot_challenge_controller) {
  # }


  # How long will a challenge success exempt a session from further challenges?
  # config.session_passed_good_for = 36.hours


  # Functions like to Rails rate_limit `by` parameter, as a configured default.
  # A discriminator or identifier in which a client's requests will be bucketted
  # by rate limit. Normally this gem buckets by IP address subnets. Switching
  # to individual IPs would be much more generous:
  # config.default_limit_by = ->(config) {
  #   request.remote_ip
  #  }

  # When a "pass" cookie is saved, a fingerprint value is stored with it,
  # and subsequent uses of the pass need to have a request that matches
  # fingerprint. By default we insist on IP subnet match, and same user-agent
  # and other headers. But can be customized.
  # config.session_valid_fingerprint = ->(request) {
  #    # whatever
  # }

end
