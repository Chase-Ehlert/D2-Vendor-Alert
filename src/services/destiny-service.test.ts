import { IncomingMessage, ServerResponse } from 'http'
import { DestinyService } from './destiny-service'
import { Socket } from 'net'
import { RefreshTokenInfo } from './models/refresh-token-info'
import { DestinyApiClient } from '../destiny/destiny-api-client'
import { AxiosHttpClient } from '../utility/axios-http-client'
import { DESTINY_API_CLIENT_CONFIG } from '../config/config'

jest.mock('./../utility/logger', () => {
  return {
    info: jest.fn(),
    error: jest.fn()
  }
})

jest.mock('./../utility/url', () => {
  return 'example'
})

beforeEach(() => {
  jest.resetAllMocks()
})

describe('<DestinyService/>', () => {
  const destinyApiClient = new DestinyApiClient(new AxiosHttpClient(), DESTINY_API_CLIENT_CONFIG)
  const destinyService = new DestinyService(destinyApiClient)

  it('should instantiate', async () => {
    expect(destinyService).not.toBeNull()
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
    jest.spyOn(destinyApiClient, 'getRefreshTokenInfo').mockResolvedValue({
      data: {
        membership_id: expectedMembershipId,
        refresh_expires_in: expectedRefreshExpiration,
        refresh_token: expectedRefreshToken
      }
    })

    const value = await destinyService.getRefreshTokenInfo(
      expectedAuthCode,
      new ServerResponse(new IncomingMessage(new Socket()))
    )

    expect(value).toEqual(expectedRefreshTokenInfo)
  })

  it('should redirect when the call to destiny api client fails', async () => {
    const expectedResult: any = { sendFile: jest.fn() }
    const expectedError = { err: { message: 'Oops, something went wrong' } }
    jest.spyOn(destinyApiClient, 'getRefreshTokenInfo').mockRejectedValue(expectedError)

    await destinyService.getRefreshTokenInfo('1', expectedResult)

    expect(expectedResult.sendFile).toBeCalledWith('landing-page-error-auth-code.html', expect.any(Object))
  })

  it('should retrieve the Destiny membership information for a user', async () => {
    const membershipId = '123'
    const expectedDestinyMembershipId = '456'
    const expectedDisplayName = 'guardian'
    const membershipInfo = {
      data: {
        Response: {
          destinyMemberships: [{
            membershipId: expectedDestinyMembershipId,
            displayName: expectedDisplayName
          }]
        }
      }
    }
    jest.spyOn(destinyApiClient, 'getDestinyMembershipInfo').mockResolvedValue(membershipInfo)

    const value = await destinyService.getDestinyMembershipInfo(membershipId)

    expect(value).toEqual([expectedDestinyMembershipId, expectedDisplayName])
  })

  it('should retrieve the Destiny character information for a user', async () => {
    const expectedMembershipId = '123'
    const expectedCharacterId = '456'
    const characterInfo = { data: { Response: { profile: { data: { characterIds: [expectedCharacterId] } } } } }
    jest.spyOn(destinyApiClient, 'getDestinyCharacterIds').mockResolvedValue(characterInfo)

    const value = await destinyService.getDestinyCharacterId(expectedMembershipId)

    expect(value).toEqual(expectedCharacterId)
  })

  it('should check if a Destiny username exists based on a users Bungie username', async () => {
    const bungieUsername = 'name123'
    const bungieUsernameCode = '456'
    const expectedDestinyusername = 'coolGuy37'
    const usernameInfo = { data: { Response: { name: expectedDestinyusername } } }
    jest.spyOn(destinyApiClient, 'getDestinyUsername').mockResolvedValue(usernameInfo)

    const value = await destinyService.getDestinyUsername(bungieUsername, bungieUsernameCode)

    expect(value).toEqual(usernameInfo.data.Response)
  })
})
