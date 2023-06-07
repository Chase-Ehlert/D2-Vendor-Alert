// @ts-check

import axios from 'axios'
import * as database from '../database/users-operations.js'

/**
 * Updates the refresh token for a user
 * @param {string} refreshToken Previous saved refresh token for user
 * @returns Access token used for making protected Destiny API calls for a user
 */
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
