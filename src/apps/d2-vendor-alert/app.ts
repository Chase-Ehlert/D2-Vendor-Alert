import express, { RequestHandler } from 'express'
import mustacheExpress from 'mustache-express'
import * as path from 'path'
import * as url from 'url'
import { DESTINY_API_CLIENT_CONFIG, MONGO_DB_SERVICE_CONFIG, ALERT_CONFIG, DISCORD_CONFIG, DISCORD_NOTIFIER_ADDRESS } from '../../configs/config.js'
import { TokenInfo } from '../../domain/token-info.js'
import { AxiosHttpClient } from '../../infrastructure/database/axios-http-client.js'
import { MongoUserRepository } from '../../infrastructure/database/mongo-user-repository.js'
import { AlertCommand } from '../../infrastructure/discord/commands/alert.js'
import { DiscordClient } from '../../infrastructure/discord/discord-client.js'
import { DestinyApiClient } from '../../presentation/destiny-api-client.js'
import { MongoDbService } from '../../presentation/mongo-db-service.js'
import { NotifierService } from '../../presentation/notifier-service.js'

const app = express()
const landingPagePath = path.join(url.fileURLToPath(new URL('./../../src/d2-vendor-alert', import.meta.url)), 'views')

app.engine('mustache', mustacheExpress())
app.set('view engine', 'mustache')
app.set('views', landingPagePath)

const mongoUserRepo = new MongoUserRepository()
const destinyApiClient = new DestinyApiClient(new AxiosHttpClient(), mongoUserRepo, DESTINY_API_CLIENT_CONFIG)
const mongoDbService = new MongoDbService(MONGO_DB_SERVICE_CONFIG)
const discordClient = new DiscordClient(
  mongoUserRepo,
  destinyApiClient,
  new AlertCommand(ALERT_CONFIG),
  DISCORD_CONFIG
)
const notifierService = new NotifierService(mongoUserRepo, DISCORD_NOTIFIER_ADDRESS)

await mongoDbService.connectToDatabase()

discordClient.setupDiscordClient()

app.listen(3001, () => {
  console.log('Server is running...')
})

app.get('/', (async (request, result) => {
  if (request.query.code !== undefined) {
    try {
      const guardian = await handleAuthorizationCode(String(request.query.code), result)
      if (typeof guardian === 'string') {
        result.render('landing-page.mustache', { guardian })
      }
    } catch (error) {
      console.log('Error with landing page')
      throw error
    }
  } else {
    console.log('Error with retreving code from authorization url on landing page')
    console.log(request)
    const errorLandingPagePath = String(app.get('views')) + '/landing-page-error.html'
    result.sendFile(errorLandingPagePath)
  }
}) as express.RequestHandler)

dailyReset()

/**
 * Calculates the time till the next Destiny daily reset and waits till then to alert users of vendor inventory
 */
function dailyReset (): void {
  const resetTime = new Date()

  if (
    resetTime.getUTCHours() >= 17 &&
    resetTime.getUTCMinutes() >= 1 &&
    resetTime.getUTCSeconds() >= 0 &&
    resetTime.getUTCMilliseconds() > 0
  ) {
    resetTime.setDate(resetTime.getDate() + 1)
  }
  resetTime.setUTCHours(17)
  resetTime.setUTCMinutes(1)
  resetTime.setUTCSeconds(0)
  resetTime.setUTCMilliseconds(0)

  const waitTime = resetTime.getTime() - Date.now()
  setTimeout((async () => {
    await beginAlerting()
  }) as RequestHandler, 5000)
}

/**
 * Begin the alert workflow for users and then set the time till the next daily reset
 */
async function beginAlerting (): Promise<void> {
  await notifierService.alertUsersOfUnownedModsForSale()
  dailyReset()
}

/**
 * Uses the authorization code to retreive the user's token information and then save it to the database
 */
async function handleAuthorizationCode (authorizationCode: string, result: any): Promise<void | string> {
  try {
    const tokenInfo = await destinyApiClient.getRefreshTokenInfo(authorizationCode, result)

    if (tokenInfo instanceof TokenInfo) {
      const destinyMembershipInfo = await destinyApiClient.getDestinyMembershipInfo(tokenInfo.bungieMembershipId)
      const destinyCharacterId = await destinyApiClient.getDestinyCharacterIds(destinyMembershipInfo[0])

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
    console.log('Error occurred while handling authorization code')
    throw error
  }
}
