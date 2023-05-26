import 'dotenv/config'
import axios from 'axios'
import { getCollectibleFromManifest, getItemFromManifest } from './manifest-utils.js'
import { updateRefreshToken } from './token-utils.js'

/**
 * Collect mods for a specific vendor
 * @param {string} vendorId id of vendor
 * @param {string} user user profile information
 * @returns {Promise<Array<string>>} list of mods for sale
 */
export async function getVendorModInventory(vendorId, user) {
  const oauthToken = await updateRefreshToken(user.refresh_token)
  const response = await axios.get(
    `https://www.bungie.net/Platform/Destiny2/3/Profile/${user.destiny_id}/Character/${user.destiny_character_id}/Vendors/`, {
    params: {
      components: 402
    },
    headers: {
      Authorization: `Bearer ${oauthToken}`,
      'x-api-key': `${process.env.VENDOR_ALERT_API_KEY}`
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
 * User profile information
 * @typedef {Object} User user profile information
 * @property {string} bungie_username user's Bungie username
 * @property {string} discord_id user's id on Discord
 * @property {string} discord_channel_id Discord channel id from user's slash command execution
 * @property {string} bungie_membership_id user's membership id on Bungie
 * @property {string} destiny_id user's id in Destiny 2
 * @property {string} destiny_character_id user's character (Hunter, Titan, Warlock) id
 * @property {string} refresh_expiration date of expiration for user's refresh token
 * @property {string} refresh_token user's refresh token
*/

/**
 * Collect mods for sale by Banshee-44 and Ada-1
 * @param {User} user user information
 * @returns {Promise<Array>} list of mods
 */
export async function getProfileCollectibles(user) {
  const profileResponse = await axios.get(`https://www.bungie.net/Platform/Destiny2/3/Profile/${user.destiny_id}/`, {
    params: {
      'components': 800
    },
    headers: {
      'x-api-key': `${process.env.VENDOR_ALERT_API_KEY}`
    }
  })

  const bansheeMods = await getVendorModInventory('672118013', user)
  console.log(`Banshee has these mods for sale: ${bansheeMods}`)

  const adaMods = await getVendorModInventory('350061650', user)
  console.log(`Ada has these mods for sale: ${adaMods}`)

  const collectibleList = []

  bansheeMods.concat(adaMods).forEach(key => {
    if (profileResponse.data.Response.profileCollectibles.data.collectibles[key].state === 65) {
      collectibleList.push(key)
    }
  })

  return await getCollectibleFromManifest(19, collectibleList)
}
