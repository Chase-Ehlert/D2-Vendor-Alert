import { Config } from '../apps/config'

export interface AlertConfig extends Config {
  DISCORD_NOTIFIER_ADDRESS?: string
}
