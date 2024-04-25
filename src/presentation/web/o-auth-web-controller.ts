import express from 'express'
import { TokenInfo } from '../../domain/token-info'
import { MongoUserRepository } from '../../infrastructure/database/mongo-user-repository'
import { DestinyApiClient } from '../../infrastructure/destiny/destiny-api-client'
import { OAuthResponse } from '../../domain/o-auth-response'
import { OAuthRequest } from '../../domain/o-auth-request'

export class OAuthWebController {
  constructor (
    private readonly destinyApiClient: DestinyApiClient,
    private readonly mongoUserRepo: MongoUserRepository
  ) {}

  async handleOAuth (
    app: express.Application,
    request: OAuthRequest,
    result: OAuthResponse
  ): Promise<void> {
    if (request.query.code !== undefined) {
      const guardian = await this.handleAuthorizationCode(request.query.code, result)
      if (typeof guardian === 'string') {
        result.render('landing-page.mustache', { guardian })
      }
    } else {
      console.log('Error with retreving code from authorization url on landing page')
      console.log(request)
      const errorLandingPagePath = String(app.get('views')) + '/landing-page-error.html'
      result.sendFile(errorLandingPagePath)
    }
  }

  /**
 * Uses the authorization code to retreive the user's token information and then save it to the database
 */
  private async handleAuthorizationCode (
    authorizationCode: string,
    result: OAuthResponse
  ): Promise<void | string> {
    const tokenInfo = await this.destinyApiClient.getRefreshTokenInfo(authorizationCode, result)

    if (tokenInfo instanceof TokenInfo) {
      const destinyMembershipInfo = await this.destinyApiClient.getDestinyMembershipInfo(tokenInfo.bungieMembershipId)
      const destinyCharacterId = await this.destinyApiClient.getDestinyCharacterIds(destinyMembershipInfo[0])

      await this.mongoUserRepo.updateUserByUsername(
        destinyMembershipInfo[1],
        tokenInfo.refreshTokenExpirationTime,
        tokenInfo.refreshToken,
        destinyMembershipInfo[0],
        destinyCharacterId
      )

      return destinyMembershipInfo[1]
    }
  }
}