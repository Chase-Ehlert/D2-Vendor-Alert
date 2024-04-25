import express from 'express'
import { MongoUserRepository } from '../../infrastructure/database/mongo-user-repository'
import { DestinyApiClient } from '../../infrastructure/destiny/destiny-api-client'
import { Vendor } from '../../infrastructure/destiny/vendor'
import { DiscordService } from '../../infrastructure/services/discord-service'
import { ManifestService } from '../../infrastructure/services/manifest-service'
import { MongoDbService } from '../../infrastructure/services/mongo-db-service'
import { AxiosHttpClient } from '../../infrastructure/database/axios-http-client'
import { DESTINY_API_CLIENT_CONFIG, DISCORD_CONFIG, MONGO_DB_SERVICE_CONFIG } from '../../configs/config'
import { Notify } from './notify'

const destinyApiClient = new DestinyApiClient(
  new AxiosHttpClient(),
  new MongoUserRepository(),
  DESTINY_API_CLIENT_CONFIG
)

const notify = new Notify(
  destinyApiClient,
  new DiscordService(
    new Vendor(destinyApiClient, new ManifestService(destinyApiClient)),
    new AxiosHttpClient(),
    DISCORD_CONFIG
  ),
  new MongoDbService(MONGO_DB_SERVICE_CONFIG)
)

await notify.notifyUsers(express())
// Need to figure out how to close the database connection
