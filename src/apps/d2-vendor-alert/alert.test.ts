import { MongoUserRepository } from '../../infrastructure/persistence/mongo-user-repository'
import { Alert } from './alert'
import { DestinyClientConfig } from '../../infrastructure/destiny/config/destiny-client-config'
import { DiscordClientConfig } from '../../presentation/discord/configs/discord-client-config'
import { MongoDbServiceConfig } from '../../infrastructure/persistence/configs/mongo-db-service-config'
import { NotifierServiceConfig } from '../../infrastructure/services/configs/notifier-service-config'
import { DestinyClient } from '../../infrastructure/destiny/destiny-client'
import { MongoDbService } from '../../infrastructure/persistence/services/mongo-db-service'
import { NotifierService } from '../../infrastructure/services/notifier-service'
import { AlertManager } from '../../presentation/discord/alert-manager'
import { AlertCommand } from '../../presentation/discord/commands/alert-command'
import { DiscordClient } from '../../presentation/discord/discord-client'
import { OAuthWebController } from '../../presentation/web/o-auth-web-controller'
import { AlertCommandConfig } from '../../presentation/discord/commands/alert-command-config.js'
import express from 'express'
import path from 'path'
import * as url from 'url'
import metaUrl from '../../testing-helpers/url'
import { AxiosHttpClient } from '../../adapter/axios-http-client.js'

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
  return jest.fn(() => 'mockedMustacheEngine')
})

beforeAll(() => {
  global.console = {
    ...console,
    log: jest.fn()
  }
})

let mongoUserRepo: MongoUserRepository
let mongoDbService: MongoDbService
let alertManager: AlertManager
let destinyClient: DestinyClient
let discordClient: DiscordClient
let oAuthWebController: OAuthWebController
let mockApp: express.Application
let alert: Alert

beforeEach(() => {
  mongoUserRepo = new MongoUserRepository()
  mongoDbService = new MongoDbService({} satisfies MongoDbServiceConfig)
  alertManager = new AlertManager(
    new NotifierService(
      mongoUserRepo,
       { address: '' } satisfies NotifierServiceConfig,
       new AxiosHttpClient()
    ))
  destinyClient = new DestinyClient(
    new AxiosHttpClient(),
    mongoUserRepo,
      {} satisfies DestinyClientConfig
  )
  discordClient = new DiscordClient(
    mongoUserRepo,
    destinyClient,
    new AlertCommand({} satisfies AlertCommandConfig),
    {} satisfies DiscordClientConfig
  )
  oAuthWebController = new OAuthWebController(destinyClient, mongoUserRepo)
  mockApp = express()

  alert = new Alert(oAuthWebController, mongoDbService, discordClient, alertManager)

  oAuthWebController.handleOAuth = jest.fn()
  mongoDbService.connectToDatabase = jest.fn()
  discordClient.setupDiscordClient = jest.fn()
  alertManager.dailyReset = jest.fn()
})

describe('Alert', () => {
  it('should create and start the server', async () => {
    await alert.runApp(mockApp)

    expect(mockApp.engine).toHaveBeenCalledWith('mustache', 'mockedMustacheEngine')
    expect(mockApp.set).toHaveBeenCalledWith('view engine', 'mustache')
    expect(mockApp.set).toHaveBeenCalledWith(
      'views',
      path.join(url.fileURLToPath(new URL('../src/presentation', url.pathToFileURL(metaUrl).href)), 'views')
    )
    expect(mockApp.get).toHaveBeenCalledWith('/', expect.any(Function))
    expect(mockApp.listen).toHaveBeenCalledWith(3001, expect.any(Function))
    expect(mongoDbService.connectToDatabase).toHaveBeenCalled()
    expect(discordClient.setupDiscordClient).toHaveBeenCalled()
    expect(alertManager.dailyReset).toHaveBeenCalled()
  })

  it('should create and start the server in the correct order', async () => {
    const appEngineMock = jest.fn()
    const appSetMock = jest.fn()
    const appGetMock = jest.fn()
    const connectToDatabaseMock = jest.fn()
    const setupDiscordClientMock = jest.fn()
    const appListenMock = jest.fn()
    const alertMangerMock = jest.fn()

    mockApp.engine = appEngineMock
    mockApp.set = appSetMock
    mockApp.get = appGetMock
    mongoDbService.connectToDatabase = connectToDatabaseMock
    discordClient.setupDiscordClient = setupDiscordClientMock
    mockApp.listen = appListenMock
    alertManager.dailyReset = alertMangerMock

    await alert.runApp(mockApp)

    expect(appEngineMock).toHaveBeenCalledBefore(appSetMock)
    expect(appSetMock).toHaveBeenCalledTimes(2)
    expect(appSetMock).toHaveBeenCalledBefore(appGetMock)
    expect(appGetMock).toHaveBeenCalledBefore(connectToDatabaseMock)
    expect(connectToDatabaseMock).toHaveBeenCalledBefore(setupDiscordClientMock)
    expect(setupDiscordClientMock).toHaveBeenCalledBefore(appListenMock)
    expect(appListenMock).toHaveBeenCalledBefore(alertMangerMock)
    expect(alertMangerMock).toHaveBeenCalledAfter(appListenMock)
  })

  it('should log that the server is running', () => {
    const logSpy = jest.spyOn(console, 'log')
    const logServerIsRunning = (alert as any).logServerIsRunning()

    logServerIsRunning()

    expect(logSpy).toHaveBeenCalledWith('Server is running...')
  })
})
