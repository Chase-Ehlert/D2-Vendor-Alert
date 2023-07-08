import axios from 'axios'
import { User } from '../database/models/user.js'
import { RefreshTokenInfo } from './models/refresh-token-info.js'
import { config } from '../../config/config.js'

export class DestinyService {
  /**
     * Retrieves refresh token for a user
     */
  async getRefreshToken (authorizationCode: string, result: any): Promise<void | RefreshTokenInfo> {
    await axios.post('https://www.bungie.net/platform/app/oauth/token/', {
      grant_type: 'authorization_code',
      code: authorizationCode,
      client_secret: config.configModel.oauthSecret,
      client_id: config.configModel.oauthClientId
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-api-key': config.configModel.apiKey
      }
    }).then((data: any) => {
      return new RefreshTokenInfo(data.membership_id, data.refresh_expires_in, data.refresh_token)
    }).catch(async (error) => {
      console.log('Retreiving refresh token with authorization code failed')
      result.redirect('/error/authCode')
      console.error(error)
    })
  }

  /**
     * Retrieves Destiny membership information for a user
     */
  async getDestinyMembershipInfo (membershipId: string): Promise<string[]> {
    const { data } = await axios.get(
      `https://www.bungie.net/platform/User/GetMembershipsById/${membershipId}/3/`, {
        headers: {
          'x-api-key': config.configModel.apiKey
        }
      }).catch((error) => {
      console.log('Retreiving Destiny membership info with membership id failed')
      throw error
    })

    return [data.Response.destinyMemberships[0].membershipId, data.Response.destinyMemberships[0].displayName]
  }

  /**
    * Retrieves Destiny character information for a user
    */
  async getDestinyCharacterId (destinyMembershipId: string): Promise<string> {
    const getProfiles = 100
    const { data } = await axios.get(
      `https://bungie.net/Platform/Destiny2/3/Profile/${destinyMembershipId}/`, {
        headers: {
          'x-api-key': config.configModel.apiKey
        },
        params: {
          components: getProfiles
        }
      }).catch((error) => {
      console.log('Retreiving Destiny character info failed')
      throw error
    })

    return data.Response.profile.data.characterIds[0]
  }

  /**
     * Retrieves the list of definitions of Destiny items for a specified manifest file
     */
  async getDestinyInventoryItemDefinition (manifestFileName: string): Promise<any> {
    const { data } = await axios.get(
      'https://www.bungie.net' + manifestFileName
    ).catch((error) => {
      console.log('Retreiving Destiny inventory item definition failed')
      throw error
    })

    return data.DestinyInventoryItemDefinition
  }

  /**
     * Call the Destiny API to retreive the manifest
     */
  async getManifestFile (): Promise<string> {
    const { data } = await axios.get('https://www.bungie.net/Platform/Destiny2/Manifest/', {
      headers: {
        'x-api-key': config.configModel.apiKey
      }
    }).catch((error) => {
      console.log('Retreiving the Destiny manifest failed')
      throw error
    })

    return data.Response.jsonWorldContentPaths.en
  }

  /**
     * Retrieve the user's access token by calling the Destiny API with their refresh token
     */
  async getAccessToken (refreshToken: string): Promise<RefreshTokenInfo> {
    const { data } = await axios.post('https://www.bungie.net/platform/app/oauth/token/', {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: config.configModel.oauthClientId,
      client_secret: config.configModel.oauthSecret
    }, {
      headers: {
        'x-api-key': config.configModel.apiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).catch((error) => {
      console.log('Retreiving a Destiny access token failed')
      throw error
    })

    return new RefreshTokenInfo(data.membership_id, data.refresh_expires_in, data.refresh_token, data.access_token)
  }

  /**
     * Looks for a Destiny username that belongs to a user's Bungie username
     */
  async getDestinyUsername (bungieUsername: string, bungieUsernameCode: string): Promise<any> {
    const { data } = await axios.post('https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayerByBungieName/3/', {
      displayName: bungieUsername,
      displayNameCode: bungieUsernameCode
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.configModel.apiKey
      }
    }).catch((error) => {
      console.log('Checking for a Destiny username failed')
      throw error
    })

    return data.Response
  }

  /**
     * Retrieves the list of vendors and their inventory
     */
  async getDestinyVendorInfo (user: User, accessToken: string): Promise<any> {
    const getVendorSales = 402
    const { data } = await axios.get(
      `https://www.bungie.net/Platform/Destiny2/3/Profile/${user.destinyId}/Character/${user.destinyCharacterId}/Vendors/`, {
        params: {
          components: getVendorSales
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'x-api-key': config.configModel.apiKey
        }
      }).catch((error) => {
      console.log('Retreiving list of vendors from Destiny failed')
      throw error
    })

    return data.Response.sales.data
  }

  /**
     * Retrieves the list of collectibles that exist in Destiny
     */
  async getDestinyCollectibleInfo (destinyId: string): Promise<any> {
    const getCollectibles = 800
    const { data } = await axios.get(`https://www.bungie.net/Platform/Destiny2/3/Profile/${destinyId}/`, {
      params: {
        components: getCollectibles
      },
      headers: {
        'x-api-key': config.configModel.apiKey
      }
    }).catch((error) => {
      console.log('Retreiving the list of collectibles in Destiny failed')
      throw error
    })

    return data.Response.profileCollectibles.data.collectibles
  }
}
