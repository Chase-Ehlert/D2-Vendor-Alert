import 'dotenv/config'
import axios from 'axios'
import { User } from '../database/models/users.js'
import { getProfileCollectibles } from './vendor-utils.js'
import { updateRefreshToken } from './token-utils.js'

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

async function compareModListWithUserInventory(user, discordEndpoint) {
    const unownedModList = await getProfileCollectibles(user)
    if (unownedModList.length > 0) {
      await shareUnownedModsList(discordEndpoint, user.discord_id, unownedModList)
    } else {
      await shareEmptyModsList(discordEndpoint, user.discord_id)
    }
}

async function shareUnownedModsList(discordEndpoint, discordId, unownedModList) {
  let message = `<@${discordId}>\r\nYou have these unowned mods for sale, grab them!`

  unownedModList.forEach(mod => {
    message = message + `\r\n${mod}`
  })

  await DiscordRequest(discordEndpoint, message)
}

async function shareEmptyModsList(discordEndpoint, discordId) {
  let message = `${discordId} does not have any unowned mods for sale today.`

  await DiscordRequest(discordEndpoint, message)
}

export async function DiscordRequest(endpoint, message) {
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

  return result
}
