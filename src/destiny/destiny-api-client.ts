import axios from 'axios'
import { config } from '../../config/config.js'

export class DestinyApiClient {
  private readonly bungieDomain = 'https://www.bungie.net/'
  private readonly bungieDomainWithTokenDirectory = 'https://www.bungie.net/platform/app/oauth/token/'
  private readonly bungieDomainWithDestinyDirectory = 'https://www.bungie.net/platform/destiny2/'
  private readonly profileDirectory = '3/profile/'
  private readonly apiKeyHeader = { 'x-api-key': config.configModel.apiKey }
  private readonly urlEncodedHeaders = {
    'content-type': 'application/x-www-form-urlencoded',
    'x-api-key': config.configModel.apiKey
  }

  async getRefreshTokenInfo (authorizationCode: string): Promise<any> {
    console.log('auth code')
    console.log(authorizationCode)
    return await axios.post(
      this.bungieDomainWithTokenDirectory, {
        grant_type: 'authorization_code',
        code: authorizationCode,
        client_secret: config.configModel.oauthSecret,
        client_id: config.configModel.oauthClientId
      }, {
        headers: this.urlEncodedHeaders
      })
  }

  async getDestinyMembershipInfo (membershipId: string): Promise<any> {
    return await axios.get(
      this.bungieDomain + `platform/User/GetMembershipsById/${membershipId}/3/`, {
        headers: this.apiKeyHeader
      })
  }

  async getDestinyCharacterIds (destinyMembershipId: string): Promise<any> {
    const getProfilesComponent = 100

    return await axios.get(
      this.bungieDomainWithDestinyDirectory + this.profileDirectory + destinyMembershipId + '/', {
        headers: this.apiKeyHeader,
        params: {
          components: getProfilesComponent
        }
      })
  }

  async getDestinyInventoryItemDefinition (): Promise<any> {
    const { data } = await axios.get(
      this.bungieDomainWithDestinyDirectory + 'manifest/', {
        headers: this.apiKeyHeader
      })
    const manifestFileName: string = data.Response.jsonWorldContentPaths.en

    return await axios.get(
      this.bungieDomain + manifestFileName
    )
  }

  async getAccessTokenInfo (refreshToken: string): Promise<any> {
    try {
      return await axios.post(
        this.bungieDomainWithTokenDirectory, {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: config.configModel.oauthClientId,
          client_secret: config.configModel.oauthSecret
        }, {
          headers: this.urlEncodedHeaders
        })
    } catch (error) {
      throw Error('Could not fetch access token info')
    }
  }

  async getDestinyUsername (bungieUsername: string, bungieUsernameCode: string): Promise<any> {
    return await axios.post(
      this.bungieDomainWithDestinyDirectory + 'SearchDestinyPlayerByBungieName/3/', {
        displayName: bungieUsername,
        displayNameCode: bungieUsernameCode
      }, {
        headers: {
          'content-type': 'application/json',
          'x-api-key': config.configModel.apiKey
        }
      })
  }

  async getDestinyVendorInfo (destinyId: string, destinyCharacterId: string, accessToken: string): Promise<any> {
    const getVendorSalesComponent = 402

    return await axios.get(
      this.bungieDomainWithDestinyDirectory +
      this.profileDirectory +
      `${destinyId}/Character/${destinyCharacterId}/Vendors/`, {
        params: {
          components: getVendorSalesComponent
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'x-api-key': config.configModel.apiKey
        }
      })
  }

  async getDestinyCollectibleInfo (destinyId: string): Promise<any> {
    const getCollectiblesComponent = 800

    return await axios.get(
      this.bungieDomainWithDestinyDirectory + this.profileDirectory + `${destinyId}/`, {
        params: {
          components: getCollectiblesComponent
        },
        headers: this.apiKeyHeader
      })
  }
}
