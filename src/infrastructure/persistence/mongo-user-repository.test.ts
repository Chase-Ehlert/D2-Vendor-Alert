import { TokenInfo } from '../destiny/token-info'
import { MongoUserRepository } from './mongo-user-repository'
import { User } from './user-schema.js'

let realDate: any

beforeEach(() => {
  realDate = global.Date
})

afterEach(() => {
  global.Date = realDate
})

describe('MongoUserRepository', () => {
  const mongoUserRepo = new MongoUserRepository()

  it('should return true if a user exists in the database', async () => {
    const username = 'bungieNetUsername'
    const bungieUsername = username + '#123'
    const existsSpy = jest.spyOn(User, 'exists').mockResolvedValue({ _id: 123 })

    const value = await mongoUserRepo.doesUserExist(bungieUsername)

    expect(existsSpy).toHaveBeenCalledWith({ bungieUsername: username })
    expect(value).toEqual(true)
  })

  it('should return false if a user does not exist in the database', async () => {
    jest.spyOn(User, 'exists').mockResolvedValue(null)

    const value = await mongoUserRepo.doesUserExist('')

    expect(value).toEqual(false)
  })

  it('should add a user to the database', async () => {
    const saveSpy = jest.spyOn(User.prototype, 'save').mockResolvedValue({})

    await mongoUserRepo.addUser(
      'bungieNetUsername',
      'bungieNetUsernameCode',
      'discordId',
      'discordChannelId'
    )

    expect(saveSpy).toHaveBeenCalled()
  })

  it('should update a users record in the database by using their username', async () => {
    const bungieUsername = 'guardian'
    const refreshExpiration = '1000'
    const expectedRefreshExpiration = '1970-01-01T00:00:01Z'
    const refreshToken = 'guardian#123'
    const destinyId = 'jack'
    const characterId = 'carl'
    const findOneAndUpdateSpy = jest.spyOn(User, 'findOneAndUpdate').mockResolvedValue({})
    const mockDate = jest.fn()
    mockDate.mockReturnValueOnce(new Date(Number(refreshExpiration)))
    global.Date = mockDate as any

    await mongoUserRepo.updateUserByUsername(
      bungieUsername,
      refreshExpiration,
      refreshToken,
      destinyId,
      characterId
    )

    expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
      { bungieUsername: bungieUsername },
      {
        $set: expect.objectContaining(
          {
            destinyId: destinyId,
            destinyCharacterId: characterId,
            refreshExpiration: expectedRefreshExpiration,
            refreshToken: refreshToken
          }
        )
      }
    )
  })

  it('should update a users record in the database by using their membership id', async () => {
    const bungieMembershipId = 'guardian'
    const refreshExpiration = '1000'
    const expectedRefreshExpiration = '1970-01-01T00:00:01Z'
    const refreshToken = 'guardian#123'
    const findOneAndUpdateSpy = jest.spyOn(User, 'findOneAndUpdate').mockResolvedValue({})
    const mockDate = jest.fn()
    mockDate.mockReturnValueOnce(new Date(Number(refreshExpiration)))
    global.Date = mockDate as any

    await mongoUserRepo.updateUserByMembershipId(
      new TokenInfo(bungieMembershipId, refreshExpiration, refreshToken)
    )

    expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
      { bungieMembershipId: bungieMembershipId },
      expect.objectContaining(
        {
          refreshExpiration: expectedRefreshExpiration,
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
    const findSpy = jest.spyOn(User, 'find').mockResolvedValue(expectedUsers)

    const result = await mongoUserRepo.fetchAllUsers()

    expect(findSpy).toHaveBeenCalled()
    expect(result).toEqual(expectedUsers)
  })
})
