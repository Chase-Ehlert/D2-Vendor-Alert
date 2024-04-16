import { NotifierServiceConfig } from '../../configs/notifier-service-config.js'
import { UserInterface } from '../../domain/user.js'
import { MongoUserRepository } from '../../infrastructure/database/mongo-user-repository.js'
import axios from 'axios'
import { NotifierService } from '../../infrastructure/services/notifier-service.js'

describe('NotifierService', () => {
  const mongoUserRepo = new MongoUserRepository()
  const expectedAddress = 'localhost'
  const notifierService = new NotifierService(
    mongoUserRepo,
     { address: expectedAddress } satisfies NotifierServiceConfig
  )

  it('should call the notifier service for every user', async () => {
    const userA = { bungieUsername: 'CoolDude' } as unknown as UserInterface
    const userB = { bungieUsername: 'CoolerDude' } as unknown as UserInterface

    mongoUserRepo.fetchAllUsers = jest.fn().mockResolvedValue([userA, userB])
    axios.post = jest.fn().mockResolvedValue({})

    await notifierService.alertUsersOfUnownedModsForSale()

    expect(axios.post).toHaveBeenCalledWith(
      `${expectedAddress}:3002/notify`,
      { user: userA },
      { headers: { 'Content-Type': 'application/json' } }
    )
    expect(axios.post).toHaveBeenCalledWith(
      `${expectedAddress}:3002/notify`,
      { user: userB },
      { headers: { 'Content-Type': 'application/json' } }
    )
    expect(axios.post).toBeCalledTimes(2)
  })
})
