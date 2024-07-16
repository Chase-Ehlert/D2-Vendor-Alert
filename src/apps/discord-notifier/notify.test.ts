import { MongoUserRepository } from '../../infrastructure/persistence/mongo-user-repository'
import { DestinyClientConfig } from '../../infrastructure/destiny/config/destiny-client-config'
import { DiscordClientConfig } from '../../presentation/discord/configs/discord-client-config'
import { MongoDbServiceConfig } from '../../infrastructure/persistence/configs/mongo-db-service-config'
import { AxiosHttpClient } from '../../infrastructure/persistence/axios-http-client'
import { DestinyClient } from '../../infrastructure/destiny/destiny-client'
import { MongoDbService } from '../../infrastructure/persistence/services/mongo-db-service'
import { DiscordService } from '../../infrastructure/services/discord-service'
import { Notify } from './notify'
import { Vendor } from '../../domain/destiny/vendor'
import express from 'express'

const jsonMock = jest.fn()

jest.mock('express', () => {
  const express = jest.requireActual('express')
  return {
    __esModule: true,
    default: () => {
      const app = express()
      app.use = jest.fn()
      app.listen = jest.fn()
      app.post = jest.fn()
      return app
    }
  }
})

express.json = jsonMock

jest.mock('./../../testing-helpers/url', () => {
  return 'example'
})

beforeAll(() => {
  global.console = {
    ...console,
    log: jest.fn()
  }
})

let destinyClient: DestinyClient
let discordService: DiscordService
let mongoDbService: MongoDbService
let mockApp: express.Application
let notify: Notify

beforeEach(() => {
  destinyClient = new DestinyClient(
    new AxiosHttpClient(),
    new MongoUserRepository(),
      {} satisfies DestinyClientConfig
  )
  discordService = new DiscordService(
    new Vendor(destinyClient),
    new AxiosHttpClient(),
      {} satisfies DiscordClientConfig
  )
  mongoDbService = new MongoDbService({} satisfies MongoDbServiceConfig)
  mockApp = express()

  notify = new Notify(destinyClient, discordService, mongoDbService)

  destinyClient.checkRefreshTokenExpiration = jest.fn()
  discordService.compareModsForSaleWithUserInventory = jest.fn()
  mongoDbService.connectToDatabase = jest.fn()
})

describe('Notify', () => {
  it('should setup the service', async () => {
    await notify.notifyUsers(mockApp)

    expect(mockApp.use).toHaveBeenCalled()
    expect(jsonMock).toHaveBeenCalled()
    expect(mockApp.listen).toHaveBeenCalledWith(3002, expect.any(Function))
    expect(mockApp.post).toHaveBeenCalledWith('/notify', expect.any(Function))
    expect(mongoDbService.connectToDatabase).toHaveBeenCalled()
  })

  it('should setup the service in the correct order', async () => {
    const connectToDatabaseMock = jest.fn()
    const appUseMock = jest.fn()
    const appPostMock = jest.fn()
    const appListenMock = jest.fn()

    mongoDbService.connectToDatabase = connectToDatabaseMock
    mockApp.use = appUseMock
    mockApp.post = appPostMock
    mockApp.listen = appListenMock

    await notify.notifyUsers(mockApp)

    expect(connectToDatabaseMock).toHaveBeenCalledBefore(appUseMock)
    expect(appUseMock).toHaveBeenCalledBefore(appPostMock)
    expect(appPostMock).toHaveBeenCalledBefore(appListenMock)
    expect(appListenMock).toHaveBeenCalledAfter(appPostMock)
  })

  it('should log that the notifier service is running', () => {
    const logSpy = jest.spyOn(console, 'log')
    const logNotifierIsRunning = (notify as any).logNotifierIsRunning()

    logNotifierIsRunning()

    expect(logSpy).toHaveBeenCalledWith('Discord-Notifier is running...')
  })
})
