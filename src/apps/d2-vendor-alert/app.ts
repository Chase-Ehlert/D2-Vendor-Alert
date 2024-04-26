import express from 'express'
import { ALERT_CONFIG, DESTINY_API_CLIENT_CONFIG, MONGO_DB_SERVICE_CONFIG, NOTIFIER_SERVICE_CONFIG } from '../../configs/config.js'
import { DiscordConfig } from '../../configs/discord-config.js'
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
    new AlertCommand(ALERT_CONFIG),
  {} satisfies DiscordConfig
  ),
  new AlertManager(new NotifierService(mongoUserRepo, NOTIFIER_SERVICE_CONFIG))
)

await alert.runApp(express())
