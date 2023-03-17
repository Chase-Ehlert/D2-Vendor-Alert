import { hyperlink, SlashCommandBuilder } from "discord.js"
import 'dotenv/config'
import * as database from '../../database/users-operations.js'

database.setupDatabaseConnection()

export default {
    data: new SlashCommandBuilder()
        .setName('alert')
        .setDescription('Invites user to be added to the alert list'),
    async execute(interaction) {
        await interaction.reply('What is your Bungie Net username? (i.e. "Guardian#1234")')
        const filter = message => message.author.id === interaction.user.id
        const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 15000 })

        collector.on('collect', async message => {
            console.log('WE ARE HERE')
            console.log(message)
            await database.addUser(message.content, interaction.user.id, interaction.channelId)
            interaction.followUp(hyperlink(
                'Authorize D2 Vendor Alert',
                `https://www.bungie.net/en/oauth/authorize?client_id=${process.env.VENDOR_ALERT_OAUTH_CLIENT_ID}&response_type=code`
            ))
        })

        // collector.on('end', collected => {
        //     console.log(`Collected ${collected.size} items`)
        // })
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

