// @ts-check

import axios from 'axios'
import { config } from '../../config/config.js'
import { User } from '../database/models/user.js'
import Vendor from '../vendor.js'
import DatabaseRepository from '../database/database-repository.js'
import DestinyService from './destiny-service.js'
import DatabaseService from './database-service.js'

const vendor = new Vendor()
const databaseRepo = new DatabaseRepository()
const destinyService = new DestinyService()
const databaseService = new DatabaseService()

class DiscordService {
  constructor() { }

  /**
   * Alert registered users about today's vendor inventory
   */
  async sendMessage() {
    await databaseService.connectToDatabase()
    for await (const user of User.find()) {
      const discordEndpoint = `channels/${user.discord_channel_id}/messages`
      const currentDate = new Date()
      const expirationDate = new Date(String(user.refresh_expiration))
      expirationDate.setDate(expirationDate.getDate() - 1)

      if (currentDate.getTime() < expirationDate.getTime()) {
        console.log('Token does not need to be refreshed')
      } else {
        console.log('Token does need to be refreshed')
        const tokenInfo = await destinyService.getAccessToken(Object(user).refresh_token)
        await databaseRepo.updateUser(
          tokenInfo.bungieMembershipId,
          tokenInfo.refreshTokenExpirationTime,
          tokenInfo.refreshToken
        )
      }
      await this.compareModListWithUserInventory(user, discordEndpoint)
    }
    databaseService.disconnectToDatabase()
  }

  /**
   * Check whether any mods for sale are owned by the user
   * @param {Object} user User's profile information
   * @param {string} discordEndpoint Endpoint for user's desired alert Discord channel
   */
  async compareModListWithUserInventory(user, discordEndpoint) {
    const unownedModList = await vendor.getProfileCollectibles(user)
    if (unownedModList.length > 0) {
      await this.shareUnownedModsList(discordEndpoint, user.discord_id, unownedModList)
    } else {
      await this.shareEmptyModsList(discordEndpoint, user.bungie_username)
    }
  }

  /**
   * Send alert message for unowned mods
   * @param {string} discordEndpoint Endpoint for user's desired alert Discord channel
   * @param {string} discordId User's Discord id
   * @param {Array<string>} unownedModList List of mods unowned by the user
   */
  async shareUnownedModsList(discordEndpoint, discordId, unownedModList) {
    let message = `<@${discordId}>\r\nYou have these unowned mods for sale, grab them!`

    unownedModList.forEach(mod => {
      message = message + `\r\n${mod}`
    })

    await this.discordRequest(discordEndpoint, message)
  }

  /**
   * Send update message for no alert required
   * @param {string} discordEndpoint Endpoint for user's desired alert Discord channel
   * @param {string} username User's Bungie username
   */
  async shareEmptyModsList(discordEndpoint, username) {
    let message = `${username} does not have any unowned mods for sale today.`

    await this.discordRequest(discordEndpoint, message)
  }

  /**
   * Send off message to user's desired Discord alert channel
   * @param {string} endpoint Endpoint for user's desired alert Discord channel
   * @param {string} message Message to send to user
   */
  async discordRequest(endpoint, message) {
    const result = await axios.post('https://discord.com/api/v10/' + endpoint,
      {
        "content": message
      },
      {
        headers: {
          Authorization: `Bot ${config.token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (result.status != 200) {
      throw new Error(String(result.status))
    }
  }
}

export default DiscordService