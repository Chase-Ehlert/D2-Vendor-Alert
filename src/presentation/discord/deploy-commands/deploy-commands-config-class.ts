import { DeployCommandsConfig } from './deploy-commands-config.js'
import { DiscordConfig } from './discord-config.js'

export class DeployCommandsConfigClass implements DeployCommandsConfig {
  constructor (
    public readonly token?: string,
    public readonly clientId?: string
  ) { }

  static fromConfig ({
    DISCORD_TOKEN: token,
    DISCORD_CLIENT_ID: clientId
  }: DiscordConfig): DeployCommandsConfig {
    return new DeployCommandsConfigClass(token, clientId)
  }
}
