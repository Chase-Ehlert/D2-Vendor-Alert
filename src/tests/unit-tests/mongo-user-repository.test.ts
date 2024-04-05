import { TokenInfo } from '../../domain/token-info.js'
import { User } from '../../domain/user'
import { MongoUserRepository } from '../../infrastructure/database/mongo-user-repository'

describe('<MongoUserRepository/>', () => {
  const mongoUserRepo = new MongoUserRepository()

  it('should instantiate', () => {
    expect(mongoUserRepo).not.toBeNull()
  })

  it('should return true if a user exists in the database', async () => {
    User.exists = jest.fn().mockResolvedValue(true)

    const value = await mongoUserRepo.doesUserExist('bungieNetUsername')

    expect(value).toEqual(true)
  })

  it('should return false if a user does not exist in the database', async () => {
    User.exists = jest.fn().mockResolvedValue(null)

    const value = await mongoUserRepo.doesUserExist('bungieNetUsername')

    expect(value).toEqual(false)
  })

  it('should add a user to the database', async () => {
    const saveMock = jest.spyOn(User.prototype, 'save').mockResolvedValue({})

    await mongoUserRepo.addUser('bungieNetUsername', 'bungieNetUsernameCode', 'discordId', 'discordChannelId')

    expect(saveMock).toHaveBeenCalled()
  })

  it('should update a users record in the database by using their username', async () => {
    const bungieUsername = 'guardian'
    const refreshExpiration = '1000'
    const refreshToken = 'guardian#123'
    const destinyId = 'jack'
    const characterId = 'carl'
    User.findOneAndUpdate = jest.fn().mockResolvedValue({})

    await mongoUserRepo.updateUserByUsername(bungieUsername, refreshExpiration, refreshToken, destinyId, characterId)

    expect(User.findOneAndUpdate).toBeCalledWith(
      { bungieUsername: bungieUsername },
      {
        $set: expect.objectContaining(
          {
            destinyId: destinyId,
            destinyCharacterId: characterId,
            refreshExpiration: mongoUserRepo.determineExpirationDate(refreshExpiration),
            refreshToken: refreshToken
          }
        )
      })
  })

  it('should update a users record in the database by using their membership id', async () => {
    const bungieMembershipId = 'guardian'
    const refreshExpiration = '1000'
    const refreshToken = 'guardian#123'
    User.findOneAndUpdate = jest.fn().mockResolvedValue({})

    await mongoUserRepo.updateUserByMembershipId(new TokenInfo(bungieMembershipId, refreshExpiration, refreshToken))

    expect(User.findOneAndUpdate).toBeCalledWith(
      { bungieMembershipId: bungieMembershipId },
      expect.objectContaining(
        {
          refreshExpiration: mongoUserRepo.determineExpirationDate(refreshExpiration),
          refreshToken: refreshToken
        })
    )
  })

  it('should return a list of users that are subscribed to be alerted', async () => {
    const expectedUsers = [
      new User({
        bungieUsername: 'string',
        bungieUsernameCode: 'string',
        discordId: 'string',
        discordChannelId: 'string',
        destinyId: 'string',
        destinyCharacterId: 'string',
        refreshExpiration: 'string',
        refreshToken: 'string'
      }),
      new User({
        bungieUsername: 'string1',
        bungieUsernameCode: 'string1',
        discordId: 'string1',
        discordChannelId: 'string1',
        destinyId: 'string1',
        destinyCharacterId: 'string1',
        refreshExpiration: 'string1',
        refreshToken: 'string1'
      })
    ]
    User.find = jest.fn().mockResolvedValue(expectedUsers)

    const result = await mongoUserRepo.fetchAllUsers()

    expect(User.find).toBeCalled()
    expect(result).toEqual(expectedUsers)
  })
})
