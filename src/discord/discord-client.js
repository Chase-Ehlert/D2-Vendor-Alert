import discord, { Collection, Events } from 'discord.js'
import * as url from 'url'
import path from 'path'
import fileSystem from 'fs'
import * as database from '../database/users-operations.js'
import axios from 'axios'

database.setupDatabaseConnection()

export async function setupDiscordClient() {
    const discordClient = new discord.Client({
        intents: [
            discord.GatewayIntentBits.Guilds,
            discord.GatewayIntentBits.GuildMessages,
            discord.GatewayIntentBits.MessageContent,
            discord.GatewayIntentBits.GuildMessageReactions
        ]
    })

    discordClient.commands = new Collection()
    discordClient.once(discord.Events.ClientReady, eventClient => {
        console.log(`Ready, logged in as ${eventClient.user.tag}`)
    })
    discordClient.login(process.env.VENDOR_ALERT_TOKEN)

    setupSlashCommands(discordClient)
    replyToSlashCommands(discordClient)
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
}

async function replyToSlashCommands(discordClient) {
    discordClient.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isCommand()) return
        const command = interaction.client.commands.get(interaction.commandName)

        try {
            await interaction.reply('What is your Bungie Net username? (i.e. "Guardian#1234")')
            const filter = message => message.author.id === interaction.user.id
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 20000 })

            collector.on('collect', async message => {
                // make post request to https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayerByBungieName/3
                // body is
                // {
                // "displayName": "DeathDealer699",
                // "displayNameCode": "6465"
                // }
                // check if Response is empty
                const index = message.content.indexOf('#')
                console.log(message.content.substring(0, index))
                console.log(message.content.substring(index+1, message.content.length))
                const { data } = await axios.post('https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayerByBungieName/3/', {
                    displayName: message.content.substring(0, index),
                    displayNameCode: message.content.substring(index + 1, message.content.length)
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': process.env.VENDOR_ALERT_API_KEY
                    }
                })

                console.log('DATA')
                console.log(data)

                data.Response.size === 0 ? console.log('true') : console.log('false')

                if (data.Response.size === 0) {
                    interaction.followUp({ content: 'That is not a valid Bungie Net username!' })
                } else {
                    await database.doesUserExist(message.content) ?
                        replyUserExists(interaction) :
                        addUserToAlertBot(command, message.content, interaction)
                }
            })

            collector.on('end', async (collected) => {
                if (collected.size === 0) {
                    await interaction.followUp({
                        content:
                            'The interaction has timed out. After you have found your Bungie Net username, try again.'
                    })
                }
            })
        } catch (error) {
            console.log(error)
            await interaction.reply({ content: 'Something went wrong!' })
        }
    })
}

async function replyUserExists(interaction) {
    console.log('User already exists')
    await interaction.followUp({ content: 'User already exists!' })
}

async function addUserToAlertBot(command, username, interaction) {
    console.log('Adding user to database')
    await database.addUser(username, interaction.user.id, interaction.channelId)
    await command.execute(interaction)
}
