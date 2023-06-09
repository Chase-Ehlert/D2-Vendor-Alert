import { config } from './../../../config/config.js'
import { hyperlink, SlashCommandBuilder } from "discord.js"
import mongoose from 'mongoose'

mongoose.set('strictQuery', false)
mongoose.connect(
  `mongodb+srv://${config.databaseUser}:${config.databasePassword}@${config.databaseCluster}.mongodb.net/${config.databaseName}`
)

export default {
    data: new SlashCommandBuilder()
        .setName('alert')
        .setDescription('Invites user to be added to the alert list'),
    async execute(interaction) {
        interaction.followUp(hyperlink(
            'Authorize D2 Vendor Alert',
            `https://www.bungie.net/en/oauth/authorize?client_id=${config.oauthClientId}&response_type=code`
        ))
    }
}
