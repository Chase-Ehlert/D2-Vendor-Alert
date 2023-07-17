import { UserService } from '../services/user-service'
import { NewUser, UpdatedUser } from './models/user'
import { MongoUserRepository } from './mongo-user-repository'

describe('<MongoUserRepository/>', () => {
  const userService = new UserService()
  const mongoUserRepo = new MongoUserRepository(userService)

  it('should instantiate', () => {
    expect(mongoUserRepo).not.toBeNull()
  })

  it('should return true if a user exists in the database', async () => {
    NewUser.exists = jest.fn().mockResolvedValue(true)

    const value = await mongoUserRepo.doesUserExist('bungieNetUsername')

    expect(value).toEqual(true)
  })

  it('should return false if a user does not exist in the database', async () => {
    NewUser.exists = jest.fn().mockResolvedValue(null)

    const value = await mongoUserRepo.doesUserExist('bungieNetUsername')

    expect(value).toEqual(false)
  })

  it('should add a user to the database', async () => {
    const saveMock = jest.spyOn(NewUser.prototype, 'save').mockResolvedValue({})

    await mongoUserRepo.addUser('bungieNetUsername', 'bungieNetUsernameCode', 'discordId', 'discordChannelId')

    expect(saveMock).toHaveBeenCalled()
  })

  it('should throw an error when a user is not saved to the database', async () => {
    jest.spyOn(NewUser.prototype, 'save').mockRejectedValue(Error)

    await expect(async () => await mongoUserRepo.addUser('', '', '', '')).rejects.toThrow(Error)
    await expect(async () => await mongoUserRepo.addUser('', '', '', '')).rejects.toThrow('Could not create new user')
  })

  it('should update a users record in the database by using their username', async () => {
    const bungieUsername = 'guardian'
    const refreshExpiration = '1000'
    const refreshToken = 'guardian#123'
    const destinyId = 'jack'
    const characterId = 'carl'
    UpdatedUser.findOneAndUpdate = jest.fn().mockResolvedValue({})

    await mongoUserRepo.updateUserByUsername(bungieUsername, refreshExpiration, refreshToken, destinyId, characterId)

    expect(UpdatedUser.findOneAndUpdate).toBeCalledWith(
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

  it('should throw an error when a user record cant be updated by a username', async () => {
    const bungieUsername = 'guardian'
    UpdatedUser.findOneAndUpdate = jest.fn().mockRejectedValue(Error)

    await expect(
      async () => await mongoUserRepo.updateUserByUsername(bungieUsername, '', '', '', '')
    ).rejects.toThrow(Error)

    await expect(
      async () => await mongoUserRepo.updateUserByUsername(bungieUsername, '', '', '', '')
    ).rejects.toThrow(`The record for ${bungieUsername}, could not be updated`)
  })

  it('should update a users record in the database by using their membership id', async () => {
    const bungieMembershipId = 'guardian'
    const refreshExpiration = '1000'
    const refreshToken = 'guardian#123'
    UpdatedUser.findOneAndUpdate = jest.fn().mockResolvedValue({})

    await mongoUserRepo.updateUserByMembershipId(bungieMembershipId, refreshExpiration, refreshToken)

    expect(UpdatedUser.findOneAndUpdate).toBeCalledWith(
      { bungieMembershipId: bungieMembershipId },
      expect.objectContaining(
        {
          refreshExpiration: mongoUserRepo.determineExpirationDate(refreshExpiration),
          refreshToken: refreshToken
        })
    )
  })

  it('should throw an error when a user record cant be updated by a membership id', async () => {
    const bungieUsername = 'guardian'
    UpdatedUser.findOneAndUpdate = jest.fn().mockRejectedValue(Error)

    await expect(
      async () => await mongoUserRepo.updateUserByMembershipId(bungieUsername, '', '')
    ).rejects.toThrow(Error)

    await expect(
      async () => await mongoUserRepo.updateUserByMembershipId(bungieUsername, '', '')
    ).rejects.toThrow(`The record for ${bungieUsername}, could not be updated`)
  })

  it('should return a list of users that are subscribed to be alerted', async () => {
    const expectedUsers = [
      new NewUser({
        bungieUsername: 'string',
        bungieUsernameCode: 'string',
        discordId: 'string',
        discordChannelId: 'string',
        destinyId: 'string',
        destinyCharacterId: 'string',
        refreshExpiration: 'string',
        refreshToken: 'string'
      }),
      new NewUser({
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
    NewUser.find = jest.fn().mockResolvedValue(expectedUsers)

    const result = await mongoUserRepo.fetchAllUsers()

    expect(NewUser.find).toBeCalled()
    expect(result).toEqual(expectedUsers)
  })
})
