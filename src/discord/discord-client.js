import discord, { Collection, Events } from 'discord.js'
import * as url from 'url'
import path from 'path'
import fileSystem from 'fs'

export async function setupDiscordClient() {
    const discordClient = new discord.Client({ intents: [discord.GatewayIntentBits.Guilds] })

    discordClient.commands = new Collection()
    discordClient.once(discord.Events.ClientReady, eventClient => {
        console.log(`Ready, logged in as ${eventClient.user.tag}`)
    })
    discordClient.login(process.env.VENDOR_ALERT_TOKEN)

    setupSlashCommands(discordClient)
}

async function setupSlashCommands(discordClient) {
    const commandsPath = path.join(url.fileURLToPath(new URL('./', import.meta.url)), 'commands')
    const commandsFiles = fileSystem.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

    for (const file of commandsFiles) {
        const filePath = path.join(commandsPath, file)
        const command = await import(`./commands/${file}`)

        if ('data' in command.default && 'execute' in command.default) {
            discordClient.commands.set(command.default.data.name, command.default)
        } else {
            console.log(`The command at ${filePath} is missing "data" or "execute"`)
        }
    }

    discordClient.on(Events.InteractionCreate, async interaction => {
        const command = interaction.client.commands.get(interaction.commandName)

        try {
            await command.execute(interaction)
        } catch (error) {
            console.log(error)
            await interaction.reply({ content: 'Something went wrong!' })
        }
    })
}
