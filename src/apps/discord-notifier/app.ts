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
import { databaseConfigSchema } from '../../infrastructure/persistence/configs/database-config-schema.js'
import { discordConfigSchema } from '../../presentation/discord/configs/discord-config-schema.js'
import { destinyConfigSchema } from '../../infrastructure/destiny/config/destiny-config-schema.js'
import { validateSchema } from '../validate-config-schema.js'

const databaseConfig = validateSchema(databaseConfigSchema)
const discordConfig = validateSchema(discordConfigSchema)
const destinyConfig = validateSchema(destinyConfigSchema)
const mongoDbServiceConfig = MongoDbServiceConfigClass.fromConfig(databaseConfig)
const discordClientConfig = DiscordClientConfigClass.fromConfig(discordConfig)
const destinyApiClientConfig = DestinyClientConfigClass.fromConfig(destinyConfig)
const destinyClient = new DestinyClient(
  new AxiosHttpClient(),
  new MongoUserRepository(),
  destinyApiClientConfig
)

const notify = new Notify(
  destinyClient,
  new DiscordService(
    new Vendor(destinyClient),
    new AxiosHttpClient(),
    discordClientConfig
  ),
  new MongoDbService(mongoDbServiceConfig)
)

await notify.notifyUsers(express())
// Need to figure out how to close the database connection
