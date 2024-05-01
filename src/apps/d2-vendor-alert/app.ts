import express from 'express'
import value, { ALERT_COMMAND_CONFIG } from '../config.js'
import { AxiosHttpClient } from '../../infrastructure/database/axios-http-client.js'
import { MongoUserRepository } from '../../infrastructure/database/mongo-user-repository.js'
import { DestinyApiClient } from '../../infrastructure/destiny/destiny-api-client.js'
import { MongoDbService } from '../../infrastructure/services/mongo-db-service.js'
import { NotifierService } from '../../infrastructure/services/notifier-service.js'
import { AlertManager } from '../../presentation/discord/alert-manager.js'
import { AlertCommand } from '../../presentation/discord/commands/alert-command.js'
import { DiscordClient } from '../../presentation/discord/discord-client.js'
import { OAuthWebController } from '../../presentation/web/o-auth-web-controller.js'
import { Alert } from './alert.js'
import { NotifierServiceConfigClass } from '../../infrastructure/services/notifier-service-config-class.js'
import { DestinyApiClientConfigClass } from '../../infrastructure/destiny/destiny-api-client-config-class.js'
import { DiscordConfigClass } from '../../presentation/discord/discord-config-class.js'
import { MongoDbServiceConfigClass } from '../../infrastructure/services/mongo-db-service-config-class.js'

const MONGO_DB_SERVICE_CONFIG = MongoDbServiceConfigClass.fromConfig(value)
const DISCORD_CONFIG = DiscordConfigClass.fromConfig(value)
const DISCORD_NOTIFIER_ADDRESS = NotifierServiceConfigClass.fromConfig(value)
const DESTINY_API_CLIENT_CONFIG = DestinyApiClientConfigClass.fromConfig(value)
const mongoUserRepo = new MongoUserRepository()
const destinyApiClient = new DestinyApiClient(
  new AxiosHttpClient(),
  mongoUserRepo,
  DESTINY_API_CLIENT_CONFIG
)

const alert = new Alert(
  new OAuthWebController(destinyApiClient, mongoUserRepo),
  new MongoDbService(MONGO_DB_SERVICE_CONFIG),
  new DiscordClient(
    mongoUserRepo,
    destinyApiClient,
    new AlertCommand(ALERT_COMMAND_CONFIG),
    DISCORD_CONFIG
  ),
  new AlertManager(new NotifierService(mongoUserRepo, DISCORD_NOTIFIER_ADDRESS))
)

await alert.runApp(express())
