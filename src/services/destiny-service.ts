import { RefreshTokenInfo } from './models/refresh-token-info.js'
import { DestinyApiClient } from '../destiny/destiny-api-client.js'
import logger from '../utility/logger.js'
import path from 'path'
import metaUrl from '../utility/url.js'

export class DestinyService {
  constructor (private readonly destinyApiClient: DestinyApiClient) { }

  /**
     * Retrieves refresh token for a user
     */
  async getRefreshTokenInfo (authorizationCode: string, result: any): Promise<void | RefreshTokenInfo | any> {
    try {
      const { data } = await this.destinyApiClient.getRefreshTokenInfo(authorizationCode)

      return new RefreshTokenInfo(
        data.membership_id,
        data.refresh_expires_in,
        data.refresh_token
      )
    } catch (error) {
      logger.error('Error occurred while making the refresh token call with an authorization code')
      logger.error(authorizationCode)
      result.sendFile('landing-page-error-auth-code.html', { root: path.join(metaUrl, 'src/views') })
    }
  }

  /**
     * Retrieves Destiny membership information for a user
     */
  async getDestinyMembershipInfo (membershipId: string): Promise<string[]> {
    const { data } = await this.destinyApiClient.getDestinyMembershipInfo(membershipId)

    return [
      data.Response.destinyMemberships[0].membershipId,
      data.Response.destinyMemberships[0].displayName
    ]
  }

  /**
    * Retrieves Destiny character information for a user
    */
  async getDestinyCharacterId (destinyMembershipId: string): Promise<string> {
    const { data } = await this.destinyApiClient.getDestinyCharacterIds(destinyMembershipId)

    return data.Response.profile.data.characterIds[0]
  }

  /**
     * Looks for a Destiny username that belongs to a user's Bungie username
     */
  async getDestinyUsername (bungieUsername: string, bungieUsernameCode: string): Promise<any> {
    const { data } = await this.destinyApiClient.getDestinyUsername(bungieUsername, bungieUsernameCode)

    return data.Response
  }
}
