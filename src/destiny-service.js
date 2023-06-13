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
        membershipId: data.membership_id,
        refreshTokenExpirationTime: data.refresh_expires_in,
        refreshToken: data.refresh_token
    }
}
