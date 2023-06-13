// @ts-check

import * as databaseService from './database/database-service.js'
import * as destinyService from './destiny-service.js'

/**
 * Updates the refresh token for a user
 * @param {string} refreshToken Previous saved refresh token for user
 * @returns Access token used for making protected Destiny API calls for a user
 */
export async function updateRefreshToken(refreshToken) {
  const tokenInfo = await destinyService.getAccessToken(refreshToken)

  await databaseService.updateUser(
    tokenInfo.bungieMembershipId,
    tokenInfo.refreshTokenExpirationTime,
    tokenInfo.refreshToken
  )

  return tokenInfo.accessToken
}
