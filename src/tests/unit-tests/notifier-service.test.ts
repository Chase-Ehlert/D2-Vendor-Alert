import { DISCORD_NOTIFIER_ADDRESS } from '../../configs/config.js'
import { UserInterface } from '../../domain/user.js'
import { MongoUserRepository } from '../../infrastructure/database/mongo-user-repository.js'
import { NotifierService } from '../../presentation/notifier-service.js'
import axios from 'axios'

describe('MongoDbService', () => {
  const mongoUserRepo = new MongoUserRepository()
  const notifierService = new NotifierService(mongoUserRepo, DISCORD_NOTIFIER_ADDRESS)

  it('should call the notifier service for every user', async () => {
    const userA = { bungieUsername: 'CoolDude' } as unknown as UserInterface
    const userB = { bungieUsername: 'CoolerDude' } as unknown as UserInterface

    mongoUserRepo.fetchAllUsers = jest.fn().mockResolvedValue([userA, userB])
    axios.post = jest.fn().mockResolvedValue({})

    await notifierService.alertUsersOfUnownedModsForSale()

    expect(axios.post).toHaveBeenCalledWith(
      String(DISCORD_NOTIFIER_ADDRESS.address).concat(':3002/notify'),
      { user: userA },
      { headers: { 'Content-Type': 'application/json' } }
    )
    expect(axios.post).toHaveBeenCalledWith(
      String(DISCORD_NOTIFIER_ADDRESS.address).concat(':3002/notify'),
      { user: userB },
      { headers: { 'Content-Type': 'application/json' } }
    )
    expect(axios.post).toBeCalledTimes(2)
  })
})
