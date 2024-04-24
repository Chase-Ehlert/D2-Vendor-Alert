import express from 'express'
import mustacheExpress from 'mustache-express'
import * as path from 'path'
import * as url from 'url'
import { DiscordClient } from '../../presentation/discord/discord-client'
import { MongoDbService } from '../../infrastructure/services/mongo-db-service'
import { OAuthWebController } from '../../presentation/web/o-auth-web-controller'
import { AlertManager } from '../../presentation/discord/alert-manager'
import metaUrl from '../../testing-helpers/url'
import { OAuthResponse } from '../../domain/o-auth-response'
import { OAuthRequest } from '../../domain/o-auth-request'

export class Alert {
  constructor (
    private readonly oAuthWebController: OAuthWebController,
    private readonly mongoDbService: MongoDbService,
    private readonly discordClient: DiscordClient,
    private readonly alertManager: AlertManager
  ) {}

  async runApp (app: express.Application): Promise<void> {
    this.createServer(app)
    await this.startServer(app)
  }

  private createServer (app: express.Application): void {
    app.engine('mustache', mustacheExpress())
    app.set('view engine', 'mustache')
    app.set(
      'views',
      path.join(url.fileURLToPath(new URL('../src/presentation', url.pathToFileURL(metaUrl).href)), 'views')
    )
    app.get(
      '/',
      this.rootHandler(app) as express.RequestHandler
    )
  }

  private rootHandler (app: express.Application): Function {
    return async (
      request: OAuthRequest,
      result: OAuthResponse
    ) => {
      await this.oAuthWebController.handleOAuth(app, request, result)
    }
  }

  private async startServer (
    app: { listen: (arg0: number, arg1: () => void) => void }
  ): Promise<void> {
    app.listen(
      3001,
      () => {
        console.log('Server is running...')
      }
    )

    await this.mongoDbService.connectToDatabase()
    this.discordClient.setupDiscordClient()
    this.alertManager.dailyReset(17, 1, 0, 0)
  }
}
