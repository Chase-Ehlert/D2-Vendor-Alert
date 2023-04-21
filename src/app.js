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

while (true) {
  await sendMessage()
}
