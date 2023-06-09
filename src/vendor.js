// @ts-check

import { config } from './../config/config.js'
import axios from 'axios'
import { getCollectibleFromManifest, getItemFromManifest } from './manifest.js'
import { updateRefreshToken } from './token.js'

/**
 * Collect mods for a specific vendor
 * @param {string} vendorId Id of vendor
 * @param {Object} user User profile information
 * @returns {Promise<Array<string>>} List of mods for sale
 */
export async function getVendorModInventory(vendorId, user) {
  const getVendorSales = 402
  const oauthToken = await updateRefreshToken(user.refresh_token)
  const response = await axios.get(
    `https://www.bungie.net/Platform/Destiny2/3/Profile/${user.destiny_id}/Character/${user.destiny_character_id}/Vendors/`, {
    params: {
      components: getVendorSales
    },
    headers: {
      Authorization: `Bearer ${oauthToken}`,
      'x-api-key': `${config.apiKey}`
    }
  })

  let vendorInventory

  for (let key in response.data.Response.sales.data) {
    if (key === vendorId) {
      vendorInventory = response.data.Response.sales.data[key].saleItems
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

  const adaMods = await getVendorModInventory('350061650', user)
  console.log(`Ada has these mods for sale: ${adaMods}`)

  const collectibleList = []

  adaMods.forEach(key => {
    if (profileResponse.data.Response.profileCollectibles.data.collectibles[key].state === 65) {
      collectibleList.push(key)
    }
  })

  return await getCollectibleFromManifest(19, collectibleList)
}
