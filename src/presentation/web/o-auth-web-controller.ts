import { Request, ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'
import { TokenInfo } from '../../domain/token-info'
import { MongoUserRepository } from '../../infrastructure/database/mongo-user-repository'
import { DestinyApiClient } from '../../infrastructure/destiny/destiny-api-client'
import { OAuthResponseHandler } from '../../domain/o-auth-response-handler'

export class OAuthWebController {
  constructor (
    private readonly destinyApiClient: DestinyApiClient,
    private readonly mongoUserRepo: MongoUserRepository
  ) {}

  async handleOAuth (
    app: { get: (arg0: string) => any },
    request: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    result: OAuthResponseHandler
  ): Promise<void> {
    if (request.query.code !== undefined) {
      const guardian = await this.handleAuthorizationCode(String(request.query.code), result)
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
    result: OAuthResponseHandler
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
