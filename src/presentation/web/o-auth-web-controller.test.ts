import { DestinyClientConfig } from '../../infrastructure/destiny/config/destiny-client-config'
import { OAuthRequest } from './o-auth-request'
import { OAuthResponse } from './o-auth-response'
import { TokenInfo } from '../../infrastructure/destiny/token-info'
import { MongoUserRepository } from '../../infrastructure/persistence/mongo-user-repository'
import { DestinyClient } from '../../infrastructure/destiny/destiny-client'
import { OAuthWebController } from './o-auth-web-controller'
import path from 'path'
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

describe('OAuthWebController', () => {
  const destinyClient = new DestinyClient(
    new AxiosHttpClient(),
    new MongoUserRepository(),
    {} satisfies DestinyClientConfig
  )
  const mongoUserRepo = new MongoUserRepository()
  const oauthWebController = new OAuthWebController(destinyClient, mongoUserRepo)

  it('should handle the OAuth handshake', async () => {
    const request: OAuthRequest = { query: { code: '123' } }
    const mockResult: jest.Mocked<OAuthResponse> = { render: jest.fn(), sendFile: jest.fn() }
    const expectedBungieMembershipId = 'id'
    const expectedRefreshTokenExpirationTime = '1234'
    const expectedRefreshToken = 'token'
    const expectedAccessToken = 'access'
    const tokenInfo = new TokenInfo(
      expectedBungieMembershipId,
      expectedRefreshTokenExpirationTime,
      expectedRefreshToken,
      expectedAccessToken
    )
    const expectedDestinyId = 'destinyId'
    const expectedBungieUsername = 'username'
    const expectedDestinyCharacterId = 'characterId'
    jest.spyOn(destinyClient, 'getRefreshTokenInfo').mockResolvedValue(tokenInfo)
    jest.spyOn(destinyClient, 'getDestinyMembershipInfo').mockResolvedValue(
      [expectedDestinyId, expectedBungieUsername]
    )
    jest.spyOn(destinyClient, 'getDestinyCharacterIds').mockResolvedValue(expectedDestinyCharacterId)
    mongoUserRepo.updateUserByUsername = jest.fn()

    await oauthWebController.handleOAuth(request, mockResult)

    expect(mockResult.render).toHaveBeenCalledWith('landing-page.mustache', { guardian: expectedBungieUsername })
  })

  it('should return an error page when the request code is undefined', async () => {
    const request = { query: { code: undefined } } as unknown as OAuthRequest
    const mockResult: jest.Mocked<OAuthResponse> = { render: jest.fn(), sendFile: jest.fn() }
    const consoleSpy = jest.spyOn(console, 'log')

    await oauthWebController.handleOAuth(request, mockResult)

    expect(consoleSpy).toHaveBeenCalledWith('Error with retreving code from authorization url on landing page')
    expect(consoleSpy).toHaveBeenCalledWith(request)
    expect(mockResult.sendFile).toHaveBeenCalledWith(
      path.join('example/somewhere/src/presentation/views/landing-page-error.html')
    )
  })
})
