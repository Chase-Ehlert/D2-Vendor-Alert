import { REST, Routes } from 'discord.js'
import { AlertCommand } from './commands/alert-command'
import { DeployCommandsConfig } from '../../configs/deploy-commands-config'

export class DeployCommands {
  constructor (
    private readonly config: DeployCommandsConfig,
    private readonly alertCommand: AlertCommand
  ) { }

  /**
   * Update registered slash commands
   */
  async registerCommands (): Promise<void> {
    const commands: any[] = []
    const commandAlert = this.alertCommand.setupCommand()
    commands.push(commandAlert.data)

    const rest = new REST({ version: '10' }).setToken(String(this.config.token))
    console.log('Started refreshing the alert application (/) command.')

    const data = await rest.put(
      Routes.applicationCommands(String(this.config.clientId)),
      { body: commands }
    )

    console.log(`Successfully reloaded ${String(Object(data).length)} application (/) commands.`)
  }
}
