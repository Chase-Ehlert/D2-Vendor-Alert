import express, { RequestHandler } from 'express'
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

const directoryName = path.dirname('app')
const destinyService = new DestinyService()
const databaseRepo = new DatabaseRepository()
const discordClient = new DiscordClient()
const discordService = new DiscordService()

await discordClient.setupDiscordClient()

app.listen(3001, () => {
  console.log('Server is running...')
})

app.get('/error/authCode', ((request, result) => {
  result.sendFile('src/views/landing-page-error-auth-code.html', { root: directoryName })
}) as RequestHandler)

app.get('/', (async (request, result) => {
  if (request.query.code !== undefined) {
    const guardian = await handleAuthorizationCode(String(request.query.code), result)

    result.render('landing-page.mustache', { guardian })
  } else {
    result.sendFile('src/views/landing-page-error.html', { root: directoryName })
  }
}) as express.RequestHandler)

await dailyReset()

/**
 * Calculates the time till the next Destiny daily reset and waits till then to alert users of vendor inventory
 */
async function dailyReset (): Promise<void> {
  const today = new Date()

  if (today.getMinutes() > 1 && today.getHours() >= 17) {
    today.setDate(today.getDate() + 1)
    today.setHours(17)
    today.setMinutes(1)
    today.setSeconds(1)
  } else {
    today.setHours(17)
    today.setMinutes(1)
    today.setSeconds(1)
  }

  const waitTime = Number(today) - Date.now()
  console.log(`Wait time on ${today.getDate()} is ${waitTime / 1000 / 60 / 60}`)
  setTimeout((async () => {
    await startServer()
  }) as RequestHandler, waitTime)
}

/**
 * Begin the alert workflow for users and then set the time till the next daily reset
 */
async function startServer (): Promise<void> {
  await discordService.getUserInfo()
  await dailyReset()
}

/**
 * Uses the authorization code to retreive the user's token information and then save it to the database
 */
async function handleAuthorizationCode (authorizationCode: string, result: any): Promise<void | string> {
  await destinyService.getRefreshToken(authorizationCode, result)
    .then(async (tokenInfo) => {
      if (tokenInfo !== undefined) {
        await destinyService.getDestinyMembershipInfo(tokenInfo.bungieMembershipId)
          .then(async (destinyMembershipInfo) => {
            const destinyCharacterId = await destinyService.getDestinyCharacterId(destinyMembershipInfo[0])
            await databaseRepo.updateUserByUsername(
              destinyMembershipInfo[1],
              tokenInfo.refreshTokenExpirationTime,
              tokenInfo.refreshToken,
              destinyMembershipInfo[0],
              destinyCharacterId
            )

            return destinyMembershipInfo[1]
          })
      }
    })
}
