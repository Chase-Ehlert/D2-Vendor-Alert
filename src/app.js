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
import { refreshOauthToken } from './utilities/vendor-utils'

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

while (true) {
  await sendMessage()
}

async function sendMessage() {
  for await (const user of User.find()) {
    const discordEndpoint = `channels/${user.discord_channel_id}/messages`
    const currentDate = new Date()
    const expirationDate = new Date(user.refresh_expiration)
    expirationDate.setDate(expirationDate.getDate() - 1)

    //test the expiration in the db record, manipulate it to be ready to expire, clean up functions in file

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

async function xur() {
  let xurInventoryMessage = "Xur is selling:\r\n"
  const xurItems = await getXurInventory()
  xurItems.forEach(item => {
    xurInventoryMessage = xurInventoryMessage + item + "\r\n"
  })
  return xurInventoryMessage
}

async function aggregateFile() {
  return await getAggregatedManifestFile()
}
