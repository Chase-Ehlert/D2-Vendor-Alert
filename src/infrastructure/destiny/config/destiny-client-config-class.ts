import { DestinyClientConfig } from './destiny-client-config.js'
import { DestinyConfig } from './destiny-config.js'

export class DestinyClientConfigClass implements DestinyClientConfig {
  constructor (
    public readonly apiKey?: string,
    public readonly oauthSecret?: string,
    public readonly oauthClientId?: string
  ) { }

  static fromConfig ({
    DESTINY_API_KEY: apiKey,
    DESTINY_OAUTH_SECRET: oauthSecret,
    DESTINY_OAUTH_CLIENT_ID: oauthClientId
  }: DestinyConfig): DestinyClientConfig {
    return new DestinyClientConfigClass(apiKey, oauthSecret, oauthClientId)
  }
}