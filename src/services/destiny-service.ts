import { UserInterface } from '../database/models/user.js'
import { RefreshTokenInfo } from './models/refresh-token-info.js'
import { DestinyApiClient } from '../destiny/destiny-api-client.js'
import logger from '../utility/logger.js'
import path from 'path'
import metaUrl from '../utility/url.js'

export class DestinyService {
  private readonly destinyApiClient

  constructor (destinyApiClient: DestinyApiClient) {
    this.destinyApiClient = destinyApiClient
  }

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
      logger.error('Error occurred while making the refresh token call with a authorization code')
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
     * Retrieves the list of definitions of Destiny items for a specified manifest file
     */
  async getDestinyInventoryItemDefinition (): Promise<any> {
    const manifest = await this.destinyApiClient.getDestinyInventoryItemDefinition()

    return manifest.DestinyInventoryItemDefinition
  }

  /**
     * Retrieve the user's access token by calling the Destiny API with their refresh token
     */
  async getAccessToken (refreshToken: string): Promise<RefreshTokenInfo | undefined> {
    try {
      const { data } = await this.destinyApiClient.getAccessTokenInfo(refreshToken)

      return new RefreshTokenInfo(
        data.membership_id,
        data.refresh_expires_in,
        data.refresh_token,
        data.access_token
      )
    } catch (error) {
      logger.error('Issue with retreiving refresh token')
      logger.error(error)
    }
  }

  /**
     * Looks for a Destiny username that belongs to a user's Bungie username
     */
  async getDestinyUsername (bungieUsername: string, bungieUsernameCode: string): Promise<any> {
    const usernameInfo = await this.destinyApiClient.getDestinyUsername(bungieUsername, bungieUsernameCode)

    return usernameInfo.Response
  }

  /**
     * Retrieves the list of vendors and their inventory
     */
  async getDestinyVendorInfo (user: UserInterface, accessToken: string): Promise<any> {
    const { data } = await this.destinyApiClient.getDestinyVendorInfo(
      user.destinyId,
      user.destinyCharacterId,
      accessToken
    )

    return data.Response.sales.data
  }

  /**
     * Retrieves the list of collectibles that exist in Destiny
     */
  async getDestinyCollectibleInfo (destinyId: string): Promise<any> {
    const { data } = await this.destinyApiClient.getDestinyCollectibleInfo(destinyId)

    return data.Response.profileCollectibles.data.collectibles
  }
}
