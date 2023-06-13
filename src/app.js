// @ts-check

import { config } from './../config/config.js'
import express from 'express'
import path from 'path'
import * as databaseService from './database/database-service.js'
import { setupDiscordClient } from './discord/discord-client.js'
import { sendMessage } from './discord-service.js'
import axios from 'axios'
import mongoose from 'mongoose'
import { getRefreshToken } from './destiny-service.js'

const app = express()
const directoryName = path.dirname('app.js')

mongoose.set('strictQuery', false)
mongoose.connect(
  `mongodb+srv://${config.databaseUser}:${config.databasePassword}@${config.databaseCluster}.mongodb.net/${config.databaseName}`
)

setupDiscordClient()

app.listen(3001, () => {
  console.log('Server is running...')
})

app.get('/', async (request, result) => {
  if (request.query.code) {
    await handleAuthorizationCode(String(request.query.code))

    result.sendFile('src/views/landing-page.html', { root: directoryName })
  }
})

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
    console.log(`Wait time is: ${waitTime / 1000 / 60 / 60}`)

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
 * @param {string} authorizationCode Authorization code received by authenticated user
 */
async function handleAuthorizationCode(authorizationCode) {
  const tokenInfo = await getRefreshToken(authorizationCode)
  const destinyMemberships = await getDestinyMemberships(tokenInfo.membershipId)
  const destinyCharacters = await getDestinyCharacters(destinyMemberships, tokenInfo.membershipId)

  await databaseService.updateUser(
    tokenInfo.membershipId,
    tokenInfo.refreshTokenExpirationTime,
    tokenInfo.refreshToken,
    destinyMemberships.data.Response.bungieNetUser.uniqueName,
    destinyMemberships.data.Response.destinyMemberships[0].membershipId,
    destinyCharacters.data.Response.profile.data.characterIds[0]
  )
}

/**
 * Retrieves Destiny membership information for a user
 * @param {string} membershipId Destiny membership ID of user
 * @returns A JSON object containing the Destiny membership info for a user
 */
async function getDestinyMemberships(membershipId) {
  try {
    return await axios.get(
      `https://www.bungie.net/platform/User/GetMembershipsById/${membershipId}/3/`, {
      headers: {
        'X-API-Key': `${config.apiKey}`
      }
    })
  } catch (error) {
    console.log(`Retreiving Destiny Memberships failed for ${membershipId}!`)
    throw error
  }
}

/**
* Retrieves Destiny character information for a user
* @param {Object} destinyMemberships A JSON object containing the Destiny membership info for a user
* @param {string} membershipId Destiny membership ID of user
* @returns A JSON object containing the Destiny character info for a user
*/
async function getDestinyCharacters(destinyMemberships, membershipId) {
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
    console.log(`Retreving Destiny Characters Failed for ${membershipId}!`)
    throw error
  }
}
