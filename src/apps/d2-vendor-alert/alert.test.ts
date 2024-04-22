import { MongoUserRepository } from '../../infrastructure/database/mongo-user-repository'
import { Alert } from './alert'
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
import express from 'express'
import path from 'path'
import * as url from 'url'
import metaUrl from '../../testing-helpers/url'

jest.mock('./../../testing-helpers/url', () => {
  return 'example'
})

jest.mock('express', () => {
  return {
    __esModule: true,
    default: () => {
      const app = {
        engine: jest.fn(),
        set: jest.fn(),
        get: jest.fn(),
        listen: jest.fn()
      }
      return app
    }
  }
})

jest.mock('mustache-express', () => {
  return jest.fn(() => 'mockedMustacheEngine');
})

let mongoUserRepo: MongoUserRepository
let mongoDbService: MongoDbService
let alertManager: AlertManager
let destinyApiClient: DestinyApiClient
let discordClient: DiscordClient
let oAuthWebController: OAuthWebController
let mockApp: express.Application
let alert: Alert

beforeEach(() => {
  mongoUserRepo = new MongoUserRepository()
  mongoDbService = new MongoDbService({} satisfies MongoDbServiceConfig)
  alertManager = new AlertManager(new NotifierService(mongoUserRepo, {} satisfies NotifierServiceConfig))
  destinyApiClient = new DestinyApiClient(
    new AxiosHttpClient(),
    mongoUserRepo,
      {} satisfies DestinyApiClientConfig
  )
  discordClient = new DiscordClient(
    mongoUserRepo,
    destinyApiClient,
    new AlertCommand({} satisfies AlertConfig),
    {} satisfies DiscordConfig
  )
  oAuthWebController = new OAuthWebController(destinyApiClient, mongoUserRepo)
  mockApp = express()

  alert = new Alert(oAuthWebController, mongoDbService, discordClient, alertManager)

  oAuthWebController.handleOAuth = jest.fn()
  mongoDbService.connectToDatabase = jest.fn()
  discordClient.setupDiscordClient = jest.fn()
  alertManager.dailyReset = jest.fn()
})

describe('Alert', () => {
  it('should create the server', async () => {
    await alert.runApp(mockApp)

    expect(mockApp.engine).toHaveBeenCalledWith('mustache', 'mockedMustacheEngine')
    expect(mockApp.set).toHaveBeenCalledWith('view engine', 'mustache')
    expect(mockApp.set).toHaveBeenCalledWith(
      'views',
      path.join(url.fileURLToPath(new URL('../src/presentation', url.pathToFileURL(metaUrl).href)), 'views')
    )
    expect(mockApp.get).toHaveBeenCalledWith('/', expect.any(Function))
  })

  it('should setup the get root endpoint with the handleOAuth function', () => {
    const expectedFunction = (alert as any).rootHandler(mockApp)
    expectedFunction({}, { guardian: '123' })

    expect(oAuthWebController.handleOAuth).toBeCalledWith(
      mockApp,
      expect.anything(),
      (expect.any(String), { guardian: '123' })
    )
  })

  it('should start the server', async () => {
    await alert.runApp(mockApp)

    expect(mockApp.listen).toBeCalledWith(3001, expect.any(Function))
    expect(mongoDbService.connectToDatabase).toBeCalled()
    expect(discordClient.setupDiscordClient).toBeCalled()
    expect(alertManager.dailyReset).toBeCalled()
  })
})
