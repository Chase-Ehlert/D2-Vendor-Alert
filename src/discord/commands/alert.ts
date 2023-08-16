import { hyperlink, SlashCommandBuilder } from 'discord.js'
import { AlertConfig } from '../../config/config.js'

class AlertCommand {
  constructor (private readonly config: AlertConfig) {}

  setupCommand (): any {
    const oauthClientId = this.config.oauthClientId

    return {
      data: new SlashCommandBuilder()
        .setName('alert')
        .setDescription('Invites user to be added to the alert list'),
      async execute (interaction: any) {
        interaction.followUp(hyperlink(
          'Authorize D2 Vendor Alert',
          `https://www.bungie.net/en/oauth/authorize?client_id=${oauthClientId}&response_type=code`
        ))
      }
    }
  }
}

const alertCommand = new AlertCommand(new AlertConfig())

export default alertCommand.setupCommand()
