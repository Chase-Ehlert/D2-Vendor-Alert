import 'dotenv/config'
import express from 'express'
import path from 'path'
import * as database from './database/users-operations.js'
import { setupDiscordClient } from './discord/discord-client.js'
import { handleRefreshToken } from './database/refresh-token.js'
import { sendMessage } from './utilities/discord-utils.js'

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

const targetTime = new Date();
targetTime.setDate(targetTime.getDate() + 1)
targetTime.setUTCHours(17, 2, 0, 0)

const waitTime = targetTime - Date.now();

if (waitTime > 0) {
  setTimeout(startServer, waitTime);
} else {
  startServer();
}

async function startServer() {
  await sendMessage()
}
