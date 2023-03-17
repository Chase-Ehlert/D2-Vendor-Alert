import { hyperlink, SlashCommandBuilder } from "discord.js"
import 'dotenv/config'

export default {
    data: new SlashCommandBuilder()
        .setName('alert')
        .setDescription('Invites user to be added to the alert list'),
    async execute(interaction) {
        await interaction.reply(
            hyperlink(
                'Authorize D2 Vendor Alert',
                `https://www.bungie.net/en/oauth/authorize?client_id=${process.env.VENDOR_ALERT_OAUTH_CLIENT_ID}&response_type=code`
            )
        )
    }
}

// const { Client } = require('discord.js');

// const client = new Client();

// client.on('ready', () => {
//   console.log(`Logged in as ${client.user.tag}!`);
// });

// client.on('interactionCreate', async (interaction) => {
//   if (interaction.isCommand()) {
//     const userId = interaction.user.id; // Retrieve the user ID
//     const channelId = interaction.channelId; // Retrieve the channel ID

//     // Your command handling code goes here

//   }
// });

// client.login('your-bot-token');

