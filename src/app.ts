import express, { RequestHandler } from 'express'
import mustacheExpress from 'mustache-express'
import * as path from 'path'
import * as url from 'url'
import { DestinyService } from './services/destiny-service.js'
import { MongoUserRepository } from './database/mongo-user-repository.js'
import { DiscordClient } from './discord/discord-client.js'
import { DiscordService } from './services/discord-service.js'
import { Vendor } from './destiny/vendor.js'
import { UserService } from './services/user-service.js'
import { ManifestService } from './services/manifest-service.js'
import { DestinyApiClient } from './destiny/destiny-api-client.js'

const app = express()
const landingPagePath = path.join(url.fileURLToPath(new URL('./../dist/src', import.meta.url)), 'views')

app.engine('mustache', mustacheExpress())
app.set('view engine', 'mustache')
app.set('views', landingPagePath)

const directoryName = path.dirname('app')
const destinyService = new DestinyService(new DestinyApiClient())
const userService = new UserService()
const mongoUserRepo = new MongoUserRepository(userService)
const discordClient = new DiscordClient()
const discordService = new DiscordService(
  new Vendor(
    new DestinyService(new DestinyApiClient()),
    new MongoUserRepository(userService),
    new ManifestService(new DestinyService(new DestinyApiClient()))
  ),
  destinyService,
  mongoUserRepo
)

await userService.connectToDatabase()

await discordClient.setupDiscordClient()

app.listen(3001, () => {
  console.log('Server is running...')
})

app.get('/error/authCode', ((request, result) => {
  result.sendFile('./../dist/src/views/landing-page-error-auth-code.html', { root: directoryName })
}) as RequestHandler)

app.get('/', (async (request, result) => {
  if (request.query.code !== undefined) {
    const guardian = await handleAuthorizationCode(String(request.query.code), result)
    console.log('HEEEEEEEEY')
    console.log(guardian)

    result.render('landing-page.mustache', { guardian })
  } else {
    result.sendFile('./../dist/src/views/landing-page-error.html', { root: directoryName })
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
  return await destinyService.getRefreshTokenInfo(authorizationCode, result)
    .then(async (tokenInfo) => {
      if (tokenInfo !== undefined) {
        return await destinyService.getDestinyMembershipInfo(tokenInfo.bungieMembershipId)
          .then(async (destinyMembershipInfo) => {
            const destinyCharacterId = await destinyService.getDestinyCharacterId(destinyMembershipInfo[0])
            await mongoUserRepo.updateUserByUsername(
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
