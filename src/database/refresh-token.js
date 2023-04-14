import axios from 'axios'
import * as database from './users-operations.js'

export async function handleRefreshToken(request) {
    const tokenInfo = await axios.post('https://www.bungie.net/platform/app/oauth/token/', {
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
    const daysTillTokenExpires = tokenInfo.data.refresh_expires_in / 60 / 60 / 24
    console.log('2. The token expires in')
    console.log(daysTillTokenExpires)
    const currentDate = new Date()
    console.log(currentDate)
    currentDate.setDate(currentDate.getDate() + daysTillTokenExpires)
    console.log(currentDate)
    
    const refreshTokenInfo = {
        refresh_expiration: currentDate.toISOString(),
        refresh_token: tokenInfo.data.refresh_token
    }
    let destinyMemberships, destinyCharacters

    try {
        destinyMemberships = await axios.get(
            `https://www.bungie.net/platform/User/GetMembershipsById/${tokenInfo.data.membership_id}/3/`, {
            headers: {
                'X-API-Key': `${process.env.VENDOR_ALERT_API_KEY}`
            }
        })
    } catch (error) {
        console.log(`Retreiving Destiny Memberships failed for ${tokenInfo.data.membership_id}!`)
        throw error
    }

    try {
        destinyCharacters = await axios.get(
            `https://bungie.net/Platform/Destiny2/3/Profile/${destinyMemberships.data.Response.destinyMemberships[0].membershipId}/`, {
            headers: {
                'X-API-Key': `${process.env.VENDOR_ALERT_API_KEY}`
            },
            params: {
                components: 100
            }
        })
    } catch (error) {
        console.log(`Retreving Destiny Characters Failed for ${tokenInfo.data.membership_id}!`)
        throw error
    }

    await database.updateUser(
        tokenInfo.data.membership_id,
        destinyMemberships.data.Response.bungieNetUser.uniqueName,
        destinyMemberships.data.Response.destinyMemberships[0].membershipId,
        destinyCharacters.data.Response.profile.data.characterIds[0],
        refreshTokenInfo
    )
}
