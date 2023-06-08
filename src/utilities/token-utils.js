// @ts-check

import { config } from './../../config/config.js'
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
    client_id: config.oauthClientId,
    client_secret: config.oauthSecret
  }, {
    headers: {
      'x-api-key': `${config.apiKey}`,
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
