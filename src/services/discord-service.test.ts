import { DiscordService } from './discord-service'
import { UserService } from './user-service.js'
import { UserSchema } from '../database/models/user-schema'
import { Vendor } from '../destiny/vendor'
import { DestinyService } from './destiny-service'
import { UserRepository } from '../database/user-repository'
import { RefreshTokenInfo } from './models/refresh-token-info'
import { config } from '../../config/config'
import axios from 'axios'
import { ManifestService } from './manifest-service'
import { DestinyApiClient } from '../destiny/destiny-api-client'

describe('<DiscordService/>', () => {
  const vendor = new Vendor(
    new DestinyService(new DestinyApiClient()),
    new UserRepository(new UserService()),
    new ManifestService(new DestinyService(new DestinyApiClient()))
  )
  const destinyService = new DestinyService(new DestinyApiClient())
  const userService = new UserService()
  const userRepo = new UserRepository(userService)
  const discordService = new DiscordService(vendor, destinyService, userRepo, userService)

  jest.mock('axios')

  it('should instantiate', () => {
    expect(discordService).not.toBeNull()
  })

  describe('<getUserInfo/>', () => {
    const databaseUser1 = {
      _id: 0,
      bungie_username: 'a',
      bungie_username_code: 'b',
      discord_id: 'c',
      discord_channel_id: 'd',
      bungie_membership_id: 'e',
      destiny_id: 'f',
      destiny_character_id: 'g',
      refresh_expiration: '2023-09-28T12:48:55.489Z',
      refresh_token: 'k',
      __v: 0
    }
    const databaseUser2 = {
      _id: 1,
      bungie_username: 'z',
      bungie_username_code: 'y',
      discord_id: 'x',
      discord_channel_id: 'w',
      bungie_membership_id: 'v',
      destiny_id: 'u',
      destiny_character_id: 't',
      refresh_expiration: '1989-09-28T12:48:55.489Z',
      refresh_token: 's',
      __v: 0
    }
    const databaseUsers = [databaseUser1, databaseUser2]
    const expectedTokenInfo = new RefreshTokenInfo('0', '1', '2')
    const connectToDatabaseMock = jest.spyOn(userService, 'connectToDatabase').mockResolvedValue()
    const disconnectToDatabaseMock = jest.spyOn(userService, 'disconnectToDatabase').mockResolvedValue()
    const getAccessTokenMock = jest.spyOn(destinyService, 'getAccessToken').mockResolvedValue(expectedTokenInfo)
    const updateUserByMembershipIdMock = jest.spyOn(userRepo, 'updateUserByMembershipId').mockResolvedValue()

    jest.spyOn(vendor, 'getProfileCollectibles').mockResolvedValue([])
    UserSchema.find = jest.fn().mockImplementation(() => databaseUsers)
    axios.post = jest.fn().mockImplementation(async () => await Promise.resolve({ status: 200 }))

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should connect and disonnect to the database', async () => {
      await discordService.getUserInfo()

      expect(connectToDatabaseMock).toHaveBeenCalled()
      expect(disconnectToDatabaseMock).toHaveBeenCalled()
    })

    it('should update the users refresh token if it has expired', async () => {
      await discordService.getUserInfo()

      expect(getAccessTokenMock).toHaveBeenCalledWith(databaseUser2.refresh_token)
      expect(updateUserByMembershipIdMock).toHaveBeenCalledWith(
        expectedTokenInfo.bungieMembershipId,
        expectedTokenInfo.refreshTokenExpirationTime,
        expectedTokenInfo.refreshToken
      )
    })

    it('should not update the users refresh toke if it has not expired', async () => {
      await discordService.getUserInfo()

      expect(getAccessTokenMock).toHaveBeenCalledTimes(1)
      expect(updateUserByMembershipIdMock).toHaveBeenCalledTimes(1)
    })

    it('should send an alert message for any unowned mods that are for sale', async () => {
      const expectedMod1 = 'mod1'
      const expectedMod2 = 'mod2'
      const expectedDiscordEndpoint = `https://discord.com/api/v10/channels/${databaseUser1.discord_channel_id}/messages`
      const expectedMessage = `<@${databaseUser1.discord_id}>\r\nYou have these unowned mods for sale, grab them!\r\n${expectedMod1}\r\n${expectedMod2}`

      jest.spyOn(vendor, 'getProfileCollectibles').mockResolvedValue([expectedMod1, expectedMod2])

      await discordService.getUserInfo()

      expect(axios.post).toHaveBeenCalledWith(
        expectedDiscordEndpoint,
        { content: expectedMessage },
        {
          headers: {
            Authorization: `Bot ${config.configModel.token}`, 'Content-Type': 'application/json'
          }
        }
      )
    })

    it('should throw an error when an alert message does not return with a 200 status code', async () => {
      axios.post = jest.fn().mockImplementation(async () => await Promise.resolve({ status: 401 }))

      await expect(async () => await discordService.getUserInfo()).rejects.toThrow(Error)
      await expect(async () => await discordService.getUserInfo()).rejects.toThrow('401')

      axios.post = jest.fn().mockImplementation(async () => await Promise.resolve({ status: 200 }))
    })

    it('should not send an alert message when all mods for sale are owned', async () => {
      const expectedDiscordEndpoint = `https://discord.com/api/v10/channels/${databaseUser1.discord_channel_id}/messages`
      const expectedMessage = `${databaseUser1.bungie_username} does not have any unowned mods for sale today.`

      jest.spyOn(vendor, 'getProfileCollectibles').mockResolvedValue([])

      await discordService.getUserInfo()

      expect(axios.post).toHaveBeenCalledWith(
        expectedDiscordEndpoint,
        { content: expectedMessage },
        {
          headers: {
            Authorization: `Bot ${config.configModel.token}`, 'Content-Type': 'application/json'
          }
        }
      )
    })
  })
})
