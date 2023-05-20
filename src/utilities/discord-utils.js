import 'dotenv/config'
import axios from 'axios'
import { User } from '../database/models/users.js'
import { getProfileCollectibles } from './vendor-utils.js'
import { updateRefreshToken } from './token-utils.js'

/**
 * Alert registered users about today's vendor inventory
 */
export async function sendMessage() {
  for await (const user of User.find()) {
    const discordEndpoint = `channels/${user.discord_channel_id}/messages`
    const currentDate = new Date()
    const expirationDate = new Date(user.refresh_expiration)
    expirationDate.setDate(expirationDate.getDate() - 1)

    if (currentDate.getTime() < expirationDate.getTime()) {
      console.log('Token does not need to be refreshed')
    } else {
      console.log('Token does need to be refreshed')
      await updateRefreshToken(user.refresh_token)
    }
    await compareModListWithUserInventory(user, discordEndpoint)
  }
}

/**
 * Check whether any mods for sale are owned by the user
 * @param {User} user User's profile information
 * @param {string} discordEndpoint Endpoint for user's desired alert Discord channel
 */
async function compareModListWithUserInventory(user, discordEndpoint) {
    const unownedModList = await getProfileCollectibles(user)
    if (unownedModList.length > 0) {
      await shareUnownedModsList(discordEndpoint, user.discord_id, unownedModList)
    } else {
      console.log(`EMPTY MOD LIST USERNAME ${user.bungie_username}`)
      console.log(user)
      await shareEmptyModsList(discordEndpoint, user.bungie_username)
    }
}

/**
 * Send alert message for unowned mods
 * @param {string} discordEndpoint Endpoint for user's desired alert Discord channel
 * @param {string} discordId User's Discord id
 * @param {Array<string>} unownedModList List of mods unowned by the user
 */
async function shareUnownedModsList(discordEndpoint, discordId, unownedModList) {
  let message = `<@${discordId}>\r\nYou have these unowned mods for sale, grab them!`

  unownedModList.forEach(mod => {
    message = message + `\r\n${mod}`
  })

  await discordRequest(discordEndpoint, message)
}

/**
 * Send update message for no alert required
 * @param {string} discordEndpoint Endpoint for user's desired alert Discord channel
 * @param {string} username User's Bungie username
 */
async function shareEmptyModsList(discordEndpoint, username) {
  let message = `${username} does not have any unowned mods for sale today.`

  await discordRequest(discordEndpoint, message)
}

/**
 * Send off message to user's desired Discord alert channel
 * @param {string} endpoint Endpoint for user's desired alert Discord channel
 * @param {string} message Message to send to user
 */
export async function discordRequest(endpoint, message) {
  const result = await axios.post('https://discord.com/api/v10/' + endpoint,
    {
      "content": message
    },
    {
      headers: {
        Authorization: `Bot ${process.env.VENDOR_ALERT_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (result.status != 200) {
    throw new Error(result.status)
  }
}
