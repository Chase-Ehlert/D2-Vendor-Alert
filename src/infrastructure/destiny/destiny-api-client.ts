import { HttpClient } from '../../domain/http-client.js'
import { DestinyApiClientConfig } from '../../configs/destiny-api-client-config.js'
import { UserInterface } from '../../domain/user.js'
import { UserRepository } from '../../domain/user-repository.js'
import { TokenInfo } from '../../domain/token-info.js'
import { Merchandise, Mod } from '../../domain/mod.js'
import { Collectible } from '../../domain/collectible.js'
import path from 'path'
import metaUrl from '../../testing-helpers/url.js'
import { OAuthResponse } from '../../domain/o-auth-response.js'

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
    const { data } = await this.httpClient.get(
      this.bungieDomain + `platform/User/GetMembershipsById/${membershipId}/3/`, {
        headers: this.apiKeyHeader
      })

    if (data.Response.destinyMemberships[0].membershipId !== undefined &&
      data.Response.destinyMemberships[0].displayName !== undefined
    ) {
      return [
        data.Response.destinyMemberships[0].membershipId,
        data.Response.destinyMemberships[0].displayName
      ]
    } else {
      throw new Error('Membership ID or Display Name are undefined.')
    }
  }

  async getDestinyCharacterIds (destinyMembershipId: string): Promise<string> {
    const getProfilesComponent = 100
    const { data } = await this.httpClient.get(
      this.bungieDomainWithDestinyDirectory + this.profileDirectory + destinyMembershipId + '/', {
        headers: this.apiKeyHeader,
        params: {
          components: getProfilesComponent
        }
      })

    if (data.Response.profile.data.characterIds[0] !== undefined) {
      return data.Response.profile.data.characterIds[0]
    } else {
      throw new Error('Character ID is undefined!')
    }
  }

  async getDestinyEquippableMods (): Promise<Mod[]> {
    const { data } = await this.httpClient.get(
      this.bungieDomainWithDestinyDirectory + 'manifest/', {
        headers: this.apiKeyHeader
      })

    const manifestFileName: string = data.Response.jsonWorldContentPaths.en
    const response = await this.httpClient.get(this.bungieDomain + manifestFileName)

    const convertResponseToMods = Object.values(response.data.DestinyInventoryItemDefinition).map(
      (mod: Mod) => (
        new Mod(mod.hash, mod.displayProperties, mod.itemType)
      )
    )

    const filterOutUnequippableMods = convertResponseToMods.filter((mod: Mod) => {
      return (JSON.stringify(mod.itemType) === '19') &&
      (Boolean(Object.prototype.hasOwnProperty.call(mod, 'hash')))
    })

    return filterOutUnequippableMods
  }

  async getVendorInfo (
    destinyId: string,
    destinyCharacterId: string,
    refreshToken: string
  ): Promise<string[]> {
    const getVendorSalesComponent = 402
    const tokenInfo = await this.getTokenInfo(refreshToken)

    await this.database.updateUserByMembershipId(tokenInfo)

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

    const vendorMerchandiseMap = new Map<string, Map<string, Mod>>()

    Object.entries(data.Response.sales.data).map(
      ([vendorId, vendorMerchandise]: [string, {saleItems: Map<string, Mod>}]) =>
        vendorMerchandiseMap.set(vendorId, vendorMerchandise.saleItems)
    )

    return this.getAdaMerchandiseHashes('350061650', vendorMerchandiseMap)
  }

  async getCollectibleInfo (destinyId: string): Promise<String[]> {
    const getCollectiblesComponent = 800
    const { data } = await this.httpClient.get(
      this.bungieDomainWithDestinyDirectory + this.profileDirectory + `${destinyId}/`, {
        params: {
          components: getCollectiblesComponent
        },
        headers: this.apiKeyHeader
      })

    const collectibles = Object.entries(data.Response.profileCollectibles.data.collectibles).map(
      ([id, value]: [string, {state: number}]) => new Collectible(id, value.state)
    )

    return this.getUnownedMods(collectibles)
  }

  /**
   * Check the token expiration date and update it if it's expired
   */
  async checkRefreshTokenExpiration (user: UserInterface): Promise<void> {
    const currentDate = new Date()
    const expirationDate = new Date(user.refreshExpiration)
    expirationDate.setDate(expirationDate.getDate() - 1)

    if (currentDate.getTime() > expirationDate.getTime()) {
      const tokenInfo = await this.getTokenInfo(user.refreshToken)
      await this.database.updateUserByMembershipId(tokenInfo)
    }
  }

  async getRefreshTokenInfo (
    authorizationCode: string,
    result: OAuthResponse
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

      if (data.membership_id !== undefined &&
        data.refresh_expires_in !== undefined &&
        data.refresh_token !== undefined
      ) {
        return new TokenInfo(
          String(data.membership_id),
          String(data.refresh_expires_in),
          String(data.refresh_token)
        )
      } else {
        throw Error()
      }
    } catch (error) {
      console.log('Error occurred while making the refresh token call with an authorization code')
      console.log(authorizationCode)
      if (result != null) {
        result.sendFile(path.join(metaUrl, 'src/presentation/views/landing-page-error-auth-code.html'))
      }
    }
  }

  /**
     * Retrieves the merchandise sold by Ada
     */
  private getAdaMerchandiseHashes (
    vendorId: string,
    vendorMerchandise: Map<string, Map<string, Mod>>
  ): string[] {
    const adaMerchandise = vendorMerchandise.get(vendorId)

    if (adaMerchandise !== undefined) {
      return Object.values(adaMerchandise).map((item: Merchandise) => (item.itemHash))
    } else {
      throw new Error('Ada does not have any merchandise!')
    }
  }

  async doesDestinyPlayerExist (bungieUsername: string, bungieUsernameCode: string): Promise<boolean> {
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

    return data.Response.length !== 0
  }

  /**
     * Retrieve the user's access token by calling the Destiny API with their refresh token
     */
  private async getTokenInfo (refreshToken: string): Promise<TokenInfo> {
    const { data } = await this.httpClient.post(
      this.bungieDomainWithTokenDirectory, {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.config.oauthClientId,
        client_secret: this.config.oauthSecret
      }, {
        headers: this.urlEncodedHeaders
      })

    if (data.membership_id !== undefined &&
      data.refresh_expires_in !== undefined &&
      data.refresh_token !== undefined &&
      data.access_token !== undefined
    ) {
      return new TokenInfo(
        data.membership_id,
        data.refresh_expires_in,
        data.refresh_token,
        data.access_token
      )
    } else {
      throw new Error('Refresh token call failed!')
    }
  }

  /**
     * Retrieves the list of unowned mods for a user
     */
  private getUnownedMods (collectibles: Collectible[]): String[] {
    const unownedModStateId = 65
    const collectibleMods = collectibles.filter(mod => mod.state === unownedModStateId)

    return collectibleMods.map(collectible => collectible.id)
  }
}
