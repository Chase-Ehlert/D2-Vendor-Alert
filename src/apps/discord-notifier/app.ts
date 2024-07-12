import express from 'express'
import { MongoUserRepository } from '../../infrastructure/persistence/mongo-user-repository.js'
import { DestinyClient } from '../../infrastructure/destiny/destiny-client.js'
import { Vendor } from '../../domain/destiny/vendor.js'
import { DiscordService } from '../../infrastructure/services/discord-service.js'
import { MongoDbService } from '../../infrastructure/persistence/services/mongo-db-service.js'
import { AxiosHttpClient } from '../../infrastructure/persistence/axios-http-client.js'
import { Notify } from './notify.js'
import { DestinyClientConfigClass } from '../../infrastructure/destiny/config/destiny-client-config-class.js'
import { DiscordClientConfigClass } from '../../presentation/discord/configs/discord-client-config-class.js'
import { MongoDbServiceConfigClass } from '../../infrastructure/persistence/configs/mongo-db-service-config-class.js'
import { notifierConfigSchema, validateSchema } from '../config-schema.js'

const config = validateSchema(notifierConfigSchema)
const MONGO_DB_SERVICE_CONFIG = MongoDbServiceConfigClass.fromConfig(config)
const DISCORD_CONFIG = DiscordClientConfigClass.fromConfig(config)
const DESTINY_API_CLIENT_CONFIG = DestinyClientConfigClass.fromConfig(config)
const destinyClient = new DestinyClient(
  new AxiosHttpClient(),
  new MongoUserRepository(),
  DESTINY_API_CLIENT_CONFIG
)

const notify = new Notify(
  destinyClient,
  new DiscordService(
    new Vendor(destinyClient),
    new AxiosHttpClient(),
    DISCORD_CONFIG
  ),
  new MongoDbService(MONGO_DB_SERVICE_CONFIG)
)

await notify.notifyUsers(express())
// Need to figure out how to close the database connection
