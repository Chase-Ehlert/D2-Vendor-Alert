import axios from 'axios'
import * as database from './users-operations.js'

export async function handleRefreshToken(request) {
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

    const daysTillTokenExpires = data.refresh_expires_in / 60 / 60 / 24
    const currentDate = new Date(new Date().toUTCString())
    const refreshTokenInfo = {
        refresh_expiration: currentDate,
        refresh_token: data.refresh_token
    }

    currentDate.setDate(currentDate.getDate() + daysTillTokenExpires)

    const destinyMemberships = await axios.get(
        `https://www.bungie.net/platform/User/GetMembershipsById/${data.membership_id}/3/`, {
        headers: {
            'X-API-Key': `${process.env.DESTINY_API_KEY}`
        }
    })

    const destinyCharacters = await axios.get(
        `https://bungie.net/Platform/Destiny2/3/Profile/${data.membership_id}/`, {
        headers: {
            'X-API-Key': `${process.env.DESTINY_API_KEY}`
        },
        params: {
            components: 200
        }
    })

    await database.updateUser(
        destinyMemberships.data.Response.bungieNetUser.uniqueName,
        destinyMemberships.data.Response.destinyMemberships[0].membershipId,
        destinyCharacters.data.Response.characters.data[0].characterId,
        refreshTokenInfo
    )
}
