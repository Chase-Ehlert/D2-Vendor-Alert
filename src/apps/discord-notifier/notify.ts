import express from 'express'
import { DestinyApiClient } from '../../infrastructure/destiny/destiny-api-client'
import { DiscordService } from '../../infrastructure/services/discord-service'
import { MongoDbService } from '../../infrastructure/services/mongo-db-service'

export class Notify {
  constructor (
    private readonly destinyApiClient: DestinyApiClient,
    private readonly discordService: DiscordService,
    private readonly mongoDbService: MongoDbService
  ) {}

  async notifyUsers (app: express.Application): Promise<void> {
    app.use(express.json())

    app.listen(3002, () => {
      console.log('Discord-Notifier is running...')
    })

    app.post(
      '/notify',
      this.notifyHandler(app) as express.RequestHandler
    )

    await this.mongoDbService.connectToDatabase()
  }

  private notifyHandler (app: express.Application): Function {
    return (async (request, result) => {
      await this.destinyApiClient.checkRefreshTokenExpiration(request.body.user)
      await this.discordService.compareModsForSaleWithUserInventory(request.body.user)
    }) as express.RequestHandler
  }
}
