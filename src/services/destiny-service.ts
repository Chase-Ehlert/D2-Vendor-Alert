import { DestinyApiClient } from '../destiny/destiny-api-client.js'

export class DestinyService {
  constructor (private readonly destinyApiClient: DestinyApiClient) { }

  /**
     * Looks for a Destiny username that belongs to a user's Bungie username
     */
  async getDestinyUsername (bungieUsername: string, bungieUsernameCode: string): Promise<any> {
    const { data } = await this.destinyApiClient.getDestinyUsername(bungieUsername, bungieUsernameCode)

    return data.Response
  }
}
