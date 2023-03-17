import discord, { Collection, Events } from 'discord.js'
import * as url from 'url'
import path from 'path'
import fileSystem from 'fs'
import * as database from '../database/users-operations.js'

database.setupDatabaseConnection()

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
        if (!interaction.isCommand()) return
        const command = interaction.client.commands.get(interaction.commandName)

        try {
            console.log('TESTING 1')
            await interaction.reply('What is your Bungie Net username? (i.e. "Guardian#1234")')
            console.log('TESTING 2')
            const filter = message => {
                console.log('messenger')
                console.log(interaction.user.id)
                message.author.id === interaction.user.id
            }
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 15000 })

            // my messages aren't being collected and the collector is ending

            collector.on('collect', async message => {
                console.log('WE ARE HERE')
                console.log(message)
                await database.addUser(message.content, interaction.user.id, interaction.channelId)
                await command.execute(interaction)
            })

            collector.on('end', () => {
                console.log('IT IS OVER')
            })
        } catch (error) {
            console.log(error)
            await interaction.reply({ content: 'Something went wrong!' })
        }
    })
}
