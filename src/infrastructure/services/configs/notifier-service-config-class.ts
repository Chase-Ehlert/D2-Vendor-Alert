import { AlertConfig } from './alert-config.js'
import { NotifierServiceConfig } from './notifier-service-config.js'

export class NotifierServiceConfigClass implements NotifierServiceConfig {
  constructor (public readonly address: string) { }
  static fromConfig ({ DISCORD_NOTIFIER_ADDRESS: address }: AlertConfig): NotifierServiceConfig {
    if (address !== undefined) {
      return new NotifierServiceConfigClass(address)
    } else {
      throw new Error('Discord notifier address is undefined!')
    }
  }
}
