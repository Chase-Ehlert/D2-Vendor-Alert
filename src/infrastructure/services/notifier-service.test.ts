import { NotifierServiceConfig } from './notifier-service-config'
import { UserInterface } from '../../domain/user'
import { MongoUserRepository } from '../database/mongo-user-repository'
import { NotifierService } from './notifier-service'
import { AxiosHttpClient } from '../database/axios-http-client.js'
import { AxiosResponse } from 'axios'

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
})
