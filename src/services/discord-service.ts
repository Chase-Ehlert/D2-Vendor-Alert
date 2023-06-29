import axios from 'axios'
import { Vendor } from '../vendor.js'
import { DatabaseRepository } from '../database/database-repository.js'
import { DestinyService } from './destiny-service.js'
import { DatabaseService } from './database-service.js'
import { UserSchema } from '../database/models/user-schema.js'
import { config } from '../../config/config.js'
import { User } from '../database/models/user.js'

const vendor = new Vendor()
const databaseRepo = new DatabaseRepository()
const destinyService = new DestinyService()
const databaseService = new DatabaseService()

export class DiscordService {
  /**
   * Alert registered users about today's vendor inventory
   */
  async sendMessage (): Promise<void> {
    await databaseService.connectToDatabase()
    for await (const userRecord of UserSchema.find()) {
      let user
      if (
        userRecord.bungie_username !== undefined &&
        userRecord.bungie_username_code !== undefined &&
        userRecord.discord_id !== undefined &&
        userRecord.discord_channel_id !== undefined &&
        userRecord.bungie_membership_id !== undefined &&
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
          userRecord.bungie_membership_id,
          userRecord.destiny_id,
          userRecord.destiny_character_id,
          userRecord.refresh_expiration,
          userRecord.refresh_token
        )
        const discordEndpoint = `channels/${user.discordChannelId}/messages`
        const currentDate = new Date()
        const expirationDate = new Date(String(user.refreshExpiration))
        expirationDate.setDate(expirationDate.getDate() - 1)

        if (currentDate.getTime() < expirationDate.getTime()) {
          console.log('Token does not need to be refreshed')
        } else {
          console.log('Token does need to be refreshed')
          const tokenInfo = await destinyService.getAccessToken(Object(user).refresh_token)
          await databaseRepo.updateUserByMembershipId(
            tokenInfo.bungieMembershipId,
            tokenInfo.refreshTokenExpirationTime,
            tokenInfo.refreshToken
          )
        }
        await this.compareModListWithUserInventory(user, discordEndpoint)
      }
    }
    await databaseService.disconnectToDatabase()
  }

  /**
   * Check whether any mods for sale are owned by the user
   */
  async compareModListWithUserInventory (user: User, discordEndpoint: string): Promise<void> {
    const unownedModList = await vendor.getProfileCollectibles(user)
    if (unownedModList.length > 0) {
      await this.shareUnownedModsList(discordEndpoint, user.discordId, unownedModList)
    } else {
      await this.shareEmptyModsList(discordEndpoint, user.bungieUsername)
    }
  }

  /**
   * Send alert message for unowned mods
   */
  async shareUnownedModsList (discordEndpoint: string, discordId: string, unownedModList: string[]): Promise<void> {
    let message = `<@${discordId}>\r\nYou have these unowned mods for sale, grab them!`

    unownedModList.forEach(mod => {
      message = message + `\r\n${mod}`
    })

    await this.discordRequest(discordEndpoint, message)
  }

  /**
   * Send update message for no alert required
   */
  async shareEmptyModsList (discordEndpoint: string, username: string): Promise<void> {
    const message = `${username} does not have any unowned mods for sale today.`

    await this.discordRequest(discordEndpoint, message)
  }

  /**
   * Send off message to user's desired Discord alert channel
   */
  async discordRequest (endpoint: string, message: string): Promise<void> {
    const result = await axios.post('https://discord.com/api/v10/' + endpoint,
      {
        content: message
      },
      {
        headers: {
          Authorization: `Bot ${config.token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (result.status !== 200) {
      throw new Error(String(result.status))
    }
  }
}
