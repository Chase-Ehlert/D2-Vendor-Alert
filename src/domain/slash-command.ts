import { SlashCommandBuilder } from 'discord.js'

export interface SlashCommand {
  data: SlashCommandBuilder
  execute: (interaction: { followUp: (arg0: string) => void }) => void
}
