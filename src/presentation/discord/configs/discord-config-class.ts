import { DiscordConfig } from './discord-config.js'
import { Config } from '../../../domain/config.js'

export class DiscordConfigClass implements DiscordConfig {
  constructor (
    public readonly DISCORD_TOKEN?: string,
    public readonly DISCORD_CLIENT_ID?: string
  ) { }

  static fromConfig ({
    DISCORD_TOKEN: token,
    DISCORD_CLIENT_ID: discordClientId
  }: Config): DiscordConfig {
    return new DiscordConfigClass(token, discordClientId)
  }
}
