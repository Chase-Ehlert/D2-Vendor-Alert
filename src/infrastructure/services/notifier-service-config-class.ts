import { AlertConfig } from '../../domain/alert-config.js'
import { NotifierServiceConfig } from './notifier-service-config.js'

export class NotifierServiceConfigClass implements NotifierServiceConfig {
  constructor (public readonly address?: string) { }
  static fromConfig ({ DISCORD_NOTIFIER_ADDRESS: address }: AlertConfig): NotifierServiceConfig {
    return new NotifierServiceConfigClass(address)
  }
}
