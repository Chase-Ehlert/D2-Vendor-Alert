import { DestinyApiClientConfig } from '../../infrastructure/destiny/destiny-api-client-config'
import { OAuthRequest } from '../../domain/o-auth-request'
import { OAuthResponse } from '../../domain/o-auth-response'
import { TokenInfo } from '../../domain/token-info'
import { AxiosHttpClient } from '../../infrastructure/database/axios-http-client'
import { MongoUserRepository } from '../../infrastructure/database/mongo-user-repository'
import { DestinyApiClient } from '../../infrastructure/destiny/destiny-api-client'
import { OAuthWebController } from './o-auth-web-controller'
import express from 'express'
import path from 'path'

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
  const destinyApiClient = new DestinyApiClient(
    new AxiosHttpClient(),
    new MongoUserRepository(),
    {} satisfies DestinyApiClientConfig
  )
  const mongoUserRepo = new MongoUserRepository()
  const oauthWebController = new OAuthWebController(destinyApiClient, mongoUserRepo)

  it('should handle the OAuth handshake', async () => {
    const mockApp = express()
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
    jest.spyOn(destinyApiClient, 'getRefreshTokenInfo').mockResolvedValue(tokenInfo)
    jest.spyOn(destinyApiClient, 'getDestinyMembershipInfo').mockResolvedValue(
      [expectedDestinyId, expectedBungieUsername]
    )
    jest.spyOn(destinyApiClient, 'getDestinyCharacterIds').mockResolvedValue(expectedDestinyCharacterId)
    mongoUserRepo.updateUserByUsername = jest.fn()

    await oauthWebController.handleOAuth(mockApp, request, mockResult)

    expect(mockResult.render).toHaveBeenCalledWith('landing-page.mustache', { guardian: expectedBungieUsername })
  })

  it('should return an error page when the request code is undefined', async () => {
    const mockApp = express()
    const request = { query: { code: undefined } } as unknown as OAuthRequest
    const mockResult: jest.Mocked<OAuthResponse> = { render: jest.fn(), sendFile: jest.fn() }
    const consoleSpy = jest.spyOn(console, 'log')

    await oauthWebController.handleOAuth(mockApp, request, mockResult)

    expect(consoleSpy).toHaveBeenCalledWith('Error with retreving code from authorization url on landing page')
    expect(consoleSpy).toHaveBeenCalledWith(request)
    expect(mockResult.sendFile).toHaveBeenCalledWith(
      path.join('example/somewhere/src/presentation/views/landing-page-error.html')
    )
  })
})
