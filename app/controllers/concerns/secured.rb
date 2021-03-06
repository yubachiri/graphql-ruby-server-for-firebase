require 'net/http'
require 'uri'

module Secured
  extend ActiveSupport::Concern

  private

  def authenticate_api_key!
    head :unauthorized and return if request.headers['X-API-KEY'] != ENV.fetch('API_KEY')
  end

  def http_token
    if request.headers['Authorization'].present?
      request.headers['Authorization'].split(' ').last
    end
  end

  # TODO:
  #  check email_verified
  #  check exp
  def auth_token
    @auth_token ||= JWT.decode(http_token, nil,
                               true, # Verify the signature of this token
                               algorithm: 'RS256',
                               iss: ENV.fetch('ID_ISSUER'),
                               verify_iss: true,
                               aud: ENV.fetch('ID_API_AUDIENCE'),
                               verify_aud: true) do |header|
      jwks_raw = Net::HTTP.get URI(ENV.fetch('ID_JWKS_URL'))
      jwks_hash = JSON.parse(jwks_raw)
      signing_input = jwks_hash[header['kid']]
      cert = OpenSSL::X509::Certificate.new(signing_input)
      cert.public_key
    end
  rescue JWT::VerificationError, JWT::DecodeError
    [{}]
  end

  def identity_is_valid?
    auth_token.first.present?
  end

  def current_user
    return nil if user_params.nil?
    @current_user ||= User.prepare(user_params)
  end

  def user_signed_in?
    current_user.present?
  end

  def user_params
    ActionController::Parameters.new(auth_token.first).permit(:sub, :iss, :email).to_h.compact
  end
end
