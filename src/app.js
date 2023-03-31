import 'dotenv/config'
import express from 'express'
import * as database from './database/users-operations.js'
import { setupDiscordClient } from './discord/discord-client.js'
import { handleRefreshToken } from './database/refresh-token.js'
import path from 'path'
import { getXurInventory, getProfileCollectibles } from './utilities/vendor-utils.js'
import { getAggregatedManifestFile } from './utilities/manifest-utils.js'
import { DiscordRequest } from './utilities/discord-utils.js'
import { User } from './database/models/users.js'

const app = express()
const directoryName = path.dirname('app.js')

database.setupDatabaseConnection()
setupDiscordClient()

app.listen(3001, () => {
  console.log('Server is running...')
})

app.get('/', async (request, result) => {
  await handleRefreshToken(request)

  result.sendFile('src/views/landing-page.html', { root: directoryName })
})

async function sendMessage() {
  for await (const user of User.find()) {
    const discordEndpoint = `channels/${user.discord_channel_id}/messages`
    let time = new Date()
    const timeOfDay = `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`

    // Need to understand the refresh token expiration, check it, and then make the necessary call

    if (timeOfDay === '13:2:1') {
      const unownedModList = await getProfileCollectibles(user)
      if (unownedModList.length > 0) {
        await shareUnownedModsList(discordEndpoint, user.discord_id, unownedModList)
      } else {
        await shareEmptyModsList(discordEndpoint, user.bungie_username)
      }
    }
  }
}

while (true) {
  await sendMessage()
}

// await sendMessage()

async function shareUnownedModsList(discordEndpoint, discordId, unownedModList) {
  let message = `<@${discordId}>\r\nYou have these unowned mods for sale, grab them!`

  unownedModList.forEach(mod => {
    message = message + `\r\n${mod}`
  })

  await DiscordRequest(discordEndpoint, {
    method: 'POST',
    body: {
      content: message,
    }
  })
}

async function shareEmptyModsList(discordEndpoint, bungieNetUsername) {
  let message = `${bungieNetUsername} does not have any unowned mods for sale today.`

  await DiscordRequest(discordEndpoint, {
    method: 'POST',
    body: {
      content: message,
    }
  })
}

async function xur() {
  let xurInventoryMessage = "Xur is selling:\r\n"
  let xurItems = await getXurInventory()
  xurItems.forEach(item => {
    xurInventoryMessage = xurInventoryMessage + item + "\r\n"
  })
  return xurInventoryMessage
}

async function aggregateFile() {
  return await getAggregatedManifestFile()
}
