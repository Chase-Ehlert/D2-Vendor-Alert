import logger from '../utility/logger.js'
import { HttpClient } from '../utility/http-client.js'
import { DestinyApiClientConfig } from './config/destiny-api-client-config.js'
import { UserInterface } from '../database/models/user.js'
import { UserRepository } from '../database/user-repository.js'
import { TokenInfo } from '../services/models/token-info.js'
import { Mod } from '../services/models/mod.js'
import { Collectible } from '../services/models/collectible.js'
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
    private readonly database: UserRepository,
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

  async getDestinyInventoryItemDefinition (): Promise<Map<string, string>> {
    try {
      const { data } = await this.httpClient.get(
        this.bungieDomainWithDestinyDirectory + 'manifest/', {
          headers: this.apiKeyHeader
        })
      const manifestFileName: string = data.Response.jsonWorldContentPaths.en

      try {
        const response = await this.httpClient.get(this.bungieDomain + manifestFileName)

        return this.getDestinyInventoryModDescriptions(response.data.DestinyInventoryItemDefinition)
      } catch (error) {
        logger.error(error)
        throw new Error('Could not retreive Destiny inventory item definition')
      }
    } catch (error) {
      logger.error(error)
      throw new Error('Could not retreive Destiny manifest file name')
    }
  }

  async getVendorInfo (destinyId: string, destinyCharacterId: string, refreshToken: string): Promise<Mod[]> {
    const getVendorSalesComponent = 402
    const tokenInfo = await this.getAccessTokenInfo(refreshToken)

    await this.database.updateUserByMembershipId(
      tokenInfo.bungieMembershipId,
      tokenInfo.refreshTokenExpirationTime,
      tokenInfo.refreshToken
    )

    try {
      const { data } = await this.httpClient.get(
        this.bungieDomainWithDestinyDirectory +
        this.profileDirectory +
        `${destinyId}/Character/${destinyCharacterId}/Vendors/`, {
          params: {
            components: getVendorSalesComponent
          },
          headers: {
            Authorization: `Bearer ${tokenInfo.accessToken}`,
            'x-api-key': this.config.apiKey
          }
        })

      return this.getAdaMerchandise(data.Response.sales.data)
    } catch (error) {
      logger.error(error)
      throw new Error('Could not retreive Destiny vendor information')
    }
  }

  async getCollectibleInfo (destinyId: string): Promise<String[]> {
    const getCollectiblesComponent = 800

    try {
      const { data } = await this.httpClient.get(
        this.bungieDomainWithDestinyDirectory + this.profileDirectory + `${destinyId}/`, {
          params: {
            components: getCollectiblesComponent
          },
          headers: this.apiKeyHeader
        })

      return this.getUnownedMods(data.Response.profileCollectibles.data.collectibles)
    } catch (error) {
      logger.error(error)
      throw new Error('Could not retreive Destiny collectible information')
    }
  }

  /**
   * Check the token expiration date and update it if it's expired
   */
  async checkRefreshTokenExpiration (user: UserInterface): Promise<void> {
    const currentDate = new Date()
    const expirationDate = new Date(String(user.refreshExpiration))
    expirationDate.setDate(expirationDate.getDate() - 1)

    if (currentDate.getTime() > expirationDate.getTime()) {
      const tokenInfo = await this.getAccessTokenInfo(user.refreshToken)
      await this.database.updateUserByMembershipId(
        tokenInfo.bungieMembershipId,
        tokenInfo.refreshTokenExpirationTime,
        tokenInfo.refreshToken
      )
    }
  }

  async getRefreshTokenInfo (
    authorizationCode: string,
    result: { sendFile: (arg0: string, arg1: { root: string }) => void }
  ): Promise<TokenInfo | void> {
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

      return new TokenInfo(
        data.membership_id,
        data.refresh_expires_in,
        data.refresh_token
      )
    } catch (error) {
      logger.error('Error occurred while making the refresh token call with an authorization code')
      logger.error(authorizationCode)
      if (result != null) {
        result.sendFile('landing-page-error-auth-code.html', { root: path.join(metaUrl, 'src/views') })
      }
    }
  }

  /**
     * Retrieves the merchandise sold by Ada
     */
  private getAdaMerchandise (vendorMerchandise: { [x: string]: { saleItems: any } }): Mod[] {
    let adaMerchandise
    const adaVendorId = '350061650'

    for (const vendorId in vendorMerchandise) {
      if (vendorId === adaVendorId) {
        adaMerchandise = vendorMerchandise[vendorId].saleItems
      }
    }

    return Object.values(adaMerchandise).map((item: Mod) => (new Mod(item.itemHash)))
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

  private getDestinyInventoryModDescriptions (
    destinyInventoryItemDefinition: { [s: string]: unknown } | ArrayLike<unknown>
  ): Map<string, string> {
    const filteredInventory = Object.values(destinyInventoryItemDefinition).filter((item: Partial<Mod>) => {
      return (JSON.stringify(item.itemType) === '19') &&
      (Boolean(Object.prototype.hasOwnProperty.call(item, 'hash')))
    })

    const destinyInventoryMods: Mod[] = Object.values(filteredInventory).map((
      { displayProperties, itemType, hash }: any
    ) => (
      new Mod(hash, displayProperties.name, itemType)
    ))

    return new Map(destinyInventoryMods.map(mod => [mod.itemHash, mod.displayPropertyName]))
  }

  /**
     * Retrieve the user's access token by calling the Destiny API with their refresh token
     */
  private async getAccessTokenInfo (refreshToken: string): Promise<TokenInfo> {
    try {
      const response = await this.httpClient.post(
        this.bungieDomainWithTokenDirectory, {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: this.config.oauthClientId,
          client_secret: this.config.oauthSecret
        }, {
          headers: this.urlEncodedHeaders
        })

      return new TokenInfo(
        response.data.membership_id,
        response.data.refresh_expires_in,
        response.data.refresh_token,
        response.data.access_token
      )
    } catch (error) {
      logger.error(error)
      throw new Error('Could not retreive access token information')
    }
  }

  /**
     * Retrieves the list of unowned mods for a user
     */
  private getUnownedMods (collectibleData: ArrayLike<unknown> | { [s: string]: unknown }): String[] {
    const unownedModStateId = 65
    const collectibles = Object.entries(collectibleData).map(([id, value]: [string, {state: number}]) => new Collectible(id, value.state))
    const collectibleMods = collectibles.filter(mod => mod.state === unownedModStateId)

    return collectibleMods.map(collectible => collectible.id)
  }
}
