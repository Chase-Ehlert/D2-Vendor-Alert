import 'dotenv/config'
import axios from 'axios'
import { User } from '../database/models/users.js'
import { getCollectibleFromManifest, getItemFromManifest, getAggregatedManifestFile } from './manifest-utils.js'

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

export async function getVendorModInventory(vendorId, user) {
  const oauthToken = await getAccessToken(user.refresh_token)
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

export async function getAccessToken(refreshToken) {
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

  const daysTillTokenExpires = data.refresh_expires_in / 60 / 60 / 24
  const currentDate = new Date()
  currentDate.setDate(currentDate.getDate() + daysTillTokenExpires)

  await User.findOneAndUpdate(
    { bungie_membership_id: data.membership_id },
    {
      $set: {
        refresh_token: data.refresh_token,
        refresh_expiration: currentDate.toISOString()
      }
    },
    (error) => {
      if (error) {
        console.log('Updating user record failed')
        console.log(error)
      } else {
        console.log('Updated user record after reset')
      }
    }
  ).clone()

  return data.access_token
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
