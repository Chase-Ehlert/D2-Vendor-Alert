import express, { Application } from 'express'
import mustacheExpress from 'mustache-express'
import * as path from 'path'
import * as url from 'url'
import { DiscordClient } from '../../presentation/discord/discord-client.js'
import { MongoDbService } from '../../infrastructure/services/mongo-db-service.js'
import { OAuthWebController } from '../../presentation/web/o-auth-web-controller.js'
import { AlertManager } from '../../presentation/discord/alert-manager.js'
import metaUrl from '../../tests/helpers/url.js'

export class Alert {
  constructor (
    private readonly oAuthWebController: OAuthWebController,
    private readonly mongoDbService: MongoDbService,
    private readonly discordClient: DiscordClient,
    private readonly alertManager: AlertManager
  ) {}

  async runApp (): Promise<void> {
    const app = this.createServer()

    await this.startServer(app)
  }

  private createServer (): Application {
    const app = express()
    app.engine('mustache', mustacheExpress())
    app.set('view engine', 'mustache')
    app.set(
      'views',
      path.join(url.fileURLToPath(new URL('../src/presentation', url.pathToFileURL(metaUrl).href)), 'views')
    )

    app.get('/', (async (
      request: any,
      result: {
        render: (arg0: string, arg1: { guardian: string }) => void
        sendFile: (arg0: string) => void
      }
    ) => {
      await this.oAuthWebController.handleOAuth(app, request, result)
    }) as express.RequestHandler)

    return app
  }

  private async startServer (
    app: { listen: (arg0: number, arg1: () => void) => void }
  ): Promise<void> {
    app.listen(3001, () => {
      console.log('Server is running...')
    })

    await this.mongoDbService.connectToDatabase()
    this.discordClient.setupDiscordClient()
    this.alertManager.dailyReset()
  }
}
