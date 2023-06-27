// @ts-check

import express from 'express'
import path from 'path'
import DestinyService from './services/destiny-service.js'
import * as databaseRepo from './database/database-repository.js'
import DiscordClient from './discord/discord-client.js'
import DiscordService from './services/discord-service.js'

const app = express()
const directoryName = path.dirname('app.js')
const destinyService = new DestinyService()
const discordClient = new DiscordClient()
const discordService = new DiscordService()

discordClient.setupDiscordClient()

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
  const tomorrowResetTime = new Date()
  tomorrowResetTime.setDate(today.getDate() + 1)
  tomorrowResetTime.setUTCHours(17, 2, 0, 0)

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
  await discordService.sendMessage()
  dailyReset()
}

/**
 * Uses the authorization code to retreive the user's token information and then save it to the database
 * @param {string} authorizationCode Authorization code received by authenticated user
 */
async function handleAuthorizationCode(authorizationCode) {
  const tokenInfo = await destinyService.getRefreshToken(authorizationCode)
  const destinyMembershipId = await destinyService.getDestinyMembershipInfo(tokenInfo.bungieMembershipId)
  const destinyCharacterId = await destinyService.getDestinyCharacterId(destinyMembershipId)

  await databaseRepo.updateUser(
    tokenInfo.bungieMembershipId,
    tokenInfo.refreshTokenExpirationTime,
    tokenInfo.refreshToken,
    destinyMembershipId,
    destinyCharacterId
  )
}
