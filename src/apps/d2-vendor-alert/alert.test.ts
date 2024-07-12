import { MongoUserRepository } from '../../infrastructure/persistence/mongo-user-repository'
import { Alert } from './alert'
import { DestinyClientConfig } from '../../infrastructure/destiny/config/destiny-client-config'
import { DiscordClientConfig } from '../../presentation/discord/configs/discord-client-config'
import { MongoDbServiceConfig } from '../../infrastructure/persistence/configs/mongo-db-service-config'
import { NotifierServiceConfig } from '../../infrastructure/services/configs/notifier-service-config'
import { AxiosHttpClient } from '../../infrastructure/persistence/axios-http-client'
import { DestinyClient } from '../../infrastructure/destiny/destiny-client'
import { MongoDbService } from '../../infrastructure/persistence/services/mongo-db-service'
import { NotifierService } from '../../infrastructure/services/notifier-service'
import { AlertManager } from '../../presentation/discord/alert-manager'
import { AlertCommand } from '../../presentation/discord/commands/alert-command'
import { DiscordClient } from '../../presentation/discord/discord-client'
import { OAuthWebController } from '../../presentation/web/o-auth-web-controller'
import { OAuthResponse } from '../../presentation/web/o-auth-response'
import { AlertCommandConfig } from '../../presentation/discord/commands/alert-command-config.js'
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

  it('should setup the get root endpoint with the handleOAuth function', () => {
    const rootHandler = (alert as any).rootHandler(mockApp)
    const expectedRequest = { query: { code: '123' } }
    const expectedResult: OAuthResponse = {
      render: (_template: string, _data: Record<string, any>) => {},
      sendFile: (_path: string) => {}
    }

    rootHandler(expectedRequest, expectedResult)

    expect(oAuthWebController.handleOAuth).toHaveBeenCalledWith(
      mockApp,
      expectedRequest,
      expectedResult
    )
  })

  it('should log that the server is running', () => {
    const logSpy = jest.spyOn(console, 'log')
    const logServerIsRunning = (alert as any).logServerIsRunning()

    logServerIsRunning()

    expect(logSpy).toHaveBeenCalledWith('Server is running...')
  })
})
