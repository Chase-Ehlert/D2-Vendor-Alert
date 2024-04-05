import express, { RequestHandler } from 'express'
import mustacheExpress from 'mustache-express'
import * as path from 'path'
import * as url from 'url'
import { DESTINY_API_CLIENT_CONFIG, MONGO_DB_SERVICE_CONFIG, ALERT_CONFIG, DISCORD_CONFIG, DISCORD_NOTIFIER_ADDRESS } from '../../configs/config.js'
import { AxiosHttpClient } from '../../infrastructure/database/axios-http-client.js'
import { MongoUserRepository } from '../../infrastructure/database/mongo-user-repository.js'
import { AlertCommand } from '../../presentation/discord/commands/alert.js'
import { DiscordClient } from '../../presentation/discord/discord-client.js'
import { DestinyApiClient } from '../../infrastructure/destiny/destiny-api-client.js'
import { MongoDbService } from '../../infrastructure/services/mongo-db-service.js'
import { NotifierService } from '../../infrastructure/services/notifier-service.js'
import { OAuthWebController } from '../../presentation/OAuthWebController.js'

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
const oAuthWebController = new OAuthWebController(destinyApiClient, mongoUserRepo)

await mongoDbService.connectToDatabase()

discordClient.setupDiscordClient()

app.listen(3001, () => {
  console.log('Server is running...')
})

app.get('/', (async (request, result) => {
  await oAuthWebController.handleOAuth(app, request, result)
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
  }) as RequestHandler, waitTime)
}

/**
 * Begin the alert workflow for users and then set the time till the next daily reset
 */
async function beginAlerting (): Promise<void> {
  await notifierService.alertUsersOfUnownedModsForSale()
  dailyReset()
}
