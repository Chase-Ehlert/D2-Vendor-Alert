import express from 'express'
import mustacheExpress from 'mustache-express'
import * as path from 'path'
import * as url from 'url'
import * as discord from 'discord.js'
import metaUrl from '../../testing-helpers/url.js'
import { DiscordClient } from '../../presentation/discord/discord-client.js'
import { MongoDbService } from '../../infrastructure/database/mongo-db-service.js'
import { OAuthWebController } from '../../presentation/web/o-auth-web-controller.js'
import { AlertManager } from '../../presentation/discord/alert-manager.js'
import { OAuthResponse } from '../../domain/o-auth-response.js'
import { OAuthRequest } from '../../domain/o-auth-request.js'

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
    const discordJsClient = new discord.Client({
      intents: [
        discord.GatewayIntentBits.Guilds,
        discord.GatewayIntentBits.GuildMessages,
        discord.GatewayIntentBits.MessageContent,
        discord.GatewayIntentBits.GuildMessageReactions
      ]
    })

    app.listen(
      3001,
      this.logServerIsRunning()
    )

    await this.mongoDbService.connectToDatabase()
    await this.discordClient.setupDiscordClient(discordJsClient)
    this.alertManager.dailyReset(17, 1, 0, 0)
  }

  private logServerIsRunning () {
    return () => {
      console.log('Server is running...')
    }
  }
}
