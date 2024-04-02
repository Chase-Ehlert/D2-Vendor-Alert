import * as discord from 'discord.js'
import logger from '../utility/logger.js'
import { UserRepository } from '../database/user-repository.js'
import { AlertCommand } from './commands/alert.js'
import { DiscordConfig } from './configs/discord-config.js'
import { DestinyApiClient } from '../destiny/destiny-api-client.js'

export class DiscordClient {
  constructor (
    private readonly database: UserRepository,
    private readonly destinyApiClient: DestinyApiClient,
    private readonly alertCommand: AlertCommand,
    private readonly config: DiscordConfig
  ) { }

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
      logger.info(`Ready, logged in as ${String(eventClient.user.tag)}`)
    })
    discordClient.login(this.config.token)

    await this.setupSlashCommands(discordClient)
    await this.replyToSlashCommands(discordClient)
  }

  /**
     * Initialiaze registered slash commands
     */
  setupSlashCommands (discordClient: any): void {
    const command = this.alertCommand.setupCommand()

    if ('data' in command && 'execute' in command) {
      discordClient.commands.set(command.data.name, command)
    } else {
      logger.info('The alert command is missing "data" or "execute"')
    }
  }

  /**
     * Respond to any slash command and prompt user for profile information
     */
  replyToSlashCommands (discordClient: any): void {
    discordClient.on(discord.Events.InteractionCreate, async (interaction: any) => {
      if (!(interaction as discord.Interaction).isCommand()) return

      const command = interaction.client.commands.get(interaction.commandName)

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
      await this.database.doesUserExist(message.content)
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

    await this.database.addUser(
      bungieUsername,
      bungieUsernameCode,
      interaction.user.id,
      interaction.channelId
    )
    command.execute(interaction)
  }

  /**
     * Validate the user's submitted username exists in Destiny 2
     */
  async doesBungieUsernameExistInDestiny (message: any): Promise<boolean> {
    const index = message.content.indexOf('#')
    const bungieUsername = message.content.substring(0, index)
    const bungieUsernameCode = message.content.substring(Number(index) + 1, message.content.length)
    const response = await this.destinyApiClient.getDestinyUsername(bungieUsername, bungieUsernameCode)

    return response.length !== 0
  }
}
