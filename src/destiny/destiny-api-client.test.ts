import { DestinyApiClient } from './destiny-api-client'
import { AxiosHttpClient } from '../utility/axios-http-client'
import { DESTINY_API_CLIENT_CONFIG } from '../config/config'
import { RefreshTokenInfo } from '../services/models/refresh-token-info'

jest.mock('./../utility/url', () => {
  return 'example'
})

jest.mock('./../utility/logger', () => {
  return {
    error: jest.fn()
  }
})

beforeEach(() => {
  jest.resetAllMocks()
})

describe('<DestinyApiClient/>', () => {
  const axiosHttpClient = new AxiosHttpClient()
  const config = DESTINY_API_CLIENT_CONFIG
  const destinyApiClient = new DestinyApiClient(axiosHttpClient, config)

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
    expect(value).toEqual([expectedDestinyMembershipId, expectedDisplayName])
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
    expect(value).toEqual(expectedCharacterId)
  })

  it('should catch an error in getDestinyCharacterIds if one occurs when making a http call', async () => {
    axiosHttpClient.get = jest.fn().mockRejectedValue(Error)

    await expect(async () => destinyApiClient.getDestinyCharacterIds('1')).rejects.toThrow(Error)
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
    expect(value).toEqual({ name: expectedDestinyusername })
  })

  it('should catch an error in getDestinyUsername if one occurs when making a http call', async () => {
    axiosHttpClient.post = jest.fn().mockRejectedValue(Error)

    await expect(async () => destinyApiClient.getDestinyUsername('1', '2')).rejects.toThrow(Error)
  })

  it('should retrieve a users refresh token', async () => {
    const expectedAuthCode = 'authCode'
    const expectedMembershipId = '123'
    const expectedRefreshExpiration = '456'
    const expectedRefreshToken = '789'
    const expectedRefreshTokenInfo = new RefreshTokenInfo(
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
})
