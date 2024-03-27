import { DestinyApiClient } from '../destiny/destiny-api-client.js'

export class DestinyService {
  constructor (private readonly destinyApiClient: DestinyApiClient) { }

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
