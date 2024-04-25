import { AlertConfig } from '../../configs/alert-config'
import { DestinyApiClientConfig } from '../../configs/destiny-api-client-config'
import { DiscordConfig } from '../../configs/discord-config'
import { AxiosHttpClient } from '../../infrastructure/database/axios-http-client'
import { MongoUserRepository } from '../../infrastructure/database/mongo-user-repository'
import { DestinyApiClient } from '../../infrastructure/destiny/destiny-api-client'
import { AlertCommand } from './commands/alert'
import { DiscordClient } from './discord-client'
import * as discord from 'discord.js'

jest.mock('./../../testing-helpers/url', () => {
  return 'example'
})

jest.mock('discord.js', () => ({
  Client: jest.fn(() => ({
    // Mock any methods or properties of the client if needed
    commands: new Map(),
    on: jest.fn(),
    once: jest.fn(),
    login: jest.fn()
  })),
  Collection: jest.fn(() => new Map()),
  Events: {
    ClientReady: 'ready' // Mocked Events
  },
  GatewayIntentBits: {
    Guilds: 1,
    GuildMessages: 2,
    MessageContent: 4,
    GuildMessageReactions: 8
  }
}));

describe('DiscordClient', () => {
  it('should setup the Discord client', async () => {
    const expectedDiscordConfig = { token: 'token' } as unknown as DiscordConfig
    const mongoUserRepo = new MongoUserRepository()
    const destinyApiClient = new DestinyApiClient(
      new AxiosHttpClient(),
      mongoUserRepo,
      {} satisfies DestinyApiClientConfig)
    const alertCommand = new AlertCommand({} satisfies AlertConfig)
    const discordClient = new DiscordClient(
      mongoUserRepo,
      destinyApiClient,
      alertCommand,
      expectedDiscordConfig
    )
    const discordJsClient: any = new discord.Client({
      intents: [
        discord.GatewayIntentBits.Guilds,
        discord.GatewayIntentBits.GuildMessages,
        discord.GatewayIntentBits.MessageContent,
        discord.GatewayIntentBits.GuildMessageReactions
      ]
    })

    alertCommand.setupCommand = jest.fn().mockReturnValue(
      {
        data: {},
        execute: {}
      }
    )

    await discordClient.setupDiscordClient(discordJsClient)

    expect(discordJsClient.once).toBeCalledWith(discord.Events.ClientReady, expect.any(Function))
    expect(discordJsClient.login).toBeCalledWith(expectedDiscordConfig.token)
    expect(discordJsClient.on).toBeCalledWith(discord.Events.InteractionCreate, expect.any(Function))
  })
})
