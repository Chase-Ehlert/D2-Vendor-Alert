// @ts-check

import { config } from './../config/config.js'
import express from 'express'
import path from 'path'
import * as database from './database/users-operations.js'
import { setupDiscordClient } from './discord/discord-client.js'
import { sendMessage } from './discord-client.js'
import axios from 'axios'

const app = express()
const directoryName = path.dirname('app.js')

database.setupDatabaseConnection()
setupDiscordClient()

app.listen(3001, () => {
  console.log('Server is running...')
})

app.get('/', async (request, result) => {
  if (request.query.code) {
    await handleAuthorizationCode(request)

    result.sendFile('src/views/landing-page.html', { root: directoryName })
  }
})

await startServer()
dailyReset()

/**
 * Calculates the time till the next Destiny daily reset and waits till then to alert users of vendor inventory
 */
function dailyReset() {
  let today = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()))
  console.log(`Today is ${today}`)

  const tomorrowResetTime = new Date()
  tomorrowResetTime.setDate(today.getDate() + 1)
  tomorrowResetTime.setUTCHours(17, 2, 0, 0)
  console.log(`Tomorrows reset time is: ${tomorrowResetTime}`)

  const waitTime = Number(tomorrowResetTime) - Date.now()

  if (waitTime > 0) {
    console.log(`Wait time is: ${waitTime/1000/60/60}`)

    setTimeout(startServer, waitTime)
  } else {
    console.log('Timeout not required')
    today = new Date()
    startServer()
  }
}

/**
 * Begin the alert workflow for users and then set the time till the next daily reset
 */
async function startServer() {
  await sendMessage()
  dailyReset()
}

/**
 * Takes the authorization code and saves token information to database
 * @param {Object} request Authorization code received by authenticated user
 */
async function handleAuthorizationCode(request) {
  const { data } = await axios.post('https://www.bungie.net/platform/app/oauth/token/', {
      grant_type: 'authorization_code',
      code: request.query.code,
      client_secret: config.oauthSecret,
      client_id: config.oauthClientId
  }, {
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-api-key': config.apiKey
      }
  })
  
  const destinyMemberships = await getDestinyMemberships(data)
  const destinyCharacters = await getDestinyCharacters(destinyMemberships, data)

  await database.updateUser(
      data.membership_id,
      data.refresh_expires_in,
      data.refresh_token,
      destinyMemberships.data.Response.bungieNetUser.uniqueName,
      destinyMemberships.data.Response.destinyMemberships[0].membershipId,
      destinyCharacters.data.Response.profile.data.characterIds[0]
  )
}

/**
 * Retrieves Destiny membership information for a user
 * @param {Object} tokenInfo Destiny API token information for a user
 * @returns A JSON object containing the Destiny membership info for a user
 */
async function getDestinyMemberships(tokenInfo) {
  try {
      return await axios.get(
          `https://www.bungie.net/platform/User/GetMembershipsById/${tokenInfo.membership_id}/3/`, {
          headers: {
              'X-API-Key': `${config.apiKey}`
          }
      })
  } catch (error) {
      console.log(`Retreiving Destiny Memberships failed for ${tokenInfo.membership_id}!`)
      throw error
  }
}

/**
* Retrieves Destiny character information for a user
* @param {Object} destinyMemberships A JSON object containing the Destiny membership info for a user
* @param {Object} tokenInfo Destiny API token information for a user
* @returns A JSON object containing the Destiny character info for a user
*/
async function getDestinyCharacters(destinyMemberships, tokenInfo) {
  const getProfiles = 100
  try {
      return await axios.get(
          `https://bungie.net/Platform/Destiny2/3/Profile/${destinyMemberships.data.Response.destinyMemberships[0].membershipId}/`, {
          headers: {
              'X-API-Key': `${config.apiKey}`
          },
          params: {
              components: getProfiles
          }
      })
  } catch (error) {
      console.log(`Retreving Destiny Characters Failed for ${tokenInfo.membership_id}!`)
      throw error
  }
}
