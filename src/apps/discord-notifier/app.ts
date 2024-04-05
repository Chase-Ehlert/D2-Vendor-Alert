import express from 'express'
import { MongoUserRepository } from '../../infrastructure/database/mongo-user-repository.js'
import { DestinyApiClient } from '../../presentation/destiny-api-client.js'
import { Vendor } from '../../presentation/vendor.js'
import { DiscordService } from '../../presentation/discord-service.js'
import { ManifestService } from '../../presentation/manifest-service.js'
import { MongoDbService } from '../../presentation/mongo-db-service.js'
import { AxiosHttpClient } from '../../infrastructure/database/axios-http-client.js'
import { DESTINY_API_CLIENT_CONFIG, DISCORD_CONFIG, MONGO_DB_SERVICE_CONFIG } from '../../configs/config.js'

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
  console.log('Discord-Notifier is running...')
})

app.post('/notify', (async (request, result) => {
  await destinyApiClient.checkRefreshTokenExpiration(request.body.user)
  await discordService.compareModsForSaleWithUserInventory(request.body.user)
  // result.status(200).send(String(request.body.user.bungieUsername) + ' notified')
  // throw Error()
}) as express.RequestHandler)

await mongoDbService.connectToDatabase()

// Need to figure out how to close the database connection
