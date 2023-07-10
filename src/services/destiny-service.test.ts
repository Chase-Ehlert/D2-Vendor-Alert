import { IncomingMessage, ServerResponse } from 'http'
import { DestinyService } from './destiny-service'
import { Socket } from 'net'
import axios from 'axios'
import { RefreshTokenInfo } from './models/refresh-token-info'
import { config } from '../../config/config'
import { User } from '../database/models/user'

describe('<DestinyService/>', () => {
  const destinyService = new DestinyService()

  jest.mock('axios')
  jest.spyOn(console, 'error').mockImplementation(() => { })

  // afterEach(() => {
  //   jest.clearAllMocks()
  // })

  it('should instantiate', async () => {
    expect(destinyService).not.toBeNull()
  })

  it('should retrieve a users refresh token', async () => {
    const expectedAuthCode = 'authCode'
    const expectedMembershipId = '123'
    const expectedRefreshExpiration = '456'
    const expectedRefreshToken = '789'
    const expectedRefreshTokenInfo = new RefreshTokenInfo(expectedMembershipId, expectedRefreshExpiration, expectedRefreshToken)
    axios.post = jest.fn().mockResolvedValue({
      membership_id: expectedMembershipId,
      refresh_expires_in: expectedRefreshExpiration,
      refresh_token: expectedRefreshToken
    })

    const value = await destinyService.getRefreshToken(expectedAuthCode, new ServerResponse(new IncomingMessage(new Socket())))

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
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-api-key': config.configModel.apiKey
        }
      }
    )
    expect(value).toEqual(expectedRefreshTokenInfo)
  })

  it('should redirect when the post fails', async () => {
    const expectedResult: any = { redirect: jest.fn() }
    const expectedError = new Error()
    axios.post = jest.fn().mockRejectedValue(expectedError)

    await destinyService.getRefreshToken('1', expectedResult)

    expect(expectedResult.redirect).toBeCalledWith('/error/authCode')
    expect(console.error).toHaveBeenCalledWith(expectedError)
  })

  it('should retrieve the Destiny membership information for a user', async () => {
    const expectedMembershipId = '123'
    const expectedDestinyMembershipId = '456'
    const expectedDisplayName = 'guardian'
    const result = { data: { Response: { destinyMemberships: [{ membershipId: expectedDestinyMembershipId, displayName: expectedDisplayName }] } } }
    axios.get = jest.fn().mockResolvedValue(result)

    const value = await destinyService.getDestinyMembershipInfo(expectedMembershipId)

    expect(axios.get).toHaveBeenCalledWith(
      `https://www.bungie.net/platform/User/GetMembershipsById/${expectedMembershipId}/3/`,
      {
        headers: {
          'x-api-key': config.configModel.apiKey
        }
      }
    )
    expect(value).toEqual([expectedDestinyMembershipId, expectedDisplayName])
  })

  it('should throw the error when the get call fails for getDestinyMembershipInfo()', async () => {
    const expectedError = new Error('Oops, something went wrong!')
    axios.get = jest.fn().mockRejectedValue(expectedError)

    await expect(async () => await destinyService.getDestinyMembershipInfo('1')).rejects.toThrow(Error)
    await expect(async () => await destinyService.getDestinyMembershipInfo('1')).rejects.toThrow('Oops, something went wrong!')
  })

  it('should retrieve the Destiny character information for a user', async () => {
    const expectedMembershipId = '123'
    const expectedCharacterId = '456'
    const result = { data: { Response: { profile: { data: { characterIds: [expectedCharacterId] } } } } }
    axios.get = jest.fn().mockResolvedValue(result)

    const value = await destinyService.getDestinyCharacterId(expectedMembershipId)

    expect(axios.get).toHaveBeenCalledWith(
      `https://bungie.net/Platform/Destiny2/3/Profile/${expectedMembershipId}/`,
      {
        headers: {
          'x-api-key': config.configModel.apiKey
        },
        params: { components: 100 }
      }
    )
    expect(value).toEqual(expectedCharacterId)
  })

  it('should throw the error when the get call fails for getDestinyCharacterId()', async () => {
    const expectedError = new Error('Oops, something went wrong!')
    axios.get = jest.fn().mockRejectedValue(expectedError)

    await expect(async () => await destinyService.getDestinyCharacterId('1')).rejects.toThrow(Error)
    await expect(async () => await destinyService.getDestinyCharacterId('1')).rejects.toThrow('Oops, something went wrong!')
  })

  it('should retrieve a list of definitions for Destiny items from a specific manifest file', async () => {
    const expectedManifestFileName = 'manifest'
    const expectedItemDefinition = { data: { DestinyInventoryItemDefinition: { item1: 'definition' } } }
    axios.get = jest.fn().mockResolvedValue(expectedItemDefinition)

    const value = await destinyService.getDestinyInventoryItemDefinition(expectedManifestFileName)

    expect(axios.get).toHaveBeenCalledWith(
      `https://www.bungie.net${expectedManifestFileName}`
    )
    expect(value).toEqual(expectedItemDefinition.data.DestinyInventoryItemDefinition)
  })

  it('should throw the error when the get call fails for getDestinyInventoryItemDefinition()', async () => {
    const expectedError = new Error('Oops, something went wrong!')
    axios.get = jest.fn().mockRejectedValue(expectedError)

    await expect(async () => await destinyService.getDestinyInventoryItemDefinition('1')).rejects.toThrow(Error)
    await expect(async () => await destinyService.getDestinyInventoryItemDefinition('1')).rejects.toThrow('Oops, something went wrong!')
  })

  it('should retrieve the manifest', async () => {
    const expectedManifest = {
      data: {
        Response: { jsonWorldContentPaths: { en: { item1: 'something' } } }
      }
    }
    axios.get = jest.fn().mockResolvedValue(expectedManifest)

    const value = await destinyService.getManifestFile()

    expect(axios.get).toHaveBeenCalledWith(
      'https://www.bungie.net/Platform/Destiny2/Manifest/',
      {
        headers: {
          'x-api-key': config.configModel.apiKey
        }
      }
    )
    expect(value).toEqual(expectedManifest.data.Response.jsonWorldContentPaths.en)
  })

  it('should throw the error when the get call fails for getDestinyInventoryItemDefinition()', async () => {
    const expectedError = new Error('Oops, something went wrong!')
    axios.get = jest.fn().mockRejectedValue(expectedError)

    await expect(async () => await destinyService.getManifestFile()).rejects.toThrow(Error)
    await expect(async () => await destinyService.getManifestFile()).rejects.toThrow('Oops, something went wrong!')
  })

  it('should retrieve a users access token by using their refresh token', async () => {
    const expectedMembershipId = '123'
    const expectedRefreshExpiration = '456'
    const expectedRefreshToken = '789'
    const expectedAccessToken = '321'
    const expectedRefreshTokenInfo = new RefreshTokenInfo(expectedMembershipId, expectedRefreshExpiration, expectedRefreshToken, expectedAccessToken)
    const accessToken = { data: { membership_id: expectedMembershipId, refresh_expires_in: expectedRefreshExpiration, refresh_token: expectedRefreshToken, access_token: expectedAccessToken } }
    const refreshToken = '654'
    axios.post = jest.fn().mockResolvedValue(accessToken)

    const value = await destinyService.getAccessToken(refreshToken)

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
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-api-key': config.configModel.apiKey
        }
      }
    )
    expect(value).toEqual(expectedRefreshTokenInfo)
  })

  it('should throw the error when the get call fails for getDestinyInventoryItemDefinition()', async () => {
    const expectedError = new Error('Oops, something went wrong!')
    axios.post = jest.fn().mockRejectedValue(expectedError)

    await expect(async () => await destinyService.getAccessToken('1')).rejects.toThrow(Error)
    await expect(async () => await destinyService.getAccessToken('1')).rejects.toThrow('Oops, something went wrong!')
  })

  it('should check if a Destiny username exists based on a users Bungie username', async () => {
    const bungieUsername = 'name123'
    const bungieUsernameCode = '456'
    const expectedDestinyusername = 'coolGuy37'
    const result = { data: { Response: { name: expectedDestinyusername } } }
    axios.post = jest.fn().mockResolvedValue(result)

    const value = await destinyService.getDestinyUsername(bungieUsername, bungieUsernameCode)

    expect(axios.post).toHaveBeenCalledWith(
      'https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayerByBungieName/3/',
      {
        displayName: bungieUsername,
        displayNameCode: bungieUsernameCode
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.configModel.apiKey
        }
      }
    )
    expect(value).toEqual(result.data.Response)
  })

  it('should throw the error when the post call fails for getDestinyUsername()', async () => {
    const expectedError = new Error('Oops, something went wrong!')
    axios.post = jest.fn().mockRejectedValue(expectedError)

    await expect(async () => await destinyService.getDestinyUsername('1', '1')).rejects.toThrow(Error)
    await expect(async () => await destinyService.getDestinyUsername('1', '1')).rejects.toThrow('Oops, something went wrong!')
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

    const value = await destinyService.getDestinyVendorInfo(user, accessToken)

    expect(axios.get).toHaveBeenCalledWith(
      `https://www.bungie.net/Platform/Destiny2/3/Profile/${user.destinyId}/Character/${user.destinyCharacterId}/Vendors/`,
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
    expect(value).toEqual(result.data.Response.sales.data)
  })

  it('should throw the error when the get call fails for getDestinyVendorInfo()', async () => {
    const user = new User('name', 'code', 'discordId', 'channelId', 'destinyId', 'destinyCharacterId', 'expiration', 'token')
    const expectedError = new Error('Oops, something went wrong!')
    axios.get = jest.fn().mockRejectedValue(expectedError)

    await expect(async () => await destinyService.getDestinyVendorInfo(user, '1')).rejects.toThrow(Error)
    await expect(async () => await destinyService.getDestinyVendorInfo(user, '1')).rejects.toThrow('Oops, something went wrong!')
  })

  it('should retrieve the list of collectibles that exist in Destiny', async () => {
    const destinyId = 'destinyId'
    const result = {
      data: {
        Response: { profileCollectibles: { data: { collectibles: { item1: 'name' } } } }
      }
    }
    axios.get = jest.fn().mockResolvedValue(result)

    const value = await destinyService.getDestinyCollectibleInfo(destinyId)

    expect(axios.get).toHaveBeenCalledWith(
      `https://www.bungie.net/Platform/Destiny2/3/Profile/${destinyId}/`,
      {
        params: {
          components: 800
        },
        headers: {
          'x-api-key': config.configModel.apiKey
        }
      }
    )
    expect(value).toEqual(result.data.Response.profileCollectibles.data.collectibles)
  })

  it('should throw the error when the get call fails for getDestinyCollectibleInfo()', async () => {
    const expectedError = new Error('Oops, something went wrong!')
    axios.get = jest.fn().mockRejectedValue(expectedError)

    await expect(async () => await destinyService.getDestinyCollectibleInfo('1')).rejects.toThrow(Error)
    await expect(async () => await destinyService.getDestinyCollectibleInfo('1')).rejects.toThrow('Oops, something went wrong!')
  })
})
