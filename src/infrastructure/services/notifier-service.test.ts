import { NotifierServiceConfig } from './configs/notifier-service-config'
import { UserInterface } from '../../domain/user/user'
import { MongoUserRepository } from '../persistence/mongo-user-repository'
import { NotifierService } from './notifier-service'
import { AxiosHttpClient } from '../persistence/axios-http-client.js'
import { AxiosResponse } from 'axios'

beforeAll(() => {
  global.console = {
    ...console,
    error: jest.fn()
  }
})

describe('NotifierService', () => {
  const expectedAddress = 'localhost'
  const mongoUserRepo = new MongoUserRepository()
  const axiosHttpClient = new AxiosHttpClient()
  const notifierService = new NotifierService(
    mongoUserRepo,
     { address: expectedAddress } satisfies NotifierServiceConfig,
     axiosHttpClient
  )

  it('should call the notifier service for every user', async () => {
    const userA = { bungieUsername: 'CoolDude' } as unknown as UserInterface
    const userB = { bungieUsername: 'CoolerDude' } as unknown as UserInterface
    const postSpy = jest.spyOn(axiosHttpClient, 'post').mockResolvedValue({} as unknown as AxiosResponse)
    const fetchAllUsersSpy = jest.spyOn(mongoUserRepo, 'fetchAllUsers').mockResolvedValue([userA, userB])

    await notifierService.alertUsersOfUnownedModsForSale()

    expect(fetchAllUsersSpy).toHaveBeenCalled()
    expect(postSpy).toHaveBeenCalledWith(
      `${expectedAddress}:3002/notify`,
      { user: userA },
      { headers: { 'Content-Type': 'application/json' } }
    )
    expect(postSpy).toHaveBeenCalledWith(
      `${expectedAddress}:3002/notify`,
      { user: userB },
      { headers: { 'Content-Type': 'application/json' } }
    )
    expect(postSpy).toHaveBeenCalledTimes(2)
  })

  it('should print error info for any user who wasnt alerted', async () => {
    const userA = { bungieUsername: 'CoolDude' } as unknown as UserInterface
    const error = new Error('Bad stuff')
    const customObject = {}
    const consoleSpy = jest.spyOn(console, 'error')

    Error.captureStackTrace(error, customObject.constructor)
    axiosHttpClient.post = jest.fn().mockRejectedValue(error)
    mongoUserRepo.fetchAllUsers = jest.fn().mockResolvedValue([userA])

    await notifierService.alertUsersOfUnownedModsForSale()

    expect(consoleSpy).toHaveBeenCalledWith(`Failed to alert user ${userA.bungieUsername}`)
    expect(consoleSpy).toHaveBeenCalledWith(error.stack)
  })

  it('should throw an error when the address on the config is undefined', async () => {
    const notifierService = new NotifierService(
      new MongoUserRepository(),
      { } as unknown as NotifierServiceConfig,
      new AxiosHttpClient()
    )

    try {
      await notifierService.alertUsersOfUnownedModsForSale()
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Notifier address is undefined!')
    }
  })
})
