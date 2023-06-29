import express from 'express'
import mustacheExpress from 'mustache-express'
import * as path from 'path'
import * as url from 'url'
import { DestinyService } from './services/destiny-service.js'
import { DatabaseRepository } from './database/database-repository.js'
import { DiscordClient } from './discord/discord-client.js'
import { DiscordService } from './services/discord-service.js'

const app = express()
app.engine('mustache', mustacheExpress())
app.set('view engine', 'mustache')

const landingPagePath = path.join(url.fileURLToPath(new URL('./', import.meta.url)), 'views')
app.set('views', landingPagePath)

const directoryName = path.dirname('app.js')
const destinyService = new DestinyService()
const databaseRepo = new DatabaseRepository()
const discordClient = new DiscordClient()
const discordService = new DiscordService()

await discordClient.setupDiscordClient()

app.listen(3001, () => {
  console.log('Server is running...')
})

app.get('/', (async (request, result) => {
  if (request.query.code !== undefined) {
    const guardian = await handleAuthorizationCode(String(request.query.code))

    result.render('landing-page.mustache', { guardian })
  } else {
    result.sendFile('src/views/landing-page-error.html', { root: directoryName })
  }
}) as express.RequestHandler)

await dailyReset()

/**
 * Calculates the time till the next Destiny daily reset and waits till then to alert users of vendor inventory
 */
async function dailyReset(): Promise<void> {
  let today = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()))
  const tomorrowResetTime = new Date()
  tomorrowResetTime.setDate(today.getDate() + 1)
  tomorrowResetTime.setUTCHours(17, 2, 0, 0)

  const waitTime = Number(tomorrowResetTime) - Date.now()

  if (waitTime > 0) {
    console.log(`Wait time is: ${waitTime / 1000 / 60 / 60}`)

    setTimeout(() => startServer, waitTime)
  } else {
    console.log('Timeout not required')
    today = new Date()
    await startServer()
  }
}

/**
 * Begin the alert workflow for users and then set the time till the next daily reset
 */
async function startServer(): Promise<void> {
  await discordService.sendMessage()
  await dailyReset()
}

/**
 * Uses the authorization code to retreive the user's token information and then save it to the database
 */
async function handleAuthorizationCode(authorizationCode: string): Promise<string> {
  const tokenInfo = await destinyService.getRefreshToken(authorizationCode)
  const destinyMembershipInfo = await destinyService.getDestinyMembershipInfo(tokenInfo.bungieMembershipId)
  const destinyCharacterId = await destinyService.getDestinyCharacterId(destinyMembershipInfo[0])

  await databaseRepo.updateUserByUsername(
    destinyMembershipInfo[1],
    tokenInfo.refreshTokenExpirationTime,
    tokenInfo.refreshToken,
    destinyMembershipInfo[0],
    destinyCharacterId
  )

  return destinyMembershipInfo[1]
}
