import { DiscordClientConfig } from './discord-client-config.js'
import { Config } from '../../../domain/config.js'

export class DiscordClientConfigClass implements DiscordClientConfig {
  constructor (public readonly token?: string) { }

  static fromConfig ({ DISCORD_TOKEN: token }: Config): DiscordClientConfig {
    return new DiscordClientConfigClass(token)
  }
}
