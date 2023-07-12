import axios from 'axios'
import { Vendor } from '../destiny/vendor.js'
import { DatabaseRepository } from '../database/user-repository.js'
import { DestinyService } from './destiny-service.js'
import { DatabaseService } from './user-service.js'
import { UserSchema } from '../database/models/user-schema.js'
import { User } from '../database/models/user.js'
import { config } from '../../config/config.js'

export class DiscordService {
  private readonly vendor
  private readonly destinyService
  private readonly databaseRepo
  private readonly databaseService

  constructor (vendor: Vendor, destinyService: DestinyService, databaseRepo: DatabaseRepository, databaseService: DatabaseService) {
    this.vendor = vendor
    this.destinyService = destinyService
    this.databaseRepo = databaseRepo
    this.databaseService = databaseService
  }

  /**
   * Alert registered users about today's vendor inventory
   */
  async getUserInfo (): Promise<void> {
    await this.databaseService.connectToDatabase()
    for await (const userRecord of UserSchema.find()) {
      let user
      if (
        userRecord.bungie_username !== undefined &&
        userRecord.bungie_username_code !== undefined &&
        userRecord.discord_id !== undefined &&
        userRecord.discord_channel_id !== undefined &&
        userRecord.destiny_id !== undefined &&
        userRecord.destiny_character_id !== undefined &&
        userRecord.refresh_expiration !== undefined &&
        userRecord.refresh_token !== undefined
      ) {
        user = new User(
          userRecord.bungie_username,
          userRecord.bungie_username_code,
          userRecord.discord_id,
          userRecord.discord_channel_id,
          userRecord.destiny_id,
          userRecord.destiny_character_id,
          userRecord.refresh_expiration,
          userRecord.refresh_token
        )

        await this.checkRefreshTokenExpiration(user)
        await this.compareModListWithUserInventory(user)
      }
    }
    await this.databaseService.disconnectToDatabase()
  }

  /**
   * Check the token expiration date and update it if it's expired
   */
  private async checkRefreshTokenExpiration (user: User): Promise<void> {
    const currentDate = new Date()
    const expirationDate = new Date(String(user.refreshExpiration))
    expirationDate.setDate(expirationDate.getDate() - 1)

    if (currentDate.getTime() > expirationDate.getTime()) {
      const tokenInfo = await this.destinyService.getAccessToken(user.refreshToken)
      await this.databaseRepo.updateUserByMembershipId(
        tokenInfo.bungieMembershipId,
        tokenInfo.refreshTokenExpirationTime,
        tokenInfo.refreshToken
      )
    }
  }

  /**
   * Check whether any mods for sale are owned by the user
   */
  private async compareModListWithUserInventory (user: User): Promise<void> {
    const discordEndpoint = `channels/${user.discordChannelId}/messages`
    const unownedModList = await this.vendor.getProfileCollectibles(user)

    if (unownedModList.length > 0) {
      await this.messageUnownedModsList(discordEndpoint, user.discordId, unownedModList)
    } else {
      await this.messageEmptyModsList(discordEndpoint, user.bungieUsername)
    }
  }

  /**
   * Send alert message for unowned mods
   */
  private async messageUnownedModsList (discordEndpoint: string, discordId: string, unownedModList: string[]): Promise<void> {
    let message = `<@${discordId}>\r\nYou have these unowned mods for sale, grab them!`

    unownedModList.forEach(mod => {
      message = message + `\r\n${mod}`
    })

    await this.discordRequest(discordEndpoint, message)
  }

  /**
   * Send update message for no alert required
   */
  private async messageEmptyModsList (discordEndpoint: string, username: string): Promise<void> {
    const message = `${username} does not have any unowned mods for sale today.`

    await this.discordRequest(discordEndpoint, message)
  }

  /**
   * Send off message to user's desired Discord alert channel
   */
  private async discordRequest (endpoint: string, message: string): Promise<void> {
    const result = await axios.post('https://discord.com/api/v10/' + endpoint,
      {
        content: message
      },
      {
        headers: {
          Authorization: `Bot ${config.configModel.token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (result.status !== 200) {
      throw new Error(String(result.status))
    }
  }
}
