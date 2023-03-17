import { hyperlink, SlashCommandBuilder } from "discord.js"
import 'dotenv/config'
import * as database from '../../database/users-operations.js'

database.setupDatabaseConnection()

export default {
    data: new SlashCommandBuilder()
        .setName('alert')
        .setDescription('Invites user to be added to the alert list'),
    async execute(interaction) {
        interaction.followUp(hyperlink(
            'Authorize D2 Vendor Alert',
            `https://www.bungie.net/en/oauth/authorize?client_id=${process.env.VENDOR_ALERT_OAUTH_CLIENT_ID}&response_type=code`
        ))
    }
}
