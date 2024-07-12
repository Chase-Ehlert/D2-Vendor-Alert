import { DestinyClientConfig } from '../../infrastructure/destiny/config/destiny-client-config'
import { DiscordClientConfig } from './configs/discord-client-config'
import { AxiosHttpClient } from '../../infrastructure/persistence/axios-http-client'
import { MongoUserRepository } from '../../infrastructure/persistence/mongo-user-repository'
import { DestinyClient } from '../../infrastructure/destiny/destiny-client'
import { AlertCommand } from './commands/alert-command'
import { DiscordClient } from './discord-client'
import { AlertCommandConfig } from './commands/alert-command-config.js'
import * as discord from 'discord.js'
import { SlashCommand } from './commands/slash-command.js'

jest.mock('./../../testing-helpers/url', () => {
  return 'example'
})

jest.mock('discord.js', () => ({
  Client: jest.fn(() => ({
    commands: new Map(),
    on: jest.fn(),
    once: jest.fn(),
    login: jest.fn()
  })),
  Collection: jest.fn(() => new Map()),
  Events: {
    ClientReady: 'ready'
  },
  GatewayIntentBits: {
    Guilds: 1,
    GuildMessages: 2,
    MessageContent: 4,
    GuildMessageReactions: 8
  }
}))

beforeAll(() => {
  global.console = {
    ...console,
    log: jest.fn()
  }
})

describe('DiscordClient', () => {
  const expectedDiscordConfig = { token: 'token' } as unknown as DiscordClientConfig
  const mongoUserRepo = new MongoUserRepository()
  const destinyClient = new DestinyClient(
    new AxiosHttpClient(),
    mongoUserRepo,
    {} satisfies DestinyClientConfig)
  const alertCommand = new AlertCommand({} satisfies AlertCommandConfig)
  const discordClient = new DiscordClient(
    mongoUserRepo,
    destinyClient,
    alertCommand,
    expectedDiscordConfig
  )

  it('should setup the Discord client', async () => {
    const discordJsClient: any = new discord.Client({
      intents: [
        discord.GatewayIntentBits.Guilds,
        discord.GatewayIntentBits.GuildMessages,
        discord.GatewayIntentBits.MessageContent,
        discord.GatewayIntentBits.GuildMessageReactions
      ]
    })
    jest.spyOn(alertCommand, 'setupCommand').mockReturnValue(
      { data: {}, execute: {} } as unknown as SlashCommand
    )

    await discordClient.setupDiscordClient(discordJsClient)

    expect(discordJsClient.once).toHaveBeenCalledWith(discord.Events.ClientReady, expect.any(Function))
    expect(discordJsClient.login).toHaveBeenCalledWith(expectedDiscordConfig.token)
    expect(discordJsClient.on).toHaveBeenCalledWith(discord.Events.InteractionCreate, expect.any(Function))
  })

  it('should log that the Discord client is ready', () => {
    const logDiscordClientIsReady = (discordClient as any).logDiscordClientIsReady()
    const logSpy = jest.spyOn(console, 'log')
    const expectedTag = '1234'
    const eventClient = {
      user: {
        tag: expectedTag
      }
    }

    logDiscordClientIsReady(eventClient)

    expect(logSpy).toHaveBeenCalledWith(`Ready, logged in as ${eventClient.user.tag}`)
  })

  it('should reply to slash commands', () => {
    const command = {} as unknown as SlashCommand
    const mockMessageCollector = {
      on: jest.fn()
    }
    const interaction: Partial<discord.ChatInputCommandInteraction> = {
      reply: jest.fn(),
      valueOf: jest.fn(),
      isCommand: jest.fn(),
      client: new discord.Client({} as unknown as discord.ClientOptions),
      channel: {
        createMessageCollector: jest.fn().mockReturnValue(mockMessageCollector)
      } as unknown as discord.TextBasedChannel
    }
    const isCommandSpy = jest.spyOn(interaction, 'isCommand').mockReturnValue(true)
    let getCommandSpy
    const replySpy = jest.spyOn(interaction, 'reply').mockResolvedValue({} as unknown as discord.InteractionResponse)
    const handleInteraction = (discordClient as any).handleInteraction()

    if (interaction.client !== undefined) {
      getCommandSpy = jest.spyOn(interaction.client.commands, 'get').mockReturnValue(command)
    }

    handleInteraction(interaction)

    expect(isCommandSpy).toHaveBeenCalled()
    expect(getCommandSpy).toHaveBeenCalled()
    expect(replySpy).toHaveBeenCalledWith('What is your Bungie Net username? (i.e. "Guardian#1234")')
  })
})
