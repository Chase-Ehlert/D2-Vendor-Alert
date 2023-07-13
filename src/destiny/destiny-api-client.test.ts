/* eslint-disable import/no-duplicates */
import http from 'axios'
import axios from 'axios'
import { DestinyApiClient } from './destiny-api-client'
import { config } from '../../config/config'
import { User } from '../database/models/user'

jest.mock('axios', () => ({
  create: jest.fn(() => http),
  get: jest.fn()
}))

describe('<DestinyApiClient/>', () => {
  const destinyApiClient = new DestinyApiClient()

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
    axios.post = jest.fn().mockResolvedValue({
      membership_id: expectedMembershipId,
      refresh_expires_in: expectedRefreshExpiration,
      refresh_token: expectedRefreshToken
    })

    const value = await destinyApiClient.getRefreshTokenInfo(expectedAuthCode)

    expect(axios.post).toHaveBeenCalledWith(
      'https://www.bungie.net/platform/app/oauth/token/',
      {
        grant_type: 'authorization_code',
        code: expectedAuthCode,
        client_secret: config.configModel.oauthSecret,
        client_id: config.configModel.oauthClientId
      },
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'x-api-key': config.configModel.apiKey
        }
      }
    )
    expect(value).toEqual(expectedRefreshTokenInfo)
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
    axios.get = jest.fn().mockResolvedValue(result)

    const value = await destinyApiClient.getDestinyMembershipInfo(expectedMembershipId)

    expect(axios.get).toHaveBeenCalledWith(
      `https://www.bungie.net/platform/User/GetMembershipsById/${expectedMembershipId}/3/`,
      {
        headers: {
          'x-api-key': config.configModel.apiKey
        }
      }
    )
    expect(value).toEqual(result)
  })

  it('should throw the error when the get call fails for getDestinyMembershipInfo()', async () => {
    const expectedError = new Error('Oops, something went wrong!')
    axios.get = jest.fn().mockRejectedValue(expectedError)

    await expect(
      async () => await destinyApiClient.getDestinyMembershipInfo('1')
    ).rejects.toThrow(Error)

    await expect(
      async () => await destinyApiClient.getDestinyMembershipInfo('1')
    ).rejects.toThrow('Oops, something went wrong!')
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
    axios.get = jest.fn().mockResolvedValue(result)

    const value = await destinyApiClient.getDestinyCharacterIds(expectedMembershipId)

    expect(axios.get).toHaveBeenCalledWith(
      `https://www.bungie.net/platform/destiny2/3/profile/${expectedMembershipId}/`,
      {
        headers: {
          'x-api-key': config.configModel.apiKey
        },
        params: { components: 100 }
      }
    )
    expect(value).toEqual(result)
  })

  it('should throw the error when the get call fails for getDestinyCharacterId()', async () => {
    const expectedError = new Error('Oops, something went wrong!')
    axios.get = jest.fn().mockRejectedValue(expectedError)

    await expect(
      async () => await destinyApiClient.getDestinyCharacterIds('1')
    ).rejects.toThrow(Error)

    await expect(
      async () => await destinyApiClient.getDestinyCharacterIds('1')
    ).rejects.toThrow('Oops, something went wrong!')
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
    const httpMock = http as jest.Mocked<typeof http>
    httpMock.get.mockImplementation(async (url): Promise<any> => {
      switch (url) {
        case 'https://www.bungie.net/platform/destiny2/manifest/':
          return await Promise.resolve(manifest)
        case `https://www.bungie.net/${expectedManifestFileName}`:
          return await Promise.resolve(itemDefinition)
      }
    })

    const value = await destinyApiClient.getDestinyInventoryItemDefinition()

    expect(axios.get).toHaveBeenCalledWith('https://www.bungie.net/manifest')
    expect(axios.get).toHaveBeenCalledWith(`https://www.bungie.net/${expectedManifestFileName}`)
    expect(value).toEqual(itemDefinition)
  })

  it('should throw the error when the get call fails for getDestinyInventoryItemDefinition()', async () => {
    const expectedError = new Error('Oops, something went wrong!')
    axios.get = jest.fn().mockRejectedValue(expectedError)

    await expect(
      async () => await destinyApiClient.getDestinyInventoryItemDefinition()
    ).rejects.toThrow(Error)

    await expect(
      async () => await destinyApiClient.getDestinyInventoryItemDefinition()
    ).rejects.toThrow('Oops, something went wrong!')
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
    axios.post = jest.fn().mockResolvedValue(accessToken)

    const value = await destinyApiClient.getAccessTokenInfo(refreshToken)

    expect(axios.post).toHaveBeenCalledWith(
      'https://www.bungie.net/platform/app/oauth/token/',
      {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: config.configModel.oauthClientId,
        client_secret: config.configModel.oauthSecret
      },
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'x-api-key': config.configModel.apiKey
        }
      }
    )
    expect(value).toEqual(accessToken)
  })

  it('should throw the error when the get call fails for getDestinyInventoryItemDefinition()', async () => {
    const expectedError = new Error('Oops, something went wrong!')
    axios.post = jest.fn().mockRejectedValue(expectedError)

    await expect(
      async () => await destinyApiClient.getAccessTokenInfo('1')
    ).rejects.toThrow(Error)

    await expect(
      async () => await destinyApiClient.getAccessTokenInfo('1')
    ).rejects.toThrow('Oops, something went wrong!')
  })

  it('should check if a Destiny username exists based on a users Bungie username', async () => {
    const bungieUsername = 'name123'
    const bungieUsernameCode = '456'
    const expectedDestinyusername = 'coolGuy37'
    const result = { data: { Response: { name: expectedDestinyusername } } }
    axios.post = jest.fn().mockResolvedValue(result)

    const value = await destinyApiClient.getDestinyUsername(bungieUsername, bungieUsernameCode)

    expect(axios.post).toHaveBeenCalledWith(
      'https://www.bungie.net/platform/destiny2/SearchDestinyPlayerByBungieName/3/',
      {
        displayName: bungieUsername,
        displayNameCode: bungieUsernameCode
      },
      {
        headers: {
          'content-type': 'application/json',
          'x-api-key': config.configModel.apiKey
        }
      }
    )
    expect(value).toEqual(result)
  })

  it('should throw the error when the post call fails for getDestinyUsername()', async () => {
    const expectedError = new Error('Oops, something went wrong!')
    axios.post = jest.fn().mockRejectedValue(expectedError)

    await expect(
      async () => await destinyApiClient.getDestinyUsername('1', '1')
    ).rejects.toThrow(Error)

    await expect(
      async () => await destinyApiClient.getDestinyUsername('1', '1')
    ).rejects.toThrow('Oops, something went wrong!')
  })

  it('should retrieve the list of Destiny vendors and their inventory', async () => {
    const destinyId = 'destinyId'
    const destinyCharacterId = 'character'
    const user = new User('name', 'code', 'discordId', 'channelId', destinyId, destinyCharacterId, 'expiration', 'token')
    const accessToken = '123'
    const result = {
      data: {
        Response: { sales: { data: { vendor: 'info' } } }
      }
    }
    axios.get = jest.fn().mockResolvedValue(result)

    const value = await destinyApiClient.getDestinyVendorInfo(user.destinyId, user.destinyCharacterId, accessToken)

    expect(axios.get).toHaveBeenCalledWith(
      `https://www.bungie.net/platform/destiny2/3/profile/${user.destinyId}/Character/${user.destinyCharacterId}/Vendors/`,
      {
        params: {
          components: 402
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'x-api-key': config.configModel.apiKey
        }
      }
    )
    expect(value).toEqual(result)
  })

  it('should throw the error when the get call fails for getDestinyVendorInfo()', async () => {
    const user = new User('name', 'code', 'discordId', 'channelId', 'destinyId', 'destinyCharacterId', 'expiration', 'token')
    const expectedError = new Error('Oops, something went wrong!')
    axios.get = jest.fn().mockRejectedValue(expectedError)

    await expect(
      async () => await destinyApiClient.getDestinyVendorInfo(user.destinyId, user.destinyCharacterId, '1')
    ).rejects.toThrow(Error)

    await expect(
      async () => await destinyApiClient.getDestinyVendorInfo(user.destinyId, user.destinyCharacterId, '1')
    ).rejects.toThrow('Oops, something went wrong!')
  })

  it('should retrieve the list of collectibles that exist in Destiny', async () => {
    const destinyId = 'destinyId'
    const result = {
      data: {
        Response: { profileCollectibles: { data: { collectibles: { item1: 'name' } } } }
      }
    }
    axios.get = jest.fn().mockResolvedValue(result)

    const value = await destinyApiClient.getDestinyCollectibleInfo(destinyId)

    expect(axios.get).toHaveBeenCalledWith(
      `https://www.bungie.net/platform/destiny2/3/profile/${destinyId}/`,
      {
        params: {
          components: 800
        },
        headers: {
          'x-api-key': config.configModel.apiKey
        }
      }
    )
    expect(value).toEqual(result)
  })

  it('should throw the error when the get call fails for getDestinyCollectibleInfo()', async () => {
    const expectedError = new Error('Oops, something went wrong!')
    axios.get = jest.fn().mockRejectedValue(expectedError)

    await expect(
      async () => await destinyApiClient.getDestinyCollectibleInfo('1')
    ).rejects.toThrow(Error)

    await expect(
      async () => await destinyApiClient.getDestinyCollectibleInfo('1')
    ).rejects.toThrow('Oops, something went wrong!')
  })
})
