import express from 'express'
import { TokenInfo } from '../../infrastructure/destiny/token-info.js'
import { MongoUserRepository } from '../../infrastructure/persistence/mongo-user-repository.js'
import { DestinyClient } from '../../infrastructure/destiny/destiny-client.js'
import { OAuthResponse } from './o-auth-response.js'
import { OAuthRequest } from './o-auth-request.js'
import path from 'path'
import metaUrl from '../../testing-helpers/url.js'

export class OAuthWebController {
  constructor (
    private readonly destinyClient: DestinyClient,
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
      result.sendFile(path.join(metaUrl, 'src/presentation/views/landing-page-error.html'))
    }
  }

  /**
 * Uses the authorization code to retreive the user's token information and then save it to the database
 */
  private async handleAuthorizationCode (
    authorizationCode: string,
    result: OAuthResponse
  ): Promise<void | string> {
    const tokenInfo = await this.destinyClient.getRefreshTokenInfo(authorizationCode, result)

    if (tokenInfo instanceof TokenInfo) {
      const destinyMembershipInfo = await this.destinyClient.getDestinyMembershipInfo(tokenInfo.bungieMembershipId)
      const destinyCharacterId = await this.destinyClient.getDestinyCharacterIds(destinyMembershipInfo[0])

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
