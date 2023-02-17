import { SlashCommandBuilder } from "discord.js"

const object = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong'),
    async execute(interaction) {
        await interaction.reply('Pong!')
    }
}


export { object }