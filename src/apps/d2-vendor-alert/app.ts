import express from 'express'
import { MongoUserRepository } from '../../infrastructure/persistence/mongo-user-repository.js'
import { DestinyClient } from '../../infrastructure/destiny/destiny-client.js'
import { MongoDbService } from '../../infrastructure/persistence/services/mongo-db-service.js'
import { NotifierService } from '../../infrastructure/services/notifier-service.js'
import { AlertManager } from '../../presentation/discord/alert-manager.js'
import { AlertCommand } from '../../presentation/discord/commands/alert-command.js'
import { DiscordClient } from '../../presentation/discord/discord-client.js'
import { OAuthWebController } from '../../presentation/web/o-auth-web-controller.js'
import { Alert } from './alert.js'
import { NotifierServiceConfigClass } from '../../infrastructure/services/configs/notifier-service-config-class.js'
import { DestinyClientConfigClass } from '../../infrastructure/destiny/config/destiny-client-config-class.js'
import { DiscordClientConfigClass } from '../../presentation/discord/configs/discord-client-config-class.js'
import { MongoDbServiceConfigClass } from '../../infrastructure/persistence/configs/mongo-db-service-config-class.js'
import { AlertCommandConfigClass } from '../../presentation/discord/commands/alert-command-config-class.js'
import { databaseConfigSchema } from '../../infrastructure/persistence/configs/database-config-schema.js'
import { discordConfigSchema } from '../../presentation/discord/configs/discord-config-schema.js'
import { destinyConfigSchema } from '../../infrastructure/destiny/config/destiny-config-schema.js'
import { validateSchema } from '../validate-config-schema.js'
import { AxiosHttpClient } from '../../adapter/axios-http-client.js'

const databaseConfig = validateSchema(databaseConfigSchema)
const discordConfig = validateSchema(discordConfigSchema)
const destinyConfig = validateSchema(destinyConfigSchema)
const alertCommandConfig = AlertCommandConfigClass.fromConfig(destinyConfig)
const mongoDbServiceConfig = MongoDbServiceConfigClass.fromConfig(databaseConfig)
const discordClientConfig = DiscordClientConfigClass.fromConfig(discordConfig)
const discordNotifierAddress = NotifierServiceConfigClass.fromConfig(discordConfig)
const destinyApiClientConfig = DestinyClientConfigClass.fromConfig(destinyConfig)
const mongoUserRepo = new MongoUserRepository()
const destinyClient = new DestinyClient(
  new AxiosHttpClient(),
  mongoUserRepo,
  destinyApiClientConfig
)

const alert = new Alert(
  new OAuthWebController(destinyClient, mongoUserRepo),
  new MongoDbService(mongoDbServiceConfig),
  new DiscordClient(
    mongoUserRepo,
    destinyClient,
    new AlertCommand(alertCommandConfig),
    discordClientConfig
  ),
  new AlertManager(
    new NotifierService(mongoUserRepo, discordNotifierAddress, new AxiosHttpClient())
  )
)

await alert.runApp(express())
