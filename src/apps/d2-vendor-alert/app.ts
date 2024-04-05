import express from 'express'
import mustacheExpress from 'mustache-express'
import * as path from 'path'
import * as url from 'url'
import {
  DESTINY_API_CLIENT_CONFIG,
  MONGO_DB_SERVICE_CONFIG,
  ALERT_CONFIG,
  DISCORD_CONFIG,
  DISCORD_NOTIFIER_ADDRESS
} from '../../configs/config.js'
import { AxiosHttpClient } from '../../infrastructure/database/axios-http-client.js'
import { MongoUserRepository } from '../../infrastructure/database/mongo-user-repository.js'
import { AlertCommand } from '../../presentation/discord/commands/alert.js'
import { DiscordClient } from '../../presentation/discord/discord-client.js'
import { DestinyApiClient } from '../../infrastructure/destiny/destiny-api-client.js'
import { MongoDbService } from '../../infrastructure/services/mongo-db-service.js'
import { OAuthWebController } from '../../presentation/o-auth-web-controller.js'
import { AlertManager } from '../../presentation/discord/alert-manager.js'
import { NotifierService } from '../../infrastructure/services/notifier-service.js'

const app = express()
const mongoUserRepo = new MongoUserRepository()
const destinyApiClient = new DestinyApiClient(new AxiosHttpClient(), mongoUserRepo, DESTINY_API_CLIENT_CONFIG)
const mongoDbService = new MongoDbService(MONGO_DB_SERVICE_CONFIG)
const oAuthWebController = new OAuthWebController(destinyApiClient, mongoUserRepo)
const alertManager = new AlertManager(new NotifierService(mongoUserRepo, DISCORD_NOTIFIER_ADDRESS))
const discordClient = new DiscordClient(
  mongoUserRepo,
  destinyApiClient,
  new AlertCommand(ALERT_CONFIG),
  DISCORD_CONFIG
)

app.engine('mustache', mustacheExpress())
app.set('view engine', 'mustache')
app.set('views', path.join(url.fileURLToPath(new URL('./../../src/d2-vendor-alert', import.meta.url)), 'views'))

app.listen(3001, () => {
  console.log('Server is running...')
})

app.get('/', (async (request, result) => {
  await oAuthWebController.handleOAuth(app, request, result)
}) as express.RequestHandler)

await mongoDbService.connectToDatabase()
discordClient.setupDiscordClient()
alertManager.dailyReset()
