import { DestinyApiClient } from '../../presentation/destiny-api-client'
import { AxiosHttpClient } from '../../infrastructure/database/axios-http-client'
import { MongoUserRepository } from '../../infrastructure/database/mongo-user-repository'
import { Mod } from '../../domain/mod'
import { UserInterface } from '../../domain/user'
import { TokenInfo } from '../../domain/token-info'
import { DestinyApiClientConfig } from '../../configs/destiny-api-client-config.js'

jest.mock('./../helpers/url', () => {
  return 'example'
})

beforeEach(() => {
  jest.resetAllMocks()
  global.Date = Date
})

describe('DestinyApiClient', () => {
  const axiosHttpClient = new AxiosHttpClient()
  const expectedApiKey = '123key'
  const mongoUserRepository = new MongoUserRepository()
  const destinyApiClient = new DestinyApiClient(
    axiosHttpClient,
    mongoUserRepository,
      { apiKey: expectedApiKey } satisfies DestinyApiClientConfig
  )

  it('should retrieve a list of definitions for Destiny items from a specific manifest file', async () => {
    const expectedManifestFileName = 'manifest'
    const itemHash = '0132'
    const itemName = 'Sunglasses of Dudeness'
    const manifest = {
      data: {
        Response: {
          jsonWorldContentPaths: {
            en: expectedManifestFileName
          }
        }
      }
    }
    const itemDefinition = {
      data: {
        DestinyInventoryItemDefinition: {
          987: {
            itemType: 19,
            hash: itemHash,
            displayProperties: {
              name: itemName
            }
          }
        }
      }
    }
    const expectedItemDefinitions = new Map()
    expectedItemDefinitions.set(itemHash, itemName)

    axiosHttpClient.get = jest.fn().mockImplementation(async (url): Promise<any> => {
      switch (url) {
        case 'https://www.bungie.net/platform/destiny2/manifest/':
          return Promise.resolve(manifest)
        case `https://www.bungie.net/${expectedManifestFileName}`:
          return Promise.resolve(itemDefinition)
      }
    })

    const value = await destinyApiClient.getDestinyInventoryItemDefinition()

    expect(axiosHttpClient.get).toHaveBeenCalledWith('https://www.bungie.net/manifest')
    expect(axiosHttpClient.get).toHaveBeenCalledWith(`https://www.bungie.net/${expectedManifestFileName}`)
    expect(value).toEqual(expectedItemDefinitions)
  })

  it('should retrieve the list of Destiny vendors and their inventory', async () => {
    const destinyId = 'destinyId'
    const destinyCharacterId = 'character'
    const accessToken = '123'
    const expectedMembershipId = '123'
    const expectedRefreshExpiration = '456'
    const expectedRefreshToken = '789'
    const mod1ItemHash = '123'
    const mod2ItemHash = '456'
    const mod1 = new Mod(mod1ItemHash)
    const mod2 = new Mod(mod2ItemHash)
    const adaMerchandise = { 350061650: { saleItems: { 1: { itemHash: mod1ItemHash }, 2: { itemHash: mod2ItemHash } } } }
    const result = {
      data: {
        Response: { sales: { data: adaMerchandise } }
      }
    }
    const response = {
      data: {
        membership_id: expectedMembershipId,
        refresh_expires_in: expectedRefreshExpiration,
        refresh_token: expectedRefreshToken,
        access_token: accessToken
      }
    }
    const user = {
      bungieUsername: 'name',
      bungieUsernameCode: 'code',
      discordId: 'discordId',
      discordChannelId: 'channelId',
      bungieMembershipId: 'bungie',
      destinyId: destinyId,
      destinyCharacterId: destinyCharacterId,
      refreshExpiration: 'expiration',
      refreshToken: 'token'
    } as unknown as UserInterface

    axiosHttpClient.get = jest.fn().mockResolvedValue(result)
    axiosHttpClient.post = jest.fn().mockResolvedValue(response)
    jest.spyOn(mongoUserRepository, 'updateUserByMembershipId').mockResolvedValue()

    const value = await destinyApiClient.getVendorInfo(user.destinyId, user.destinyCharacterId, accessToken)

    expect(axiosHttpClient.get).toHaveBeenCalledWith(
      `https://www.bungie.net/platform/destiny2/3/profile/${user.destinyId}/Character/${user.destinyCharacterId}/Vendors/`,
      {
        params: {
          components: 402
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'x-api-key': expectedApiKey
        }
      }
    )
    expect(value).toEqual([mod1, mod2])
  })

  it('should retrieve the list of collectibles that exist in Destiny', async () => {
    const destinyId = 'destinyId'
    const expectedCollectibleName = ['item1']
    const result = {
      data: {
        Response: { profileCollectibles: { data: { collectibles: { item1: { state: 65 } } } } }
      }
    }
    axiosHttpClient.get = jest.fn().mockResolvedValue(result)

    const value = await destinyApiClient.getCollectibleInfo(destinyId)

    expect(axiosHttpClient.get).toHaveBeenCalledWith(
      `https://www.bungie.net/platform/destiny2/3/profile/${destinyId}/`,
      {
        params: {
          components: 800
        },
        headers: {
          'x-api-key': expectedApiKey
        }
      }
    )
    expect(value).toEqual(expectedCollectibleName)
  })

  it('should retrieve the Destiny membership information for a user', async () => {
    const expectedMembershipId = '123'
    const expectedDestinyMembershipId = '456'
    const expectedDisplayName = 'guardian'
    const result = {
      data: {
        Response: {
          destinyMemberships: [{
            membershipId: expectedDestinyMembershipId,
            displayName: expectedDisplayName
          }]
        }
      }
    }
    axiosHttpClient.get = jest.fn().mockResolvedValue(result)

    const value = await destinyApiClient.getDestinyMembershipInfo(expectedMembershipId)

    expect(axiosHttpClient.get).toHaveBeenCalledWith(
      `https://www.bungie.net/platform/User/GetMembershipsById/${expectedMembershipId}/3/`,
      {
        headers: {
          'x-api-key': expectedApiKey
        }
      }
    )
    expect(value).toEqual([expectedDestinyMembershipId, expectedDisplayName])
  })

  it('should retrieve the Destiny character information for a user', async () => {
    const expectedMembershipId = '123'
    const expectedCharacterId = '456'
    const result = {
      data: {
        Response: {
          profile: {
            data: {
              characterIds: [expectedCharacterId]
            }
          }
        }
      }
    }
    axiosHttpClient.get = jest.fn().mockResolvedValue(result)

    const value = await destinyApiClient.getDestinyCharacterIds(expectedMembershipId)

    expect(axiosHttpClient.get).toHaveBeenCalledWith(
      `https://www.bungie.net/platform/destiny2/3/profile/${expectedMembershipId}/`,
      {
        headers: {
          'x-api-key': expectedApiKey
        },
        params: { components: 100 }
      }
    )
    expect(value).toEqual(expectedCharacterId)
  })

  it('should check if a Destiny username exists based on a users Bungie username', async () => {
    const bungieUsername = 'name123'
    const bungieUsernameCode = '456'
    const expectedDestinyusername = 'coolGuy37'
    const result = { data: { Response: [{ name: expectedDestinyusername }] } }
    const expectedResult = [{ name: expectedDestinyusername }]

    axiosHttpClient.post = jest.fn().mockResolvedValue(result)

    const value = await destinyApiClient.getDestinyUsername(bungieUsername, bungieUsernameCode)

    expect(axiosHttpClient.post).toHaveBeenCalledWith(
      'https://www.bungie.net/platform/destiny2/SearchDestinyPlayerByBungieName/3/',
      {
        displayName: bungieUsername,
        displayNameCode: bungieUsernameCode
      },
      {
        headers: {
          'content-type': 'application/json',
          'x-api-key': expectedApiKey
        }
      }
    )
    expect(value).toEqual(expectedResult)
  })

  it('should retrieve a users refresh token', async () => {
    const expectedAuthCode = 'authCode'
    const expectedMembershipId = '123'
    const expectedRefreshExpiration = '456'
    const expectedRefreshToken = '789'
    const expectedRefreshTokenInfo = new TokenInfo(
      expectedMembershipId,
      expectedRefreshExpiration,
      expectedRefreshToken
    )
    const response = {
      data: {
        membership_id: expectedMembershipId,
        refresh_expires_in: expectedRefreshExpiration,
        refresh_token: expectedRefreshToken,
        access_token: 'accessToken'
      }
    }

    axiosHttpClient.post = jest.fn().mockResolvedValue(response)

    const value = await destinyApiClient.getRefreshTokenInfo(
      expectedAuthCode,
      { sendFile: jest.fn() }
    )

    expect(value).toEqual(expectedRefreshTokenInfo)
  })

  it('should redirect when the call to destiny api client fails', async () => {
    const expectedResult: any = { sendFile: jest.fn() }

    await destinyApiClient.getRefreshTokenInfo('1', expectedResult)

    expect(expectedResult.sendFile).toBeCalledWith('landing-page-error-auth-code.html', expect.any(Object))
  })

  it('should check a users token expiration data and refresh it if its expired', async () => {
    const user = {
      refreshExpiration: 1712345256981,
      refreshToken: ''
    } as unknown as UserInterface
    const bungieMembershipId = 'bungieMembershipId'
    const refreshTokenExpirationTime = 'refreshTokeExpirationTime-CHANGE_ME'
    const refreshToken = 'refreshToken'
    const expectedPostResponse = {
      data: {
        membership_id: bungieMembershipId,
        refresh_expires_in: refreshTokenExpirationTime,
        refresh_token: refreshToken,
        access_token: ''
      }
    }
    const expectedTokenInfo = new TokenInfo(
      bungieMembershipId,
      refreshTokenExpirationTime,
      refreshToken
    )
    const mockDate = jest.fn()
    mockDate.mockReturnValueOnce(new Date()).mockReturnValueOnce(new Date(712345256981))
    global.Date = mockDate as any
    axiosHttpClient.post = jest.fn().mockResolvedValue(expectedPostResponse)
    mongoUserRepository.updateUserByMembershipId = jest.fn().mockResolvedValue({})

    await destinyApiClient.checkRefreshTokenExpiration(user)

    expect(mongoUserRepository.updateUserByMembershipId).toHaveBeenCalledWith(expectedTokenInfo)
  })
})
