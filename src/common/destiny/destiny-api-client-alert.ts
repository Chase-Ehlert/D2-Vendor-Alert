import logger from '../utility/logger.js'
import { HttpClient } from '../utility/http-client.js'
import { DestinyApiClientConfig } from './config/destiny-api-client-config.js'
import path from 'path'
import metaUrl from '../utility/url.js'

export class DestinyApiClient {
  private readonly apiKeyHeader
  private readonly urlEncodedHeaders
  private readonly bungieDomain = 'https://www.bungie.net/'
  private readonly bungieDomainWithTokenDirectory = 'https://www.bungie.net/platform/app/oauth/token/'
  private readonly bungieDomainWithDestinyDirectory = 'https://www.bungie.net/platform/destiny2/'
  private readonly profileDirectory = '3/profile/'

  constructor (
    private readonly httpClient: HttpClient,
    private readonly config: DestinyApiClientConfig
  ) {
    this.apiKeyHeader = { 'x-api-key': this.config.apiKey }
    this.urlEncodedHeaders = {
      'content-type': 'application/x-www-form-urlencoded',
      'x-api-key': this.config.apiKey
    }
  }

  async getDestinyMembershipInfo (membershipId: string): Promise<string[]> {
    try {
      const { data } = await this.httpClient.get(
        this.bungieDomain + `platform/User/GetMembershipsById/${membershipId}/3/`, {
          headers: this.apiKeyHeader
        })

      return [
        data.Response.destinyMemberships[0].membershipId,
        data.Response.destinyMemberships[0].displayName
      ]
    } catch (error) {
      logger.error(error)
      throw new Error('Could not retreive Destiny membership information')
    }
  }

  async getDestinyCharacterIds (destinyMembershipId: string): Promise<string> {
    const getProfilesComponent = 100

    try {
      const { data } = await this.httpClient.get(
        this.bungieDomainWithDestinyDirectory + this.profileDirectory + destinyMembershipId + '/', {
          headers: this.apiKeyHeader,
          params: {
            components: getProfilesComponent
          }
        })

      return data.Response.profile.data.characterIds[0]
    } catch (error) {
      logger.error(error)
      throw new Error('Could not retreive Destiny character ids')
    }
  }

  async getDestinyUsername (bungieUsername: string, bungieUsernameCode: string): Promise<[]> {
    try {
      const { data } = await this.httpClient.post(
        this.bungieDomainWithDestinyDirectory + 'SearchDestinyPlayerByBungieName/3/', {
          displayName: bungieUsername,
          displayNameCode: bungieUsernameCode
        }, {
          headers: {
            'content-type': 'application/json',
            'x-api-key': this.config.apiKey
          }
        })

      return data.Response
    } catch (error) {
      logger.error(error)
      throw new Error('Could not retreive Destiny username')
    }
  }
}
