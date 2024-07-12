import { DiscordConfig } from '../../../presentation/discord/configs/discord-config.js';

export interface AlertConfig extends DiscordConfig {
  DISCORD_NOTIFIER_ADDRESS?: string
}
