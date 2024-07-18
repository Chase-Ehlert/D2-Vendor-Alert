import { UserRepository } from '../../domain/user-repository.js'
import { DiscordConfig } from './discord-config.js'
import { DestinyApiClient } from '../../infrastructure/destiny/destiny-api-client.js'
import { AlertCommand } from './commands/alert-command.js'
import { SlashCommand } from '../../domain/slash-command.js'
import * as discord from 'discord.js'

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
  async setupDiscordClient (discordClient: discord.Client): Promise<void> {
    discordClient.commands = new discord.Collection()
    discordClient.once(
      discord.Events.ClientReady,
      this.logDiscordClientIsReady()
    )
    await discordClient.login(this.config.token)

    this.setupSlashCommands(discordClient)
    this.replyToSlashCommands(discordClient)
  }

  private logDiscordClientIsReady () {
    return (eventClient: { user: { tag: string } }) => {
      console.log(`Ready, logged in as ${eventClient.user.tag}`)
    }
  }

  /**
     * Initialiaze registered slash commands
     */
  private setupSlashCommands (discordClient: discord.Client<boolean>): void {
    const command = this.alertCommand.setupCommand()
    discordClient.commands.set(command.data.name, command)
  }

  /**
     * Respond to any slash command and prompt user for profile information
     */
  private replyToSlashCommands (discordClient: discord.Client<boolean>): void {
    discordClient.on(
      discord.Events.InteractionCreate,
      () => {
        try {
          this.handleInteraction()
        } catch (error) {
          throw new Error(error.message)
        }
      }
    )
  }

  private handleInteraction () {
    return async (interaction: discord.ChatInputCommandInteraction<discord.CacheType>) => {
      if (!interaction.isCommand()) return

      const command: SlashCommand = interaction.client.commands.get(interaction.commandName)

      try {
        await interaction.reply('What is your Bungie Net username? (i.e. "Guardian#1234")')
        const filter = (message: { author: { id: string } }): boolean => message.author.id === interaction.user.id
        if (interaction.channel !== null) {
          const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 20000 })

          collector.on(
            'collect',
            (message) => {
              this.handleIncommingMessage(message, interaction, command).catch(
                () => { throw new Error('Failed to handle incoming message from Discord!') }
              )
            })

          collector.on(
            'end',
            (collected) => {
              if (collected.size === 0) {
                interaction.followUp({
                  content: 'The interaction has timed out. After you have found your Bungie Net username, try again.'
                }).catch(() => { throw new Error('Failed to reply to interaction from Discord!') })
              }
            })
        }
      } catch (error) {
        await interaction.reply({ content: 'Something went wrong!' })
      }
    }
  }

  /**
     * Validate user's submitted profile information
     */
  private async handleIncommingMessage (
    message: discord.Message<boolean>,
    interaction: discord.ChatInputCommandInteraction<discord.CacheType>,
    command: SlashCommand): Promise<void> {
    if (await this.doesBungieUsernameExistInDestiny(message)) {
      await this.database.doesUserExist(message.content)
        ? await this.replyUserExists(interaction)
        : await this.addUserToAlertBot(message.content, interaction, command)
    } else {
      await interaction.followUp({ content: 'That is not a valid Bungie Net username!' })
    }
  }

  /**
     * Reply back to user that they're profile information exists in the database already
     */
  private async replyUserExists (interaction: discord.ChatInputCommandInteraction<discord.CacheType>): Promise<void> {
    await interaction.followUp({ content: 'User already exists!' })
  }

  /**
     * Add user's profile information to database
     */
  private async addUserToAlertBot (
    username: string,
    interaction: discord.ChatInputCommandInteraction<discord.CacheType>,
    command: SlashCommand
  ): Promise<void> {
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
  private async doesBungieUsernameExistInDestiny (message: discord.Message<boolean>): Promise<boolean> {
    const index = message.content.indexOf('#')
    const bungieUsername = message.content.substring(0, index)
    const bungieUsernameCode = message.content.substring(Number(index) + 1, message.content.length)

    return this.destinyApiClient.doesDestinyPlayerExist(bungieUsername, bungieUsernameCode)
  }
}
