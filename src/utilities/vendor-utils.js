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
  const vendorUrl =
    new URL(`https://www.bungie.net/Platform/Destiny2/3/Profile/${user.destiny_id}/Character/${user.character_id}/Vendors/`)
  const searchParams = {
    components: 402
  }
  vendorUrl.search = new URLSearchParams(searchParams).toString()
  const response = await axios.get(vendorUrl, {
    headers: {
      Authorization: `Bearer ${oauthToken}`,
      'x-api-key': `${process.env.VENDOR_ALERT_API_KEY}`
    }
  })
  const destinyVendorInventories = await response.json()
  let vendorInventory

  for (let key in destinyVendorInventories.Response.sales.data) {
    if (key === vendorId) {
      vendorInventory = destinyVendorInventories.Response.sales.data[key].saleItems
    }
  }

  return await getItemFromManifest(19, vendorInventory)
}

async function refreshOauthToken(refreshToken, bungieUsername) {
      const oauthJson = await getOauthJson(refreshToken)

      try {
        await User.findOneAndUpdate(
            { bungie_username: bungieUsername },
            {
                $set: {
                    refresh_token: oauthJson['refresh_token']
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
        )
    } catch (error) {
        return error
    }

  return oauthJson['access_token']
}

async function getOauthJson(refreshToken) {
  const getOauthCredentials = await axios.post(new URL('https://www.bungie.net/platform/app/oauth/token/'), {
    headers: {
      'x-api-key': `${process.env.VENDOR_ALERT_API_KEY}`
    },
    body: new URLSearchParams({
      'grant_type': 'refresh_token',
      'refresh_token': refreshToken,
      'client_id': `${process.env.VENDOR_ALERT_OAUTH_CLIENT_ID}`,
      'client_secret': `${process.env.VENDOR_ALERT_OAUTH_SECRET}`
    })
  })
  const oauthJson = await getOauthCredentials.json()
  return oauthJson
}

export async function getProfileCollectibles(user) {
  const oauthToken = await refreshOauthToken(user.refresh_token, user.bungie_username)
  const profileUrl = new URL(`https://www.bungie.net/Platform/Destiny2/3/Profile/${user.destiny_id}/`)
  profileUrl.search = new URLSearchParams({
    components: 800
  })
  console.log('oauthToken is ' + oauthToken)
  const profileResponse = await axios.get(profileUrl, {
    headers: {
      'x-api-key': `${process.env.VENDOR_ALERT_API_KEY}`,
      Authorization: `Bearer ${oauthToken}`
    }
  })
  const profileJson = await profileResponse.json()
  const bansheeMods = await getVendorModInventory('672118013', user)
  const adaMods = await getVendorModInventory('350061650', user)
  const modsForSale = bansheeMods.concat(adaMods)
  const list1 = []
  modsForSale.forEach(key => {
    if (profileJson.Response.profileCollectibles.data.collectibles[key].state == 65) {
      list1.push(key)
    }
  })

  return await getCollectibleFromManifest(19, list1)
}
