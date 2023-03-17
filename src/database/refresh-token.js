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

    console.log(data)
    
    const daysTillTokenExpires = data.refresh_expires_in / 60 / 60 / 24
    const currentDate = new Date(new Date().toUTCString())
    const refreshTokenInfo = {
        refresh_expiration: currentDate,
        refresh_token: data.refresh_token
    }

    currentDate.setDate(currentDate.getDate() + daysTillTokenExpires)


    if (await database.doesUserExist(data.membership_id)) {
        await database.updateUser(data.membership_id, refreshTokenInfo)
    } else {
        await database.addUser(data.membership_id, refreshTokenInfo)
    }
}
