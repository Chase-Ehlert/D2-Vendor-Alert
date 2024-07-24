import { hyperlink, SlashCommandBuilder } from 'discord.js'
import { AlertCommandConfig } from './alert-command-config.js'
import { SlashCommand } from '../../../domain/discord/slash-command.js'

export class AlertCommand {
  constructor (private readonly config: AlertCommandConfig) {}

  setupCommand (): SlashCommand {
    return {
      data: new SlashCommandBuilder()
        .setName('alert')
        .setDescription('Invites user to be added to the alert list'),
      execute: this.interactionFollowUp()
    }
  }

  private interactionFollowUp () {
    return (interaction: { followUp: (arg0: string) => void }) => {
      if (this.config.oauthClientId !== undefined) {
        interaction.followUp(hyperlink(
          'Authorize D2 Vendor Alert',
          `https://www.bungie.net/en/oauth/authorize?client_id=${this.config.oauthClientId}&response_type=code`
        ))
      } else {
        throw new Error('OAuth Client Id is undefined for the Alert command!')
      }
    }
  }
}
