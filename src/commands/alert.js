import { hyperlink, SlashCommandBuilder } from "discord.js"
import 'dotenv/config'

export default {
    data: new SlashCommandBuilder()
        .setName('alert')
        .setDescription('Invites user to be added to the alert list'),
    async execute(interaction) {
        await interaction.reply(
            hyperlink(
                'Authorize D2VendorAlert',
                `https://www.bungie.net/en/oauth/authorize?client_id=${process.env.VENDOR_ALERT_OAUTH_CLIENT_ID}&response_type=code`
            )
        )
    }
}
