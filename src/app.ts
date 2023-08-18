import express, { RequestHandler } from 'express'
import mustacheExpress from 'mustache-express'
import * as path from 'path'
import * as url from 'url'
import logger from './utility/logger.js'
import { DestinyService } from './services/destiny-service.js'
import { MongoUserRepository } from './database/mongo-user-repository.js'
import { DiscordClient } from './discord/discord-client.js'
import { DiscordService } from './services/discord-service.js'
import { Vendor } from './destiny/vendor.js'
import { MongoDbService } from './services/mongo-db-service.js'
import { ManifestService } from './services/manifest-service.js'
import { DestinyApiClient } from './destiny/destiny-api-client.js'
import { RefreshTokenInfo } from './services/models/refresh-token-info.js'
import { AxiosHttpClient } from './utility/axios-http-client.js'
import { DestinyApiClientConfig, DiscordConfig, UserServiceConfig } from './config/config.js'

const app = express()
const landingPagePath = path.join(url.fileURLToPath(new URL('./../src/', import.meta.url)), 'views')

app.engine('mustache', mustacheExpress())
app.set('view engine', 'mustache')
app.set('views', landingPagePath)

const destinyService = new DestinyService(new DestinyApiClient(new AxiosHttpClient(), new DestinyApiClientConfig()))
const userService = new MongoDbService(new UserServiceConfig())
const mongoUserRepo = new MongoUserRepository()
const discordClient = new DiscordClient(mongoUserRepo, destinyService, new DiscordConfig())
const discordService = new DiscordService(
  new Vendor(destinyService, mongoUserRepo, new ManifestService(destinyService)),
  destinyService,
  mongoUserRepo,
  new AxiosHttpClient(),
  new DiscordConfig()
)

await userService.connectToDatabase()

await discordClient.setupDiscordClient()

app.listen(3001, () => {
  logger.info('Server is running...')
})

app.get('/', (async (request, result) => {
  if (request.query.code !== undefined) {
    try {
      const guardian = await handleAuthorizationCode(String(request.query.code), result)
      if (typeof guardian === 'string') {
        result.render('landing-page.mustache', { guardian })
      }
    } catch (error) {
      logger.error('Error with landing page')
      logger.error(error)
    }
  } else {
    logger.error('Error with retreving code from authorization url on landing page')
    logger.error(request)
    const errorLandingPagePath = String(app.get('views')) + '/landing-page-error.html'
    result.sendFile(errorLandingPagePath)
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
  logger.info(`The wait time is ${waitTime}`)
  setTimeout((async () => {
    await startServer()
  }) as RequestHandler, waitTime)
}

/**
 * Begin the alert workflow for users and then set the time till the next daily reset
 */
async function startServer (): Promise<void> {
  await discordService.alertUsersOfUnownedModsForSale()
  setTimeout((async () => {
    await dailyReset()
  }) as RequestHandler, 1000)
}

/**
 * Uses the authorization code to retreive the user's token information and then save it to the database
 */
async function handleAuthorizationCode (authorizationCode: string, result: any): Promise<void | string> {
  try {
    const tokenInfo = await destinyService.getRefreshTokenInfo(authorizationCode, result)

    if (tokenInfo instanceof RefreshTokenInfo) {
      const destinyMembershipInfo = await destinyService.getDestinyMembershipInfo(tokenInfo.bungieMembershipId)
      const destinyCharacterId = await destinyService.getDestinyCharacterId(destinyMembershipInfo[0])

      await mongoUserRepo.updateUserByUsername(
        destinyMembershipInfo[1],
        tokenInfo.refreshTokenExpirationTime,
        tokenInfo.refreshToken,
        destinyMembershipInfo[0],
        destinyCharacterId
      )

      return destinyMembershipInfo[1]
    }
  } catch (error) {
    logger.error('Error occurred while handling authorization code')
    logger.error(error)
  }
}
