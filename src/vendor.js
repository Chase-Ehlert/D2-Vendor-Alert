// @ts-check

import axios from 'axios'
import * as destinyService from './destiny-service.js'
import { config } from './../config/config.js'
import { getCollectibleFromManifest, getItemFromManifest } from './manifest.js'
import { updateRefreshToken } from './token.js'

/**
 * Collect mods for a specific vendor
 * @param {Object} user User profile information
 * @param {string} vendorId Id of vendor
 * @returns {Promise<Array<string>>} List of mods for sale
 */
export async function getVendorModInventory(user, vendorId) {
  const accessToken = await updateRefreshToken(user.refresh_token)
  const vendorInfo = await destinyService.getDestinyVendorInfo(user, accessToken)
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
  const getCollectibles = 800
  const profileResponse = await axios.get(`https://www.bungie.net/Platform/Destiny2/3/Profile/${user.destiny_id}/`, {
    params: {
      'components': getCollectibles
    },
    headers: {
      'x-api-key': `${config.apiKey}`
    }
  })

  const adaMods = await getVendorModInventory(user, '350061650')
  console.log(`Ada has these mods for sale: ${adaMods}`)

  const collectibleList = []

  adaMods.forEach(key => {
    if (profileResponse.data.Response.profileCollectibles.data.collectibles[key].state === 65) {
      collectibleList.push(key)
    }
  })

  return await getCollectibleFromManifest(19, collectibleList)
}
