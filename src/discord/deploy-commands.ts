import * as fs from 'fs'
import { REST, Routes } from 'discord.js'
import logger from '../utility/logger.js'
import { DeployCommandsConfig } from '../config/config.js'

class DeployCommands {
  private readonly config

  constructor (config: DeployCommandsConfig) {
    this.config = config
  }

  /**
   * Update registered slash commands
   */
  async registerCommands (): Promise<void> {
    const commands: any[] = []
    const commandFiles = fs.readdirSync('./src/discord/commands').filter(file => file.endsWith('.ts'))

    for (const file of commandFiles) {
      const command = await import(`./commands/${file}`)
      commands.push(command.default.data)
    }

    const rest = new REST({ version: '10' }).setToken(this.config.token)
    logger.info(`Started refreshing ${commands.length} application (/) commands.`)

    const data = await rest.put(
      Routes.applicationCommands(this.config.clientId),
      { body: commands }
    )

    logger.info(`Successfully reloaded ${String(Object(data).length)} application (/) commands.`)
  }
}

const deployCommands = new DeployCommands(new DeployCommandsConfig())
await deployCommands.registerCommands()
