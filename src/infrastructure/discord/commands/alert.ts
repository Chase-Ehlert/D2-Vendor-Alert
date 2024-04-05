import { hyperlink, SlashCommandBuilder } from 'discord.js'
import { AlertConfig } from '../../../configs/alert-config'

export class AlertCommand {
  constructor (private readonly config: AlertConfig) {}

  setupCommand (): any {
    const oauthClientId = this.config.oauthClientId

    return {
      data: new SlashCommandBuilder()
        .setName('alert')
        .setDescription('Invites user to be added to the alert list'),
      // eslint-disable-next-line @typescript-eslint/require-await
      async execute (interaction: any) {
        interaction.followUp(hyperlink(
          'Authorize D2 Vendor Alert',
          `https://www.bungie.net/en/oauth/authorize?client_id=${String(oauthClientId)}&response_type=code`
        ))
      }
    }
  }
}
