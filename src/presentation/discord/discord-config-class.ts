import { DiscordConfig } from './discord-config.js'
import { Config } from '../../domain/config.js'

export class DiscordConfigClass implements DiscordConfig {
  constructor (public readonly token?: string) { }

  static fromConfig ({ DISCORD_TOKEN: token }: Config): DiscordConfig {
    return new DiscordConfigClass(token)
  }
}
