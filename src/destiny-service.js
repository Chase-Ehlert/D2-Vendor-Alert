// @ts-check

// eslint-disable-next-line no-unused-vars
import * as types from './../typedefs.js'
import axios from 'axios'
import { config } from './../config/config.js'

/**
 * Retrieves refresh token for a user
 * @param {string} authorizationCode Temporary code given by Destiny after user authorizes bot
 * @returns A TokenInfo object with the membership ID and important refresh token information
 */
export async function getRefreshToken(authorizationCode) {
    const { data } = await axios.post('https://www.bungie.net/platform/app/oauth/token/', {
        grant_type: 'authorization_code',
        code: authorizationCode,
        client_secret: config.oauthSecret,
        client_id: config.oauthClientId
    }, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'x-api-key': config.apiKey
        }
    })

    /**
     * @type {types.TokenInfo}
     */
    return {
        bungieMembershipId: data.membership_id,
        refreshTokenExpirationTime: data.refresh_expires_in,
        refreshToken: data.refresh_token
    }
}

/**
 * Retrieves Destiny membership information for a user
 * @param {string} membershipId Destiny membership ID of user
 * @returns A MembershipInfo object containing the Destiny membership info for a user
 */
export async function getDestinyMembershipInfo(membershipId) {
    const { data } = await axios.get(
        `https://www.bungie.net/platform/User/GetMembershipsById/${membershipId}/3/`, {
        headers: {
          'X-API-Key': `${config.apiKey}`
        }
      })

      /**
       * @type {types.MembershipInfo}
       */
      return {
        destinyMembershipId: data.Response.destinyMemberships[0].membershipId,
        uniqueName: data.Response.bungieNetUser.uniqueName,
        characterId: data.Response.profile.data.characterIds[0]
      }
  }
