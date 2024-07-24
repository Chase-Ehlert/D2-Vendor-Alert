import { AlertCommandConfig } from './alert-command-config.js'
import { Config } from '../../../domain/config.js'

export class AlertCommandConfigClass implements AlertCommandConfig {
  constructor (public readonly oauthClientId?: string) { }

  static fromConfig ({ DESTINY_OAUTH_CLIENT_ID: oauthClientId }: Config): AlertCommandConfig {
    return new AlertCommandConfigClass(oauthClientId)
  }
}
