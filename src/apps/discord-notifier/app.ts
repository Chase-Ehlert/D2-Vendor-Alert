import express from 'express'
import { MongoUserRepository } from '../../infrastructure/database/mongo-user-repository.js'
import { DestinyApiClient } from '../../infrastructure/destiny/destiny-api-client.js'
import { Vendor } from '../../infrastructure/destiny/vendor.js'
import { DiscordService } from '../../infrastructure/services/discord-service.js'
import { MongoDbService } from '../../infrastructure/services/mongo-db-service.js'
import { AxiosHttpClient } from '../../infrastructure/database/axios-http-client.js'
import value, { DISCORD_CONFIG, MONGO_DB_SERVICE_CONFIG } from '../config.js'
import { Notify } from './notify.js'
import { DestinyApiClientConfigClass } from '../../infrastructure/destiny/destiny-api-client-config-class.js'

const DESTINY_API_CLIENT_CONFIG = DestinyApiClientConfigClass.fromConfig(value)
const destinyApiClient = new DestinyApiClient(
  new AxiosHttpClient(),
  new MongoUserRepository(),
  DESTINY_API_CLIENT_CONFIG
)

const notify = new Notify(
  destinyApiClient,
  new DiscordService(
    new Vendor(destinyApiClient),
    new AxiosHttpClient(),
    DISCORD_CONFIG
  ),
  new MongoDbService(MONGO_DB_SERVICE_CONFIG)
)

await notify.notifyUsers(express())
// Need to figure out how to close the database connection
