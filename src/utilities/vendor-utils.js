import 'dotenv/config'
import axios from 'axios'
import { URLSearchParams } from 'url'
import { getCollectibleFromManifest, getItemFromManifest } from './manifest-utils.js'
import { User } from '../database/models/users.js'

export async function getXurInventory() {
  const search = {
    method: 'GET',
    components: '402'
  }
  const url = new URL('https://www.bungie.net/Platform/Destiny2/Vendors/')
  url.search = new URLSearchParams(search).toString()
  const response = await axios.get(url, {
    headers: {
      'X-API-Key': `${process.env.DESTINY_API_KEY}`
    }
  })
  const xurManifest = await response.json()
  const inventoryNameList = await getItemFromManifest(
    3,
    Object.values(Object.values(xurManifest.Response.sales.data)[0].saleItems)
  )
  return inventoryNameList
}

export async function getVendorModInventory(vendorId, user) {
  const oauthToken = await refreshOauthToken(user.refresh_token, user.bungie_username)

  console.log('HERE WE GO')
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
  console.log('WOOHOO')
  let vendorInventory

  for (let key in response.data.Response.sales.data) {
    if (key === vendorId) {
      vendorInventory = response.data.Response.sales.data[key].saleItems
    }
  }

  return await getItemFromManifest(19, vendorInventory)
}

async function refreshOauthToken(refreshToken, bungieUsername) {
  const oauthJson = await getOauthJson(refreshToken)
  console.log('5')

  const daysTillTokenExpires = oauthJson.refresh_expires_in / 60 / 60 / 24
  const currentDate = new Date(new Date().toUTCString())
  currentDate.setDate(currentDate.getDate() + daysTillTokenExpires)

  try {
    await User.findOneAndUpdate(
      { bungie_username: bungieUsername },
      {
        $set: {
          refresh_token: oauthJson['refresh_token'],
          refresh_expiration: currentDate
        }
      },
      (error) => {
        if (error) {
          console.log('Updating user refresh token failed')
          console.log(error)
        } else {
          console.log('Updated user refresh token')
        }
      }
    ).clone()
  } catch (error) {
    return error
  }

  return oauthJson['access_token']
}

async function getOauthJson(refreshToken) {
  const oauthCredentials = await axios.post('https://www.bungie.net/platform/app/oauth/token/', new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: process.env.VENDOR_ALERT_OAUTH_CLIENT_ID,
    client_secret: process.env.VENDOR_ALERT_OAUTH_SECRET
  }), {
    headers: {
      'x-api-key': `${process.env.VENDOR_ALERT_API_KEY}`
    }
  })

  const daysTillTokenExpires = oauthCredentials.data.refresh_expires_in / 60 / 60 / 24
  const currentDate = new Date(new Date().toUTCString())
  currentDate.setDate(currentDate.getDate() + daysTillTokenExpires)

  await User.findOneAndUpdate(
    { bungie_membership_id: oauthCredentials.data.membership_id },
    {
      $set: {
        refresh_token: oauthCredentials.data.refresh_token,
        refresh_expiration: currentDate
      }
    },
    (error, document) => {
      if (error) {
        console.log('Updating user record failed')
        console.log(error)
      } else {
        console.log('Updated user record')
        // console.log(document)
      }
    }
  ).clone()

  return oauthCredentials.data
}

export async function getProfileCollectibles(user) {
  // const oauthToken = await refreshOauthToken(user.refresh_token, user.bungie_username)
  // const profileUrl = new URL(`https://www.bungie.net/Platform/Destiny2/3/Profile/${user.destiny_id}/`)
  // profileUrl.search = new URLSearchParams({
  // })

  const profileResponse = await axios.get(`https://www.bungie.net/Platform/Destiny2/3/Profile/${user.destiny_id}/`, {
    params: {
      'components': 800
    },
    headers: {
      'x-api-key': `${process.env.VENDOR_ALERT_API_KEY}`
    }
  })

  // const profileJson = await profileResponse.json()
  const bansheeMods = await getVendorModInventory('672118013', user)
  const adaMods = await getVendorModInventory('350061650', user)
  const modsForSale = bansheeMods.concat(adaMods)
  const list1 = []
  modsForSale.forEach(key => {
    if (profileResponse.data.Response.profileCollectibles.data.collectibles[key].state == 65) {
      list1.push(key)
    }
  })

  return await getCollectibleFromManifest(19, list1)
}
