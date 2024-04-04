import express from 'express'
import logger from '../common/utility/logger.js'
import { DiscordService } from '../common/services/discord-service.js'
import { Vendor } from '../common/destiny/vendor.js'
import { AxiosHttpClient } from '../common/utility/axios-http-client.js'
import { MongoUserRepository } from '../common/database/mongo-user-repository.js'
import { DESTINY_API_CLIENT_CONFIG, DISCORD_CONFIG, MONGO_DB_SERVICE_CONFIG } from '../common/config/config.js'
import { ManifestService } from '../common/services/manifest-service.js'
import { DestinyApiClient } from '../common/destiny/destiny-api-client.js'
import { MongoDbService } from '../common/services/mongo-db-service.js'

const destinyApiClient = new DestinyApiClient(
  new AxiosHttpClient(),
  new MongoUserRepository(),
  DESTINY_API_CLIENT_CONFIG
)
const mongoDbService = new MongoDbService(MONGO_DB_SERVICE_CONFIG)
const discordService = new DiscordService(
  new Vendor(destinyApiClient, new ManifestService(destinyApiClient)),
  new AxiosHttpClient(),
  DISCORD_CONFIG
)

const app = express()
app.use(express.json())

app.listen(3002, () => {
  logger.info('Discord-Notifier is running...')
})

app.post('/notify', (async (request, result) => {
  await destinyApiClient.checkRefreshTokenExpiration(request.body.user)
  await discordService.compareModsForSaleWithUserInventory(request.body.user)
  // result.status(200).send(String(request.body.user.bungieUsername) + ' notified')
  throw Error()
}) as express.RequestHandler)

await mongoDbService.connectToDatabase()

// Need to figure out how to close the database connection
