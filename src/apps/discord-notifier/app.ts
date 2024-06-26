import express from 'express'
import { MongoUserRepository } from '../../infrastructure/database/mongo-user-repository.js'
import { DestinyApiClient } from '../../infrastructure/destiny/destiny-api-client.js'
import { Vendor } from '../../infrastructure/destiny/vendor.js'
import { DiscordService } from '../../infrastructure/services/discord-service.js'
import { MongoDbService } from '../../infrastructure/database/mongo-db-service.js'
import { AxiosHttpClient } from '../../infrastructure/database/axios-http-client.js'
import { Notify } from './notify.js'
import { DestinyApiClientConfigClass } from '../../infrastructure/destiny/destiny-api-client-config-class.js'
import { DiscordConfigClass } from '../../presentation/discord/discord-config-class.js'
import { MongoDbServiceConfigClass } from '../../infrastructure/database/mongo-db-service-config-class.js'
import { notifierConfigSchema, validateSchema } from '../config-schema.js'

const config = validateSchema(notifierConfigSchema)
const MONGO_DB_SERVICE_CONFIG = MongoDbServiceConfigClass.fromConfig(config)
const DISCORD_CONFIG = DiscordConfigClass.fromConfig(config)
const DESTINY_API_CLIENT_CONFIG = DestinyApiClientConfigClass.fromConfig(config)
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
