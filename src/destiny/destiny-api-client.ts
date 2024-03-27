import logger from '../utility/logger.js'
import { HttpClient } from '../utility/http-client.js'
import { DestinyApiClientConfig } from './config/destiny-api-client-config.js'
import { RefreshTokenInfo } from '../services/models/refresh-token-info.js'
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

  async getRefreshTokenInfo (
    authorizationCode: string,
    result: { sendFile: (arg0: string, arg1: { root: string }) => void }
  ): Promise<RefreshTokenInfo | void> {
    try {
      const { data } = await this.httpClient.post(
        this.bungieDomainWithTokenDirectory,
        {
          grant_type: 'authorization_code',
          code: authorizationCode,
          client_secret: this.config.oauthSecret,
          client_id: this.config.oauthClientId
        }, {
          headers: this.urlEncodedHeaders
        })

      return new RefreshTokenInfo(
        data.membership_id,
        data.refresh_expires_in,
        data.refresh_token
      )
    } catch (error) {
      logger.error('Error occurred while making the refresh token call with an authorization code')
      logger.error(authorizationCode)
      console.log('apple')
      if (result != null) {
        console.log('banana')
        result.sendFile('landing-page-error-auth-code.html', { root: path.join(metaUrl, 'src/views') })
      }
    }
  }

  async getDestinyMembershipInfo (membershipId: string): Promise<any> {
    try {
      return await this.httpClient.get(
        this.bungieDomain + `platform/User/GetMembershipsById/${membershipId}/3/`, {
          headers: this.apiKeyHeader
        })
    } catch (error) {
      logger.error(error)
      throw new Error('Could not retreive Destiny membership information')
    }
  }

  async getDestinyCharacterIds (destinyMembershipId: string): Promise<any> {
    const getProfilesComponent = 100

    try {
      return await this.httpClient.get(
        this.bungieDomainWithDestinyDirectory + this.profileDirectory + destinyMembershipId + '/', {
          headers: this.apiKeyHeader,
          params: {
            components: getProfilesComponent
          }
        })
    } catch (error) {
      logger.error(error)
      throw new Error('Could not retreive Destiny character ids')
    }
  }

  async getDestinyUsername (bungieUsername: string, bungieUsernameCode: string): Promise<any> {
    try {
      return await this.httpClient.post(
        this.bungieDomainWithDestinyDirectory + 'SearchDestinyPlayerByBungieName/3/', {
          displayName: bungieUsername,
          displayNameCode: bungieUsernameCode
        }, {
          headers: {
            'content-type': 'application/json',
            'x-api-key': this.config.apiKey
          }
        })
    } catch (error) {
      logger.error(error)
      throw new Error('Could not retreive Destiny username')
    }
  }
}
