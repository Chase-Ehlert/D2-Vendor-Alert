// @ts-check

// eslint-disable-next-line no-unused-vars
import * as types from '../../typedefs.js'
import axios from 'axios'
import { config } from '../../config/config.js'

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

/**
* Retrieves Destiny character information for a user
* @param {string} destinyMembershipId Membership ID of a Destiny character belonging to the user
* @returns One of the Destiny character ID's for a user 
*/
export async function getDestinyCharacterId(destinyMembershipId) {
    const getProfiles = 100
    const { data } = await axios.get(
        `https://bungie.net/Platform/Destiny2/3/Profile/${destinyMembershipId}/`, {
        headers: {
            'X-API-Key': `${config.apiKey}`
        },
        params: {
            components: getProfiles
        }
    })

    return data.Response.profile.data.characterIds[0]
}


/**
 * Retrieves the list of definitions of Destiny items for a specified manifest file
 * @param {string} manifestFileName Name of the manifest file to retrieve
 * @returns A JSON object of the list of definitions for Destiny items
 */
export async function getDestinyInventoryItemDefinition(manifestFileName) {
    const { data } = await axios.get('https://www.bungie.net' + manifestFileName)

    return data.DestinyInventoryItemDefinition
}

/**
 * Call the Destiny API to retreive the manifest
 * @returns Manifest file from Destiny
 */
export async function getManifestFile() {
    const { data } = await axios.get('https://www.bungie.net/Platform/Destiny2/Manifest/', {
        headers: {
            'X-API-Key': `${config.apiKey}`
        }
    })

    return data.Response.jsonWorldContentPaths.en
}

/**
 * Retrieve the user's access token by calling the Destiny API with their refresh token
 * @param {string} refreshToken User's refresh token
 * @returns A TokenInfo object with the user's access token and new refresh token
 */
export async function getAccessToken(refreshToken) {
    const { data } = await axios.post('https://www.bungie.net/platform/app/oauth/token/', {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: config.oauthClientId,
        client_secret: config.oauthSecret
    }, {
        headers: {
            'x-api-key': `${config.apiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })

    /**
     * @type {types.TokenInfo}
     */
    return {
        bungieMembershipId: data.membership_id,
        refreshTokenExpirationTime: data.refresh_expires_in,
        refreshToken: data.refresh_token,
        accessToken: data.access_token
    }
}

/**
 * Looks for a Destiny username that belongs to a user's Bungie username
 * @param {string} bungieUsername
 * @param {string} bungieUsernameCode
 * @returns A JSON object returned from Bungie's directory containing the record (if it exists) for a Destiny username
 */
export async function getDestinyUsername(bungieUsername, bungieUsernameCode) {
    const { data } = await axios.post('https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayerByBungieName/3/', {
        displayName: bungieUsername,
        displayNameCode: bungieUsernameCode
    }, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': config.apiKey
        }
    })

    return data.Response
}

/**
 * Retrieves the list of vendors and their inventory
 * @param {Object} user User's profile information
 * @param {string} accessToken User's oauth access token
 * @returns A JSON object containing the list of vendors and their inventory
 */
export async function getDestinyVendorInfo(user, accessToken) {
    const getVendorSales = 402
    const { data } = await axios.get(
        `https://www.bungie.net/Platform/Destiny2/3/Profile/${user.destiny_id}/Character/${user.destiny_character_id}/Vendors/`, {
        params: {
            components: getVendorSales
        },
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'x-api-key': `${config.apiKey}`
        }
    })

    return data.Response.sales.data
}

/**
 * Retrieves the list of collectibles that exist in Destiny
 * @param {string} destinyId User's Destiny ID
 * @returns A JSON object containing the list of collectibles across all of Destiny
 */
export async function getDestinyCollectibleInfo(destinyId) {
    const getCollectibles = 800
    const { data } = await axios.get(`https://www.bungie.net/Platform/Destiny2/3/Profile/${destinyId}/`, {
        params: {
            'components': getCollectibles
        },
        headers: {
            'x-api-key': `${config.apiKey}`
        }
    })

    return data.Response.profileCollectibles.data.collectibles
}
