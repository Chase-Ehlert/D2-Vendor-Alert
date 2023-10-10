import { DiscordService } from './discord-service'
import { Vendor } from '../destiny/vendor'
import { DestinyService } from './destiny-service'
import { MongoUserRepository } from '../database/mongo-user-repository'
import { ManifestService } from './manifest-service'
import { DestinyApiClient } from '../destiny/destiny-api-client'
import { User, UserInterface } from '../database/models/user'
import { AxiosHttpClient } from '../utility/axios-http-client'
import { AccessTokenInfo } from './models/access-token-info'
import { DESTINY_API_CLIENT_CONFIG, DISCORD_CONFIG } from '../config/config'

jest.mock('./../utility/url', () => {
  return 'example'
})

describe('<DiscordService/>', () => {
  const axiosHttpClient = new AxiosHttpClient()
  const config = DISCORD_CONFIG
  const vendor = new Vendor(
    new DestinyService(new DestinyApiClient(new AxiosHttpClient(), DESTINY_API_CLIENT_CONFIG)),
    new MongoUserRepository(),
    new ManifestService(new DestinyService(new DestinyApiClient(new AxiosHttpClient(), DESTINY_API_CLIENT_CONFIG)))
  )
  const destinyService = new DestinyService(new DestinyApiClient(new AxiosHttpClient(), DESTINY_API_CLIENT_CONFIG))
  const userRepo = new MongoUserRepository()
  const discordService = new DiscordService(vendor, destinyService, userRepo, axiosHttpClient, config)

  it('should instantiate', () => {
    expect(discordService).not.toBeNull()
  })

  describe('<getUserInfo/>', () => {
    const databaseUser1 = {
      bungieUsername: 'a',
      bungieUsernameCode: 'b',
      discordId: 'c',
      discordChannelId: 'd',
      bungieMembershipId: 'e',
      destinyId: 'f',
      destinyCharacterId: 'g',
      refreshExpiration: '5025-09-28T12:48:55.489Z',
      refreshToken: 'k'
    } as unknown as UserInterface
    const databaseUser2 = {
      bungieUsername: 'z',
      bungieUsernameCode: 'y',
      discordId: 'x',
      discordChannelId: 'w',
      bungieMembershipId: 'v',
      destinyId: 'u',
      destinyCharacterId: 't',
      refreshExpiration: '1989-09-28T12:48:55.489Z',
      refresh_token: 's'
    } as unknown as UserInterface
    const databaseUsers = [databaseUser1, databaseUser2]
    const expectedTokenInfo = new AccessTokenInfo('0', '1', '2', '3')
    const getAccessTokenMock = jest.spyOn(destinyService, 'getAccessToken').mockResolvedValue(expectedTokenInfo)
    const updateUserByMembershipIdMock = jest.spyOn(userRepo, 'updateUserByMembershipId').mockResolvedValue()

    jest.spyOn(vendor, 'getCollectiblesForSaleByAda').mockResolvedValue([])
    User.find = jest.fn().mockImplementation(() => databaseUsers)
    axiosHttpClient.post = jest.fn().mockImplementation(async () => Promise.resolve({ status: 200 }))

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should update the users refresh token if it has expired', async () => {
      await discordService.alertUsersOfUnownedModsForSale()

      expect(getAccessTokenMock).toHaveBeenCalledWith(databaseUser2.refreshToken)
      expect(updateUserByMembershipIdMock).toHaveBeenCalledWith(
        expectedTokenInfo.bungieMembershipId,
        expectedTokenInfo.refreshTokenExpirationTime,
        expectedTokenInfo.refreshToken
      )
    })

    it('should not update the users refresh token if it has not expired', async () => {
      await discordService.alertUsersOfUnownedModsForSale()

      expect(getAccessTokenMock).toHaveBeenCalledTimes(1)
      expect(updateUserByMembershipIdMock).toHaveBeenCalledTimes(1)
    })

    it('should send an alert message for any unowned mods that are for sale', async () => {
      const expectedMod1 = 'mod1'
      const expectedMod2 = 'mod2'
      const expectedDiscordEndpoint = `https://discord.com/api/v10/channels/${databaseUser1.discordChannelId}/messages`
      const expectedMessage = `<@${databaseUser1.discordId}>\r\nYou have these unowned mods for sale, grab them!\r\n${expectedMod1}\r\n${expectedMod2}`

      jest.spyOn(vendor, 'getCollectiblesForSaleByAda').mockResolvedValue([expectedMod1, expectedMod2])

      await discordService.alertUsersOfUnownedModsForSale()

      expect(axiosHttpClient.post).toHaveBeenCalledWith(
        expectedDiscordEndpoint,
        { content: expectedMessage },
        {
          headers: {
            Authorization: `Bot ${String(config.token)}`, 'Content-Type': 'application/json'
          }
        }
      )
    })

    it('should throw an error when an alert message does not return with a 200 status code', async () => {
      axiosHttpClient.post = jest.fn().mockImplementation(async () => Promise.resolve({ status: 401 }))

      await expect(async () => discordService.alertUsersOfUnownedModsForSale()).rejects.toThrow(Error)
      await expect(async () => discordService.alertUsersOfUnownedModsForSale()).rejects.toThrow('401')

      axiosHttpClient.post = jest.fn().mockImplementation(async () => Promise.resolve({ status: 200 }))
    })

    it('should not send an alert message when all mods for sale are owned', async () => {
      const expectedDiscordEndpoint = `https://discord.com/api/v10/channels/${databaseUser1.discordChannelId}/messages`
      const expectedMessage = `${databaseUser1.bungieUsername} does not have any unowned mods for sale today.`

      jest.spyOn(vendor, 'getCollectiblesForSaleByAda').mockResolvedValue([])

      await discordService.alertUsersOfUnownedModsForSale()

      expect(axiosHttpClient.post).toHaveBeenCalledWith(
        expectedDiscordEndpoint,
        { content: expectedMessage },
        {
          headers: {
            Authorization: `Bot ${String(config.token)}`, 'Content-Type': 'application/json'
          }
        }
      )
    })
  })
})
