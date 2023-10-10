import { DestinyApiClient } from './destiny-api-client'
import { UserInterface } from '../database/models/user'
import { AxiosHttpClient } from '../utility/axios-http-client'
import { DESTINY_API_CLIENT_CONFIG } from '../config/config'

jest.mock('./../utility/logger', () => {
  return {
    error: jest.fn()
  }
})

describe('<DestinyApiClient/>', () => {
  const axiosHttpClient = new AxiosHttpClient()
  const config = DESTINY_API_CLIENT_CONFIG
  const destinyApiClient = new DestinyApiClient(axiosHttpClient, config)

  it('should retrieve a users refresh token', async () => {
    const expectedAuthCode = 'authCode'
    const expectedMembershipId = '123'
    const expectedRefreshExpiration = '456'
    const expectedRefreshToken = '789'
    const expectedRefreshTokenInfo = {
      membership_id: expectedMembershipId,
      refresh_expires_in: expectedRefreshExpiration,
      refresh_token: expectedRefreshToken,
      access_token: undefined
    }
    axiosHttpClient.post = jest.fn().mockResolvedValue({
      membership_id: expectedMembershipId,
      refresh_expires_in: expectedRefreshExpiration,
      refresh_token: expectedRefreshToken
    })

    const value = await destinyApiClient.getRefreshTokenInfo(expectedAuthCode)

    expect(axiosHttpClient.post).toHaveBeenCalledWith(
      'https://www.bungie.net/platform/app/oauth/token/',
      {
        grant_type: 'authorization_code',
        code: expectedAuthCode,
        client_secret: config.oauthSecret,
        client_id: config.oauthClientId
      },
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'x-api-key': config.apiKey
        }
      }
    )
    expect(value).toEqual(expectedRefreshTokenInfo)
  })

  it('should catch an error in getRefreshTokenInfo if one occurs when making a http call', async () => {
    axiosHttpClient.post = jest.fn().mockRejectedValue(Error)

    await expect(async () => destinyApiClient.getRefreshTokenInfo('1')).rejects.toThrow(Error)
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
          'x-api-key': config.apiKey
        }
      }
    )
    expect(value).toEqual(result)
  })

  it('should catch an error in getDestinyMembershipInfo if one occurs when making a http call', async () => {
    axiosHttpClient.get = jest.fn().mockRejectedValue(Error)

    await expect(async () => destinyApiClient.getDestinyMembershipInfo('1')).rejects.toThrow(Error)
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
          'x-api-key': config.apiKey
        },
        params: { components: 100 }
      }
    )
    expect(value).toEqual(result)
  })

  it('should catch an error in getDestinyCharacterIds if one occurs when making a http call', async () => {
    axiosHttpClient.get = jest.fn().mockRejectedValue(Error)

    await expect(async () => destinyApiClient.getDestinyCharacterIds('1')).rejects.toThrow(Error)
  })

  it('should retrieve a list of definitions for Destiny items from a specific manifest file', async () => {
    const expectedManifestFileName = 'manifest'
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
          item1: 'definition'
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

    const value = await destinyApiClient.getDestinyInventoryItemDefinition()

    expect(axiosHttpClient.get).toHaveBeenCalledWith('https://www.bungie.net/manifest')
    expect(axiosHttpClient.get).toHaveBeenCalledWith(`https://www.bungie.net/${expectedManifestFileName}`)
    expect(value).toEqual(itemDefinition)
  })

  it('should catch an error in getDestinyInventoryItemDefinition if one occurs when making the first http call', async () => {
    axiosHttpClient.get = jest.fn().mockRejectedValue(Error)

    await expect(async () => destinyApiClient.getDestinyInventoryItemDefinition()).rejects.toThrow(Error)
  })

  it('should catch an error in getDestinyInventoryItemDefinition if one occurs when making the second http call', async () => {
    const expectedManifestFileName = 'manifest'
    const manifest = {
      data: {
        Response: {
          jsonWorldContentPaths: {
            en: expectedManifestFileName
          }
        }
      }
    }

    axiosHttpClient.get = jest.fn().mockImplementation(async (url): Promise<any> => {
      switch (url) {
        case 'https://www.bungie.net/platform/destiny2/manifest/':
          return Promise.resolve(manifest)
        case `https://www.bungie.net/${expectedManifestFileName}`:
          return Promise.reject(Error)
      }
    })

    await expect(async () => destinyApiClient.getDestinyInventoryItemDefinition()).rejects.toThrow(Error)
  })

  it('should retrieve a users access token by using their refresh token', async () => {
    const expectedMembershipId = '123'
    const expectedRefreshExpiration = '456'
    const expectedRefreshToken = '789'
    const expectedAccessToken = '321'
    const accessToken = {
      data: {
        membership_id: expectedMembershipId,
        refresh_expires_in: expectedRefreshExpiration,
        refresh_token: expectedRefreshToken,
        access_token: expectedAccessToken
      }
    }
    const refreshToken = '654'
    axiosHttpClient.post = jest.fn().mockResolvedValue(accessToken)

    const value = await destinyApiClient.getAccessTokenInfo(refreshToken)

    expect(axiosHttpClient.post).toHaveBeenCalledWith(
      'https://www.bungie.net/platform/app/oauth/token/',
      {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: config.oauthClientId,
        client_secret: config.oauthSecret
      },
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'x-api-key': config.apiKey
        }
      }
    )
    expect(value).toEqual(accessToken)
  })

  it('should catch an error in getAccessTokenInfo if one occurs when making a http call', async () => {
    axiosHttpClient.post = jest.fn().mockRejectedValue(Error)

    await expect(async () => destinyApiClient.getAccessTokenInfo('1')).rejects.toThrow(Error)
  })

  it('should check if a Destiny username exists based on a users Bungie username', async () => {
    const bungieUsername = 'name123'
    const bungieUsernameCode = '456'
    const expectedDestinyusername = 'coolGuy37'
    const result = { data: { Response: { name: expectedDestinyusername } } }
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
          'x-api-key': config.apiKey
        }
      }
    )
    expect(value).toEqual(result)
  })

  it('should catch an error in getDestinyUsername if one occurs when making a http call', async () => {
    axiosHttpClient.post = jest.fn().mockRejectedValue(Error)

    await expect(async () => destinyApiClient.getDestinyUsername('1', '2')).rejects.toThrow(Error)
  })

  it('should retrieve the list of Destiny vendors and their inventory', async () => {
    const destinyId = 'destinyId'
    const destinyCharacterId = 'character'
    const accessToken = '123'
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
    const result = {
      data: {
        Response: { sales: { data: { vendor: 'info' } } }
      }
    }
    axiosHttpClient.get = jest.fn().mockResolvedValue(result)

    const value = await destinyApiClient.getDestinyVendorInfo(user.destinyId, user.destinyCharacterId, accessToken)

    expect(axiosHttpClient.get).toHaveBeenCalledWith(
      `https://www.bungie.net/platform/destiny2/3/profile/${user.destinyId}/Character/${user.destinyCharacterId}/Vendors/`,
      {
        params: {
          components: 402
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'x-api-key': config.apiKey
        }
      }
    )
    expect(value).toEqual(result)
  })

  it('should catch an error in getDestinyVendorInfo if one occurs when making a http call', async () => {
    axiosHttpClient.get = jest.fn().mockRejectedValue(Error)

    await expect(async () => destinyApiClient.getDestinyVendorInfo('1', '2', '3')).rejects.toThrow(Error)
  })

  it('should retrieve the list of collectibles that exist in Destiny', async () => {
    const destinyId = 'destinyId'
    const result = {
      data: {
        Response: { profileCollectibles: { data: { collectibles: { item1: 'name' } } } }
      }
    }
    axiosHttpClient.get = jest.fn().mockResolvedValue(result)

    const value = await destinyApiClient.getDestinyCollectibleInfo(destinyId)

    expect(axiosHttpClient.get).toHaveBeenCalledWith(
      `https://www.bungie.net/platform/destiny2/3/profile/${destinyId}/`,
      {
        params: {
          components: 800
        },
        headers: {
          'x-api-key': config.apiKey
        }
      }
    )
    expect(value).toEqual(result)
  })

  it('should catch an error in getDestinyCollectibleInfo if one occurs when making a http call', async () => {
    axiosHttpClient.get = jest.fn().mockRejectedValue(Error)

    await expect(async () => destinyApiClient.getDestinyCollectibleInfo('1')).rejects.toThrow(Error)
  })
})
