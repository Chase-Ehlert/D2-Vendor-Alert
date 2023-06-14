// @ts-check

import * as destinyService from './services/destiny-service.js'
import * as databaseService from './services/database-service.js'
import { getCollectibleFromManifest, getItemFromManifest } from './services/manifest-service.js'

/**
 * Collect mods for a specific vendor
 * @param {Object} user User profile information
 * @param {string} vendorId Id of vendor
 * @returns {Promise<Array<string>>} List of mods for sale
 */
export async function getVendorModInventory(user, vendorId) {
  const tokenInfo = await destinyService.getAccessToken(Object(user).refresh_token)
  await databaseService.updateUser(
    tokenInfo.bungieMembershipId,
    tokenInfo.refreshTokenExpirationTime,
    tokenInfo.refreshToken
  )

  const vendorInfo = await destinyService.getDestinyVendorInfo(user, tokenInfo.accessToken)
  let vendorInventory

  for (let key in vendorInfo) {
    if (key === vendorId) {
      vendorInventory = vendorInfo[key].saleItems
    }
  }

  return await getItemFromManifest(19, vendorInventory)
}

/**
 * Collect mods for sale by Banshee-44 and Ada-1
 * @param {Object} user User information
 * @returns {Promise<Array>} List of mods
 */
export async function getProfileCollectibles(user) {
  const adaVendorId = '350061650'
  const collectibleId = 65
  const collectibleList = []

  await Promise.all([
    destinyService.getDestinyCollectibleInfo(user.destiny_id),
    getVendorModInventory(user, adaVendorId)
  ]).then((values) => {
    console.log(`Ada has these mods for sale: ${values[1]}`)
    values[1].forEach(key => {
      if (values[0][key].state === collectibleId) {
        collectibleList.push(key)
      }
    })
  })

  return await getCollectibleFromManifest(19, collectibleList)
}