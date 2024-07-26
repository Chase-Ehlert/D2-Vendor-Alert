import express, { NextFunction } from 'express'
import { DestinyClient } from '../../infrastructure/destiny/destiny-client.js'
import { DiscordService } from '../../infrastructure/services/discord-service.js'
import { MongoDbService } from '../../infrastructure/persistence/services/mongo-db-service.js'
import { UserInterface } from '../../domain/user/user.js'
import { hyperlink } from 'discord.js'
import { AlertCommandConfig } from '../../presentation/discord/commands/alert-command-config.js'

interface User { user: UserInterface}
interface UserRequest { body: User}

export class Notify {
  constructor (
    private readonly destinyClient: DestinyClient,
    private readonly discordService: DiscordService,
    private readonly mongoDbService: MongoDbService,
    private readonly config: AlertCommandConfig
  ) {}

  async notifyUsers (app: express.Application): Promise<void> {
    await this.mongoDbService.connectToDatabase()

    app.use(express.json())

    app.post(
      '/notify',
      this.handleNotifyingUsers()
    )

    app.listen(
      3002,
      this.logNotifierIsRunning()
    )
  }

  private handleNotifyingUsers () {
    return (request: UserRequest, response: Object, next: NextFunction) => {
      this.destinyClient.getTokenInfo(request.body.user.refreshToken).then(async () =>
        this.notifyUser(request, next).catch(next)
      ).catch(() => {
        this.alertUserToReauthorize(request, next)
      })
    }
  }

  private async notifyUser (request: UserRequest, next: NextFunction): Promise<void> {
    return this.destinyClient.checkRefreshTokenExpiration(request.body.user).then(async () => {
      return this.discordService.compareModsForSaleWithUserInventory(request.body.user).catch(next)
    }).catch(next)
  }

  private alertUserToReauthorize (request: UserRequest, next: NextFunction): void {
    if (this.config.oauthClientId !== undefined) {
      const message = `<@${request.body.user.discordId}> needs to reauthorize. To do so, click ` + hyperlink(
        'here!',
        `https://www.bungie.net/en/oauth/authorize?client_id=${this.config.oauthClientId}&response_type=code`
      )
      this.discordService.discordRequest(request.body.user, message).catch(next)
    }
  }

  private logNotifierIsRunning () {
    return () => {
      console.log('Discord-Notifier is running...')
    }
  }
}
