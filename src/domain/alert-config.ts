import { Config } from './config.js';

export interface AlertConfig extends Config {
  DISCORD_NOTIFIER_ADDRESS?: string
}
