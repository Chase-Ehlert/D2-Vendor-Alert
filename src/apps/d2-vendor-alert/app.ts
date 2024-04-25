import express from 'express'
import { ALERT_CONFIG, DESTINY_API_CLIENT_CONFIG, MONGO_DB_SERVICE_CONFIG, NOTIFIER_SERVICE_CONFIG } from '../../configs/config'
import { DiscordConfig } from '../../configs/discord-config'
import { AxiosHttpClient } from '../../infrastructure/database/axios-http-client'
import { MongoUserRepository } from '../../infrastructure/database/mongo-user-repository'
import { DestinyApiClient } from '../../infrastructure/destiny/destiny-api-client'
import { MongoDbService } from '../../infrastructure/services/mongo-db-service'
import { NotifierService } from '../../infrastructure/services/notifier-service'
import { AlertManager } from '../../presentation/discord/alert-manager'
import { AlertCommand } from '../../presentation/discord/commands/alert-command'
import { DiscordClient } from '../../presentation/discord/discord-client'
import { OAuthWebController } from '../../presentation/web/o-auth-web-controller'
import { Alert } from './alert'

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
