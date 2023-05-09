import axios from 'axios'
import * as database from '../database/users-operations.js'

export async function handleAuthorizationCode(request) {
    const { data } = await axios.post('https://www.bungie.net/platform/app/oauth/token/', {
        grant_type: 'authorization_code',
        code: request.query.code,
        client_secret: process.env.VENDOR_ALERT_OAUTH_SECRET,
        client_id: process.env.VENDOR_ALERT_OAUTH_CLIENT_ID
    }, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'x-api-key': process.env.VENDOR_ALERT_API_KEY
        }
    })
    
    const destinyMemberships = await getDestinyMemberships(data)
    const destinyCharacters = await getDestinyCharacters(destinyMemberships, data)

    await database.updateUser(
        data.membership_id,
        data.refresh_expires_in,
        data.refresh_token,
        destinyMemberships.data.Response.bungieNetUser.uniqueName,
        destinyMemberships.data.Response.destinyMemberships[0].membershipId,
        destinyCharacters.data.Response.profile.data.characterIds[0]
    )
}

export async function updateRefreshToken(refreshToken) {
  const { data } = await axios.post('https://www.bungie.net/platform/app/oauth/token/', {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: process.env.VENDOR_ALERT_OAUTH_CLIENT_ID,
    client_secret: process.env.VENDOR_ALERT_OAUTH_SECRET
  }, {
    headers: {
      'x-api-key': `${process.env.VENDOR_ALERT_API_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })

  await database.updateUser(
    data.membership_id,
    data.refresh_expires_in,
    data.refresh_token
  )

  return data.access_token
}

async function getDestinyMemberships(tokenInfo) {
    try {
        return await axios.get(
            `https://www.bungie.net/platform/User/GetMembershipsById/${tokenInfo.membership_id}/3/`, {
            headers: {
                'X-API-Key': `${process.env.VENDOR_ALERT_API_KEY}`
            }
        })
    } catch (error) {
        console.log(`Retreiving Destiny Memberships failed for ${tokenInfo.membership_id}!`)
        throw error
    }
}

async function getDestinyCharacters(destinyMemberships, tokenInfo) {
    try {
        return await axios.get(
            `https://bungie.net/Platform/Destiny2/3/Profile/${destinyMemberships.data.Response.destinyMemberships[0].membershipId}/`, {
            headers: {
                'X-API-Key': `${process.env.VENDOR_ALERT_API_KEY}`
            },
            params: {
                components: 100
            }
        })
    } catch (error) {
        console.log(`Retreving Destiny Characters Failed for ${tokenInfo.membership_id}!`)
        throw error
    }
}
