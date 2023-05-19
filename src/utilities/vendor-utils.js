import 'dotenv/config'
import axios from 'axios'
import { getCollectibleFromManifest, getItemFromManifest, getAggregatedManifestFile } from './manifest-utils.js'
import { updateRefreshToken } from './token-utils.js'

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

export async function getXurInventory() {
  const response = await axios.get('https://www.bungie.net/Platform/Destiny2/Vendors/', {
    params: {
      components: 402
    },
    headers: {
      'X-API-Key': `${process.env.DESTINY_API_KEY}`
    }
  })
  const inventoryNameList = await getItemFromManifest(
    3,
    Object.values(Object.values(response.Response.sales.data)[0].saleItems)
  )
  return inventoryNameList
}

async function xur() {
  let xurInventoryMessage = "Xur is selling:\r\n"
  const xurItems = await getXurInventory()
  xurItems.forEach(item => {
    xurInventoryMessage = xurInventoryMessage + item + "\r\n"
  })
  return xurInventoryMessage
}

async function aggregateFile() {
  return await getAggregatedManifestFile()
}
