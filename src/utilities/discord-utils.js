import 'dotenv/config'
import axios from 'axios'
import { User } from '../database/models/users.js'
import { refreshOauthToken, getProfileCollectibles } from './vendor-utils.js'

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

export async function sendMessage() {
  for await (const user of User.find()) {
    const discordEndpoint = `channels/${user.discord_channel_id}/messages`
    const currentDate = new Date()
    const expirationDate = new Date(user.refresh_expiration)
    expirationDate.setDate(expirationDate.getDate() - 1)

    if (currentDate.getTime() < expirationDate.getTime()) {
      console.log('THE TOKEN DOES NOT NEED TO BE REFRESHED')
      await compareModListWithUserInventory(currentDate, user, discordEndpoint)
    } else {
      console.log('THE TOKEN DOES NEED TO BE REFRESHED')
      await refreshOauthToken(user.refresh_token)
      await compareModListWithUserInventory(currentDate, user, discordEndpoint)
    }
  }
}

async function compareModListWithUserInventory(currentDate, user, discordEndpoint) {
  if (currentDate.getUTCHours() > 17) {
    const unownedModList = await getProfileCollectibles(user)
    if (unownedModList.length > 0) {
      await shareUnownedModsList(discordEndpoint, user.discord_id, unownedModList)
    } else {
      await shareEmptyModsList(discordEndpoint, user.bungie_username)
    }
  }
}

async function shareUnownedModsList(discordEndpoint, discordId, unownedModList) {
  let message = `<@${discordId}>\r\nYou have these unowned mods for sale, grab them!`

  unownedModList.forEach(mod => {
    message = message + `\r\n${mod}`
  })

  await DiscordRequest(discordEndpoint, message)
}

async function shareEmptyModsList(discordEndpoint, bungieNetUsername) {
  let message = `${bungieNetUsername} does not have any unowned mods for sale today.`

  await DiscordRequest(discordEndpoint, message)
}
