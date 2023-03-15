import 'dotenv/config'
import express from 'express'
import * as database from './database/users-operations.js'
import { setupDiscordClient } from './discord/discord-client.js'
import { handleRefreshToken } from './database/refresh-token.js'
import path from 'path'

const app = express()
const directoryName = path.dirname('app.js')

database.setupDatabaseConnection()
setupDiscordClient()

app.listen(3001, () => {
  console.log('Server is running...')
})

app.get('/', async (request, result) => {
  handleRefreshToken(request)

  result.sendFile('views/landing-page.html', { root: directoryName })
})
