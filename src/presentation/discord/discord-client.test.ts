import { DestinyApiClientConfig } from '../../infrastructure/destiny/destiny-api-client-config'
import { DiscordConfig } from './discord-config'
import { AxiosHttpClient } from '../../infrastructure/database/axios-http-client'
import { MongoUserRepository } from '../../infrastructure/database/mongo-user-repository'
import { DestinyApiClient } from '../../infrastructure/destiny/destiny-api-client'
import { AlertCommand } from './commands/alert-command'
import { DiscordClient } from './discord-client'
import { AlertCommandConfig } from './commands/alert-command-config.js'
import * as discord from 'discord.js'

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

describe('DiscordClient', () => {
  it('should setup the Discord client', async () => {
    const expectedDiscordConfig = { token: 'token' } as unknown as DiscordConfig
    const mongoUserRepo = new MongoUserRepository()
    const destinyApiClient = new DestinyApiClient(
      new AxiosHttpClient(),
      mongoUserRepo,
      {} satisfies DestinyApiClientConfig)
    const alertCommand = new AlertCommand({} satisfies AlertCommandConfig)
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

    expect(discordJsClient.once).toHaveBeenCalledWith(discord.Events.ClientReady, expect.any(Function))
    expect(discordJsClient.login).toHaveBeenCalledWith(expectedDiscordConfig.token)
    expect(discordJsClient.on).toHaveBeenCalledWith(discord.Events.InteractionCreate, expect.any(Function))
  })
})
