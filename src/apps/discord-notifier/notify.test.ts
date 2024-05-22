import { MongoUserRepository } from '../../infrastructure/database/mongo-user-repository'
import { DestinyApiClientConfig } from '../../infrastructure/destiny/destiny-api-client-config'
import { DiscordConfig } from '../../presentation/discord/discord-config'
import { MongoDbServiceConfig } from '../../infrastructure/database/mongo-db-service-config'
import { AxiosHttpClient } from '../../infrastructure/database/axios-http-client'
import { DestinyApiClient } from '../../infrastructure/destiny/destiny-api-client'
import { MongoDbService } from '../../infrastructure/database/mongo-db-service'
import { DiscordService } from '../../infrastructure/services/discord-service'
import { Notify } from './notify'
import { Vendor } from '../../infrastructure/destiny/vendor'
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

let destinyApiClient: DestinyApiClient
let discordService: DiscordService
let mongoDbService: MongoDbService
let mockApp: express.Application
let notify: Notify

beforeEach(() => {
  destinyApiClient = new DestinyApiClient(
    new AxiosHttpClient(),
    new MongoUserRepository(),
      {} satisfies DestinyApiClientConfig
  )
  discordService = new DiscordService(
    new Vendor(destinyApiClient),
    new AxiosHttpClient(),
      {} satisfies DiscordConfig
  )
  mongoDbService = new MongoDbService({} satisfies MongoDbServiceConfig)
  mockApp = express()

  notify = new Notify(destinyApiClient, discordService, mongoDbService)

  destinyApiClient.checkRefreshTokenExpiration = jest.fn()
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

  it('should setup the post notify endpoint with checking the refresh token and comparing mods', async () => {
    const expectedFunction = (notify as any).notifyHandler(mockApp)
    const expectedUser = '123'
    const request = { body: { user: expectedUser } }

    await expectedFunction(request)

    expect(destinyApiClient.checkRefreshTokenExpiration).toHaveBeenCalledWith(expectedUser)
    expect(discordService.compareModsForSaleWithUserInventory).toHaveBeenCalledWith(expectedUser)
  })

  it('should log that the notifier service is running', () => {
    const logSpy = jest.spyOn(console, 'log')
    const logNotifierIsRunning = (notify as any).logNotifierIsRunning()

    logNotifierIsRunning()

    expect(logSpy).toHaveBeenCalledWith('Discord-Notifier is running...')
  })
})
