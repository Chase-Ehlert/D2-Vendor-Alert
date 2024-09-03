import { AlertCommandConfig } from './alert-command-config.js'
import { DestinyConfig } from '../../../infrastructure/destiny/config/destiny-config.js'

export class AlertCommandConfigClass implements AlertCommandConfig {
  constructor (public readonly oauthClientId?: string) { }

  static fromConfig ({ DESTINY_OAUTH_CLIENT_ID: oauthClientId }: DestinyConfig):
  AlertCommandConfig {
    return new AlertCommandConfigClass(oauthClientId)
  }
}
