// @ts-check

import express from 'express'
import path from 'path'
import * as databaseService from './database/database-service.js'
import mongoose from 'mongoose'
import { config } from './../config/config.js'
import { setupDiscordClient } from './discord/discord-client.js'
import { sendMessage } from './discord-service.js'
import { getRefreshToken, getDestinyMembershipInfo, getDestinyCharacterId } from './destiny-service.js'

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
 * Uses the authorization code to retreive the user's token information and then save it to the database
 * @param {string} authorizationCode Authorization code received by authenticated user
 */
async function handleAuthorizationCode(authorizationCode) {
  const tokenInfo = await getRefreshToken(authorizationCode)
  const membershipInfo = await getDestinyMembershipInfo(tokenInfo.bungieMembershipId)
  const destinyCharacterId = await getDestinyCharacterId(membershipInfo.destinyMembershipId)

  await databaseService.updateUser(
    tokenInfo.bungieMembershipId,
    tokenInfo.refreshTokenExpirationTime,
    tokenInfo.refreshToken,
    membershipInfo.uniqueName,
    membershipInfo.destinyMembershipId,
    destinyCharacterId
  )
}
