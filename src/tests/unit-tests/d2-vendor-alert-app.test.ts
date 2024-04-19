import { MongoUserRepository } from '../../infrastructure/database/mongo-user-repository'
import { Alert } from '../../apps/d2-vendor-alert/alert'
import { AlertConfig } from '../../configs/alert-config'
import { DestinyApiClientConfig } from '../../configs/destiny-api-client-config'
import { DiscordConfig } from '../../configs/discord-config'
import { MongoDbServiceConfig } from '../../configs/mongo-db-service-config'
import { NotifierServiceConfig } from '../../configs/notifier-service-config'
import { AxiosHttpClient } from '../../infrastructure/database/axios-http-client'
import { DestinyApiClient } from '../../infrastructure/destiny/destiny-api-client'
import { MongoDbService } from '../../infrastructure/services/mongo-db-service'
import { NotifierService } from '../../infrastructure/services/notifier-service'
import { AlertManager } from '../../presentation/discord/alert-manager'
import { AlertCommand } from '../../presentation/discord/commands/alert'
import { DiscordClient } from '../../presentation/discord/discord-client'
import { OAuthWebController } from '../../presentation/web/o-auth-web-controller'

jest.mock('./../helpers/url', () => {
  return 'example'
})

jest.mock('express', () => {
  const mockedExpress = (): Object => {
    return {
      engine: jest.fn(),
      set: jest.fn(),
      get: jest.fn(),
      listen: jest.fn()
    }
  }
  Object.defineProperty(mockedExpress, 'static', { value: jest.fn() });
  return mockedExpress;
})

describe('App', () => {
  it('should create the server', async () => {
    const mongoUserRepo = new MongoUserRepository()
    const mongoDbService = new MongoDbService({} satisfies MongoDbServiceConfig)
    const alertManager = new AlertManager(new NotifierService(mongoUserRepo, {} satisfies NotifierServiceConfig))
    const destinyApiClient = new DestinyApiClient(
      new AxiosHttpClient(),
      mongoUserRepo,
        {} satisfies DestinyApiClientConfig
    )
    const discordClient = new DiscordClient(
      mongoUserRepo,
      destinyApiClient,
      new AlertCommand({} satisfies AlertConfig),
      {} satisfies DiscordConfig
    )
    const oAuthWebController = new OAuthWebController(destinyApiClient, mongoUserRepo)
    const alert = new Alert(oAuthWebController, mongoDbService, discordClient, alertManager)

    mongoDbService.connectToDatabase = jest.fn()
    discordClient.setupDiscordClient = jest.fn()
    alertManager.dailyReset = jest.fn()

    await alert.runApp()

    expect(true).toBeTruthy()
  })
})
