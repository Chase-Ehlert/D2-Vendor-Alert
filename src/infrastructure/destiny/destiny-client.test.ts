import { MongoUserRepository } from '../persistence/mongo-user-repository'
import { UserInterface } from '../../domain/user/user'
import { TokenInfo } from './token-info'
import { DestinyClientConfig } from './config/destiny-client-config'
import { DestinyClient } from './destiny-client'
import path from 'path'
import { DisplayProperties, Merchandise, Mod } from '../../domain/destiny/mod.js'
import { AxiosResponse } from 'axios'
import { AxiosHttpClient } from '../../adapter/axios-http-client.js'

jest.mock('./../../testing-helpers/url', () => {
  return 'example/somewhere'
})

beforeAll(() => {
  global.console = {
    ...console,
    log: jest.fn()
  }
})

beforeEach(() => {
  jest.resetAllMocks()
  global.Date = Date
})

describe('DestinyClient', () => {
  const axiosHttpClient = new AxiosHttpClient()
  const mongoUserRepository = new MongoUserRepository()
  const expectedApiKey = '123key'
  const destinyId = 'destinyId'
  const destinyCharacterId = 'character'
  const expectedMembershipId = '123'
  const expectedRefreshExpiration = '456'
  const expectedRefreshToken = '789'
  const accessToken = '123'
  const oauthSecret = 'secret'
  const oauthClient = 'id'
  const config = {
    apiKey: expectedApiKey,
    oauthSecret: oauthSecret,
    oauthClientId: oauthClient
  } satisfies DestinyClientConfig
  const destinyClient = new DestinyClient(
    axiosHttpClient,
    mongoUserRepository,
    config
  )
  const response = {
    data: {
      membership_id: expectedMembershipId,
      refresh_expires_in: expectedRefreshExpiration,
      refresh_token: expectedRefreshToken,
      access_token: accessToken
    }
  } as unknown as AxiosResponse
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

  it('should retrieve a list of definitions for Destiny items from a specific manifest file', async () => {
    const expectedManifestFileName = 'manifest'
    const itemHash = '0132'
    const itemName = 'Sunglasses of Dudeness'
    const mod = new Mod(itemHash, { name: itemName } satisfies DisplayProperties, '19')
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
            hash: itemHash,
            itemType: 19,
            displayProperties: {
              name: itemName
            }
          }
        }
      }
    }

    axiosHttpClient.get = jest.fn().mockImplementation(async (url): Promise<any> => {
      switch (url) {
        case 'https://www.bungie.net/platform/destiny2/manifest/':
          return Promise.resolve(manifest)
        case `https://www.bungie.net/${expectedManifestFileName}`:
          return Promise.resolve(itemDefinition)
      }
    })

    const value = await destinyClient.getEquippableMods()

    expect(axiosHttpClient.get).toHaveBeenCalledWith('https://www.bungie.net/manifest')
    expect(axiosHttpClient.get).toHaveBeenCalledWith(`https://www.bungie.net/${expectedManifestFileName}`)
    expect(value).toHaveLength(1)
    expect(value[0] instanceof Mod).toBeTruthy()
    expect(value[0].displayProperties).toEqual(mod.displayProperties)
    expect(value[0].hash).toEqual(mod.hash)
    expect(value[0].itemType).toEqual(mod.itemType)
  })

  it('should retrieve the list of merchandise for a Destiny vendor', async () => {
    const mod1ItemId = '123'
    const mod2ItemId = '456'
    const adaMerchandise = {
      350061650: {
        saleItems: {
          1: { itemHash: mod1ItemId } satisfies Merchandise,
          2: { itemHash: mod2ItemId } satisfies Merchandise
        }
      }
    }
    const result = {
      data: {
        Response: { sales: { data: adaMerchandise } }
      }
    } as unknown as AxiosResponse
    const expectedVendorMerchandise = new Map<string, Object>()
    const merchandiseItem1 = { itemHash: '123' } satisfies Merchandise
    const merchandiseItem2 = { itemHash: '456' } satisfies Merchandise
    const merchandise = new Map()
    merchandise.set('1', merchandiseItem1)
    merchandise.set('2', merchandiseItem2)

    expectedVendorMerchandise.set('350061650', merchandise)

    const postSpy = jest.spyOn(axiosHttpClient, 'post').mockResolvedValue(response)
    const getSpy = jest.spyOn(axiosHttpClient, 'get').mockResolvedValue(result)

    jest.spyOn(mongoUserRepository, 'updateUserByMembershipId').mockResolvedValue()

    const value = await destinyClient.getVendorMerchandise(user.destinyId, user.destinyCharacterId, accessToken)

    expect(postSpy).toHaveBeenCalledWith(
      'https://www.bungie.net/platform/app/oauth/token/',
      {
        grant_type: 'refresh_token',
        refresh_token: accessToken,
        client_id: config.oauthClientId,
        client_secret: config.oauthSecret
      }, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'x-api-key': config.apiKey
        }
      }
    )
    expect(getSpy).toHaveBeenCalledWith(
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
    expect(value).toEqual(expectedVendorMerchandise)
  })

  it('should throw an error when the users access token info is undefined', async () => {
    let response
    // eslint-disable-next-line no-undef-init
    let expectedMembershipId: any = undefined
    let expectedRefreshExpiration: any = '456'
    let expectedRefreshToken: any = 'token'
    let expectedAccessToken: any = 'accessToken'
    const tokenResponse = {
      data: {
        membership_id: expectedMembershipId,
        refresh_expires_in: expectedRefreshExpiration,
        refresh_token: expectedRefreshToken,
        access_token: expectedAccessToken
      }
    } as unknown as AxiosResponse
    const notAdasMerchandise = {
      350061651: {}
    }
    const result = {
      data: {
        Response: { sales: { data: notAdasMerchandise } }
      }
    } as unknown as AxiosResponse
    jest.spyOn(axiosHttpClient, 'post').mockResolvedValue(tokenResponse)
    jest.spyOn(axiosHttpClient, 'get').mockResolvedValue(result)

    mongoUserRepository.updateUserByMembershipId = jest.fn()

    try {
      response = await destinyClient.getVendorMerchandise(user.destinyId, user.destinyCharacterId, accessToken)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Refresh token call failed!')
    }

    expect(typeof response).toBe(typeof undefined)

    expectedMembershipId = '123'
    expectedRefreshExpiration = undefined

    try {
      response = await destinyClient.getVendorMerchandise(user.destinyId, user.destinyCharacterId, accessToken)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Refresh token call failed!')
    }

    expect(typeof response).toBe(typeof undefined)

    expectedRefreshExpiration = '456'
    expectedRefreshToken = undefined

    try {
      response = await destinyClient.getVendorMerchandise(user.destinyId, user.destinyCharacterId, accessToken)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Refresh token call failed!')
    }

    expect(typeof response).toBe(typeof undefined)

    expectedRefreshToken = 'token'
    expectedAccessToken = undefined

    try {
      response = await destinyClient.getVendorMerchandise(user.destinyId, user.destinyCharacterId, accessToken)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Refresh token call failed!')
    }

    expect(typeof response).toBe(typeof undefined)
  })

  it('should retrieve the list of collectibles that exist in Destiny', async () => {
    const destinyId = 'destinyId'
    const expectedCollectibleName = ['item1']
    const result = {
      data: {
        Response: { profileCollectibles: { data: { collectibles: { item1: { state: 65 } } } } }
      }
    } as unknown as AxiosResponse
    const getSpy = jest.spyOn(axiosHttpClient, 'get').mockResolvedValue(result)

    const value = await destinyClient.getUnownedModIds(destinyId)

    expect(getSpy).toHaveBeenCalledWith(
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
    } as unknown as AxiosResponse
    const getSpy = jest.spyOn(axiosHttpClient, 'get').mockResolvedValue(result)

    const value = await destinyClient.getDestinyMembershipInfo(expectedMembershipId)

    expect(getSpy).toHaveBeenCalledWith(
      `https://www.bungie.net/platform/User/GetMembershipsById/${expectedMembershipId}/3/`,
      {
        headers: {
          'x-api-key': expectedApiKey
        }
      }
    )
    expect(value).toEqual([expectedDestinyMembershipId, expectedDisplayName])
  })

  it('should throw an error when Destiny info for a user is undefined', async () => {
    // eslint-disable-next-line no-undef-init
    let expectedDestinyMembershipId: any = undefined
    let expectedDisplayName: any = 'guardian'
    let response
    const expectedMembershipId = '123'
    const result = {
      data: {
        Response: {
          destinyMemberships: [{
            membershipId: expectedDestinyMembershipId,
            displayName: expectedDisplayName
          }]
        }
      }
    } as unknown as AxiosResponse
    jest.spyOn(axiosHttpClient, 'get').mockResolvedValue(result)

    try {
      response = await destinyClient.getDestinyMembershipInfo(expectedMembershipId)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Membership ID or Display Name are undefined.')
    }

    expect(typeof response).toBe(typeof undefined)

    expectedDestinyMembershipId = '456'
    expectedDisplayName = undefined

    try {
      response = await destinyClient.getDestinyMembershipInfo(expectedMembershipId)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Membership ID or Display Name are undefined.')
    }

    expect(typeof response).toBe(typeof undefined)
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
    } as unknown as AxiosResponse
    const getSpy = jest.spyOn(axiosHttpClient, 'get').mockResolvedValue(result)

    const value = await destinyClient.getDestinyCharacterIds(expectedMembershipId)

    expect(getSpy).toHaveBeenCalledWith(
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

  it('should throw an error when the Destiny character information for a user is undefined', async () => {
    let response
    const expectedMembershipId = '123'
    const result = {
      data: {
        Response: {
          profile: {
            data: {
              characterIds: [undefined]
            }
          }
        }
      }
    } as unknown as AxiosResponse
    jest.spyOn(axiosHttpClient, 'get').mockResolvedValue(result)

    try {
      response = await destinyClient.getDestinyCharacterIds(expectedMembershipId)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Character ID is undefined!')
    }

    expect(typeof response).toBe(typeof undefined)
  })

  it('should check if a Destiny username exists based on a users Bungie username', async () => {
    const bungieUsername = 'name123'
    const bungieUsernameCode = '456'
    const expectedDestinyusername = 'coolGuy37'
    const result = {
      data: {
        Response: [
          { name: expectedDestinyusername }
        ]
      }
    } as unknown as AxiosResponse
    const postSpy = jest.spyOn(axiosHttpClient, 'post').mockResolvedValue(result)

    const value = await destinyClient.doesDestinyPlayerExist(bungieUsername, bungieUsernameCode)

    expect(postSpy).toHaveBeenCalledWith(
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
    expect(value).toBeTruthy()
  })

  it('should return a list of Adas merchandise ids', () => {
    const adaVendorId = '350061650'
    const modId1 = '123'
    const modId2 = '456'
    const vendorMerchandise = new Map<string, Map<string, Merchandise>>()
    const adaMerchandise = new Map<string, Merchandise>()
    const randomVendorMerchandise = new Map<string, Merchandise>()

    randomVendorMerchandise.set('987', { itemHash: '99' })
    adaMerchandise.set(modId1, { itemHash: '1' })
    adaMerchandise.set(modId2, { itemHash: '2' })
    vendorMerchandise.set('111111111', randomVendorMerchandise)
    vendorMerchandise.set(adaVendorId, adaMerchandise)

    const result = destinyClient.getAdaMerchandiseHashes(adaVendorId, vendorMerchandise)

    expect(result).toStrictEqual(['1', '2'])
  })

  it('should throw an error when Adas merchandise is undefined', () => {
    const adaVendorId = '350061659'
    const vendorMerchandise = new Map<string, Map<string, Merchandise>>()
    const adaMerchandise = new Map<string, Merchandise>()
    const randomVendorMerchandise = new Map<string, Merchandise>()

    randomVendorMerchandise.set('987', { itemHash: '99' })
    vendorMerchandise.set('111111111', randomVendorMerchandise)
    vendorMerchandise.set(adaVendorId, adaMerchandise)

    try {
      destinyClient.getAdaMerchandiseHashes(adaVendorId, vendorMerchandise)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Ada does not have any merchandise!')
    }
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
    } as unknown as AxiosResponse
    jest.spyOn(axiosHttpClient, 'post').mockResolvedValue(response)

    const value = await destinyClient.getRefreshTokenInfo(
      expectedAuthCode,
      {
        render: jest.fn(),
        sendFile: jest.fn()
      }
    )

    expect(value).toEqual(expectedRefreshTokenInfo)
  })

  it('should throw an error when any value of a users token is undefined', async () => {
    let response
    // eslint-disable-next-line no-undef-init
    let expectedMembershipId = undefined
    let expectedRefreshExpiration: any = '456'
    let expectedRefreshToken: any = '789'
    const expectedAuthCode = 'authCode'
    const expectedResponse = {
      data: {
        membership_id: expectedMembershipId,
        refresh_expires_in: expectedRefreshExpiration,
        refresh_token: expectedRefreshToken,
        access_token: 'accessToken'
      }
    } as unknown as AxiosResponse

    jest.spyOn(axiosHttpClient, 'post').mockResolvedValue(expectedResponse)

    try {
      response = await destinyClient.getRefreshTokenInfo(
        expectedAuthCode,
        {
          render: jest.fn(),
          sendFile: jest.fn()
        }
      )
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }

    expect(typeof response).toBe(typeof undefined)

    expectedMembershipId = '123'
    expectedRefreshExpiration = undefined
    expectedRefreshToken = '789'

    try {
      response = await destinyClient.getRefreshTokenInfo(
        expectedAuthCode,
        {
          render: jest.fn(),
          sendFile: jest.fn()
        }
      )
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }

    expect(typeof response).toBe(typeof undefined)

    expectedMembershipId = '123'
    expectedRefreshExpiration = '456'
    expectedRefreshToken = undefined

    try {
      response = await destinyClient.getRefreshTokenInfo(
        expectedAuthCode,
        {
          render: jest.fn(),
          sendFile: jest.fn()
        }
      )
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }

    expect(typeof response).toBe(typeof undefined)
  })

  it('should redirect when the call to destiny api client fails', async () => {
    const expectedResult: any = { sendFile: jest.fn() }

    await destinyClient.getRefreshTokenInfo('1', expectedResult)

    expect(expectedResult.sendFile).toHaveBeenCalledWith(
      path.join('example/somewhere/src/presentation/views/landing-page-error-auth-code.html')
    )
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
    } as unknown as AxiosResponse
    const mockDate = jest.fn()
    mockDate.mockReturnValueOnce(new Date()).mockReturnValueOnce(new Date(712345256981))
    global.Date = mockDate as any

    jest.spyOn(axiosHttpClient, 'post').mockResolvedValue(expectedPostResponse)
    jest.spyOn(mongoUserRepository, 'updateUserByMembershipId').mockResolvedValue()

    await destinyClient.checkRefreshTokenExpiration(user)

    expect(mongoUserRepository.updateUserByMembershipId).toHaveBeenCalledWith(
      bungieMembershipId,
      refreshToken,
      refreshTokenExpirationTime
    )
  })
})
