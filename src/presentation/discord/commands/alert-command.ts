import { hyperlink, SlashCommandBuilder } from 'discord.js'
import { AlertCommandConfig } from '../../discord/commands/alert-command-config.js'
import { SlashCommand } from '../../../domain/slash-command.js'

export class AlertCommand {
  constructor (private readonly config: AlertCommandConfig) {}

  setupCommand (): SlashCommand {
    const oauthClientId = this.config.oauthClientId

    return {
      data: new SlashCommandBuilder()
        .setName('alert')
        .setDescription('Invites user to be added to the alert list'),
      execute (interaction: { followUp: (arg0: string) => void }): void {
        interaction.followUp(hyperlink(
          'Authorize D2 Vendor Alert',
          `https://www.bungie.net/en/oauth/authorize?client_id=${String(oauthClientId)}&response_type=code`
        ))
      }
    }
  }
}
