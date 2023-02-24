import { SlashCommandBuilder } from "discord.js"
import 'dotenv/config'

export default {
    data: new SlashCommandBuilder()
        .setName('alert')
        .setDescription('Invites user to be added to the alert list'),
    async execute(interaction) {
        const authorizeMessage = {
            title: 'Authorize D2VendorAlert',
            url: `https://www.bungie.net/en/oauth/authorize?client_id=${process.env.VENDOR_ALERT_OAUTH_CLIENT_ID}&response_type=code`
        }
        await interaction.reply(authorizeMessage)
    }
}
