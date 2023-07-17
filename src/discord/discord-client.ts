import * as path from 'path'
import * as fileSystem from 'fs'
import * as discord from 'discord.js'
import * as url from 'url'
import { MongoUserRepository } from '../database/mongo-user-repository.js'
import { DestinyService } from '../services/destiny-service.js'
import { config } from '../../config/config.js'
import { UserService } from '../services/user-service.js'
import { DestinyApiClient } from '../destiny/destiny-api-client.js'

const userRepo = new MongoUserRepository(new UserService())
const destinyService = new DestinyService(new DestinyApiClient())

export class DiscordClient {
  /**
     * Connect to the Discord Client
     */
  async setupDiscordClient (): Promise<void> {
    const discordClient: any = new discord.Client({
      intents: [
        discord.GatewayIntentBits.Guilds,
        discord.GatewayIntentBits.GuildMessages,
        discord.GatewayIntentBits.MessageContent,
        discord.GatewayIntentBits.GuildMessageReactions
      ]
    })

    discordClient.commands = new discord.Collection()
    discordClient.once(discord.Events.ClientReady, (eventClient: any) => {
      console.log(`Ready, logged in as ${String(eventClient.user.tag)}`)
    })
    discordClient.login(config.configModel.token)

    await this.setupSlashCommands(discordClient)
    await this.replyToSlashCommands(discordClient)
  }

  /**
     * Initialiaze registered slash commands
     */
  async setupSlashCommands (discordClient: any): Promise<void> {
    const commandsPath = path.join(url.fileURLToPath(new URL('./', import.meta.url)), 'commands')
    const commandsFiles = fileSystem.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
    console.log('jack')
    console.log(commandsPath)
    console.log('jill')
    console.log(commandsFiles)

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

  /**
     * Respond to any slash command and prompt user for profile information
     */
  async replyToSlashCommands (discordClient: any): Promise<void> {
    discordClient.on(discord.Events.InteractionCreate, async (interaction: any) => {
      if (!(interaction as discord.Interaction).isCommand()) return

      const command = interaction.client.commands.get(interaction.commandName)
      console.log(interaction.client.commands)

      try {
        await interaction.reply('What is your Bungie Net username? (i.e. "Guardian#1234")')
        const filter = (message: any): boolean => message.author.id === interaction.user.id
        if (interaction.channel !== null) {
          const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 20000 })

          collector.on('collect', async (message: any) => {
            await this.handleIncommingMessage(message, interaction, command)
          })

          collector.on('end', async (collected: any) => {
            if (collected.size === 0) {
              await interaction.followUp({
                content: 'The interaction has timed out. After you have found your Bungie Net username, try again.'
              })
            }
          })
        }
      } catch (error) {
        await interaction.reply({ content: 'Something went wrong!' })
      }
    })
  }

  /**
     * Validate user's submitted profile information
     */
  async handleIncommingMessage (message: any, interaction: any, command: any): Promise<void> {
    if (await this.doesBungieUsernameExistInDestiny(message)) {
      await userRepo.doesUserExist(message.content)
        ? await this.replyUserExists(interaction)
        : await this.addUserToAlertBot(message.content, interaction, command)
    } else {
      interaction.followUp({ content: 'That is not a valid Bungie Net username!' })
    }
  }

  /**
     * Reply back to user that they're profile information exists in the database already
     */
  async replyUserExists (interaction: any): Promise<void> {
    await interaction.followUp({ content: 'User already exists!' })
  }

  /**
     * Add user's profile information to database
     */
  async addUserToAlertBot (username: string, interaction: any, command: any): Promise<void> {
    const index = username.indexOf('#')
    const bungieUsername = username.substring(0, index)
    const bungieUsernameCode = username.substring(Number(index) + 1, username.length)

    await userRepo.addUser(bungieUsername, bungieUsernameCode, interaction.user.id, interaction.channelId)
    command.execute(interaction)
  }

  /**
     * Validate the user's submitted username exists in Destiny 2
     */
  async doesBungieUsernameExistInDestiny (message: any): Promise<boolean> {
    const index = message.content.indexOf('#')
    const bungieUsername = message.content.substring(0, index)
    const bungieUsernameCode = message.content.substring(Number(index) + 1, message.content.length)
    const response = await destinyService.getDestinyUsername(bungieUsername, bungieUsernameCode)

    return Object(response).length !== 0
  }
}
