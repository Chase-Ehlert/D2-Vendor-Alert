import { UserService } from '../services/user-service'
import { UserRepository } from './user-repository'
import { UserSchema } from './models/user-schema'

describe('<UserRepository/>', () => {
  const userService = new UserService()
  const userRepo = new UserRepository(userService)

  it('should instantiate', () => {
    expect(userRepo).not.toBeNull()
  })

  it('should check if a user exists in the database', async () => {
    const bungieNetUsername = 'guardian'
    UserSchema.exists = jest.fn().mockImplementation(() => ({ exec: jest.fn().mockResolvedValue(true) }))

    const value = await userRepo.doesUserExist(bungieNetUsername)

    expect(value).toEqual(true)
  })

  it('should add a user to the database', async () => {
    const bungieNetUsername = 'guardian'
    const bungieNetUsernameCode = 'guardian'
    const discordId = 'guardian#123'
    const discordChannelId = 'channel'
    const userSchema = new UserSchema({
      bungie_username: bungieNetUsername,
      bungie_username_code: bungieNetUsernameCode,
      discord_id: discordId,
      discord_channel_id: discordChannelId
    })
    const saveMock = jest.spyOn(UserSchema.prototype, 'save').mockResolvedValue({})

    await userRepo.addUser(userSchema)

    expect(saveMock).toHaveBeenCalled()
  })

  it('should update a users record in the database by using their username', async () => {
    const bungieUsername = 'guardian'
    const refreshExpiration = '1000'
    const refreshToken = 'guardian#123'
    const destinyId = 'jack'
    const characterId = 'carl'
    UserSchema.updateOne = jest.fn().mockResolvedValue({})
    const expectedExpirationDate = new Date()
    const timeTillExpiration = Number(refreshExpiration) / 60 / 60 / 24
    expectedExpirationDate.setDate(expectedExpirationDate.getDate() + timeTillExpiration)
    const expirationDateWithoutMilliseconds = expectedExpirationDate.toISOString().split('.')[0] + 'Z'

    await userRepo.updateUserByUsername(bungieUsername, refreshExpiration, refreshToken, destinyId, characterId)

    expect(UserSchema.updateOne).toBeCalledWith(
      { bungie_username: bungieUsername },
      {
        $set: {
          destiny_id: destinyId,
          destiny_character_id: characterId,
          refresh_expiration: expirationDateWithoutMilliseconds,
          refresh_token: refreshToken
        }
      })
  })

  it('should update a users record in the database by using their membership id', async () => {
    const bungieMembershipId = 'guardian'
    const refreshExpiration = '1000'
    const refreshToken = 'guardian#123'
    UserSchema.updateOne = jest.fn().mockResolvedValue({})
    const expectedExpirationDate = new Date()
    const timeTillExpiration = Number(refreshExpiration) / 60 / 60 / 24
    expectedExpirationDate.setDate(expectedExpirationDate.getDate() + timeTillExpiration)
    const expirationDateWithoutMilliseconds = expectedExpirationDate.toISOString().split('.')[0] + 'Z'

    await userRepo.updateUserByMembershipId(bungieMembershipId, refreshExpiration, refreshToken)

    expect(UserSchema.updateOne).toBeCalledWith(
      { bungie_membership_id: bungieMembershipId },
      {
        $set: {
          refresh_expiration: expirationDateWithoutMilliseconds,
          refresh_token: refreshToken
        }
      })
  })
})
