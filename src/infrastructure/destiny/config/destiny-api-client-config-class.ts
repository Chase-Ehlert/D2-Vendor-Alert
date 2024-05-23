import { Config } from '../../../domain/config.js'
import { DestinyApiClientConfig } from './destiny-api-client-config.js'

export class DestinyApiClientConfigClass implements DestinyApiClientConfig {
  constructor (
    public readonly apiKey?: string,
    public readonly oauthSecret?: string,
    public readonly oauthClientId?: string
  ) { }

  static fromConfig ({
    DESTINY_API_KEY: apiKey,
    DESTINY_OAUTH_SECRET: oauthSecret,
    DESTINY_OAUTH_CLIENT_ID: oauthClientId
  }: Config): DestinyApiClientConfig {
    return new DestinyApiClientConfigClass(apiKey, oauthSecret, oauthClientId)
  }
}
