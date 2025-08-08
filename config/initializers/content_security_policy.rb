# Be sure to restart your server when you modify this file.

# Define an application-wide content security policy.
# See the Securing Rails Applications Guide for more information:
# https://guides.rubyonrails.org/security.html#content-security-policy-header

Rails.application.configure do
  config.content_security_policy do |policy|
    policy.default_src :self, :https
    policy.font_src    :self, :https, :data
    policy.img_src     :self, :https, :data
    policy.object_src  :none
    policy.script_src  :self, :https
    policy.style_src   :self, :https, :unsafe_inline
    policy.connect_src :self, :https, 'lgapi-us.libapps.com', 'books.google.com'

    if Rails.env.development?
      policy.connect_src *policy.connect_src, "ws://#{ ViteRuby.config.host_with_port }",
                                              "wss://#{ ViteRuby.config.host_with_port }",
                                              "ws://localhost:#{ ViteRuby.config.port }",
                                              "wss://localhost:#{ ViteRuby.config.port }",
                                              "wss://*.library.unt.edu:#{ ViteRuby.config.port }"
      policy.script_src *policy.script_src, :unsafe_eval,
                                            "http://#{ ViteRuby.config.host_with_port }",
                                            "localhost:#{ ViteRuby.config.port }"
    end
    # Allow connections to the Vite dev server
    policy.script_src *policy.script_src, :blob if Rails.env.test?
  end

  # Generate session nonces for permitted importmap, inline scripts, and inline styles.
  config.content_security_policy_nonce_generator = ->(request) { request.session.id || SecureRandom.hex(16) }

  # Only generate nonces for scripts, not styles
  config.content_security_policy_nonce_directives = %w(script-src)

  # Report violations without enforcing the policy.
  # config.content_security_policy_report_only = true
end
