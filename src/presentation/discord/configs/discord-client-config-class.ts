import { DiscordClientConfig } from './discord-client-config.js'
import { DiscordConfig } from './discord-config.js'

export class DiscordClientConfigClass implements DiscordClientConfig {
  constructor (public readonly token?: string) { }

  static fromConfig ({ DISCORD_TOKEN: token }: DiscordConfig): DiscordClientConfig {
    return new DiscordClientConfigClass(token)
  }
}
