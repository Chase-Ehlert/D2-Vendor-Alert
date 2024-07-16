import express from 'express'
import { DestinyClient } from '../../infrastructure/destiny/destiny-client.js'
import { DiscordService } from '../../infrastructure/services/discord-service.js'
import { MongoDbService } from '../../infrastructure/persistence/services/mongo-db-service.js'
import { UserInterface } from '../../domain/user/user.js'

interface User { user: UserInterface}
interface UserRequest { body: User}

export class Notify {
  constructor (
    private readonly destinyClient: DestinyClient,
    private readonly discordService: DiscordService,
    private readonly mongoDbService: MongoDbService
  ) {}

  async notifyUsers (app: express.Application): Promise<void> {
    app.use(express.json())

    app.listen(
      3002,
      this.logNotifierIsRunning()
    )

    app.post(
      '/notify',
      (request: UserRequest, response, next) => {
        this.destinyClient.checkRefreshTokenExpiration(request.body.user).then(() => {
          this.discordService.compareModsForSaleWithUserInventory(request.body.user).catch(next)
        }).catch(next)
      }
    )

    await this.mongoDbService.connectToDatabase()
  }

  private logNotifierIsRunning () {
    return () => {
      console.log('Discord-Notifier is running...')
    }
  }
}
