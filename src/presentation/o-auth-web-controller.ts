import { Request, ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'
import { TokenInfo } from '../domain/token-info.js'
import { MongoUserRepository } from '../infrastructure/database/mongo-user-repository.js'
import { DestinyApiClient } from '../infrastructure/destiny/destiny-api-client.js'

export class OAuthWebController {
  constructor (
    private readonly destinyApiClient: DestinyApiClient,
    private readonly mongoUserRepo: MongoUserRepository
  ) {}

  async handleOAuth (
    app: { get: (arg0: string) => any },
    request: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    result: { render: (arg0: string, arg1: { guardian: string }) => void, sendFile: (arg0: string) => void }
  ): Promise<void> {
    if (request.query.code !== undefined) {
      try {
        const guardian = await this.handleAuthorizationCode(String(request.query.code), result)
        if (typeof guardian === 'string') {
          result.render('landing-page.mustache', { guardian })
        }
      } catch (error) {
        console.log('Error with landing page')
        throw error
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
  async handleAuthorizationCode (authorizationCode: string, result: any): Promise<void | string> {
    try {
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
    } catch (error) {
      console.log('Error occurred while handling authorization code')
      throw error
    }
  }
}
