import express, { Application } from 'express'
import { MongoUserRepository } from '../../infrastructure/database/mongo-user-repository.js'
import mustacheExpress from 'mustache-express'
import * as path from 'path'
import * as url from 'url'
import {
  DESTINY_API_CLIENT_CONFIG,
  MONGO_DB_SERVICE_CONFIG,
  ALERT_CONFIG,
  DISCORD_CONFIG,
  DISCORD_NOTIFIER_ADDRESS
} from '../../configs/config.js'
import { AxiosHttpClient } from '../../infrastructure/database/axios-http-client.js'
import { AlertCommand } from '../../presentation/discord/commands/alert.js'
import { DiscordClient } from '../../presentation/discord/discord-client.js'
import { DestinyApiClient } from '../../infrastructure/destiny/destiny-api-client.js'
import { MongoDbService } from '../../infrastructure/services/mongo-db-service.js'
import { OAuthWebController } from '../../presentation/web/o-auth-web-controller.js'
import { AlertManager } from '../../presentation/discord/alert-manager.js'
import { NotifierService } from '../../infrastructure/services/notifier-service.js'
import metaUrl from '../../tests/helpers/url.js'

export function createServer (oAuthWebController: OAuthWebController): Application {
  const app = express()
  app.engine('mustache', mustacheExpress())
  app.set('view engine', 'mustache')
  app.set('views', path.join(url.fileURLToPath(new URL('./../../src/d2-vendor-alert', metaUrl)), 'views'))

  app.get('/', (async (
    request: any,
    result: { render: (arg0: string, arg1: { guardian: string }) => void, sendFile: (arg0: string) => void }
  ) => {
    await oAuthWebController.handleOAuth(app, request, result)
  }) as express.RequestHandler)

  return app
}

export async function startServer (
  app: { listen: (arg0: number, arg1: () => void) => void },
  mongoDbService: MongoDbService,
  discordClient: DiscordClient,
  alertManager: AlertManager
): Promise<void> {
  app.listen(3001, () => {
    console.log('Server is running...')
  })

  await mongoDbService.connectToDatabase()
  discordClient.setupDiscordClient()
  alertManager.dailyReset()
}

if (require.main === module) {
  const mongoUserRepo = new MongoUserRepository()
  const destinyApiClient = new DestinyApiClient(new AxiosHttpClient(), mongoUserRepo, DESTINY_API_CLIENT_CONFIG)
  const app = createServer(new OAuthWebController(destinyApiClient, mongoUserRepo))

  await startServer(
    app,
    new MongoDbService(MONGO_DB_SERVICE_CONFIG),
    new DiscordClient(
      mongoUserRepo,
      destinyApiClient,
      new AlertCommand(ALERT_CONFIG),
      DISCORD_CONFIG
    ),
    new AlertManager(new NotifierService(mongoUserRepo, DISCORD_NOTIFIER_ADDRESS))
  )
}
