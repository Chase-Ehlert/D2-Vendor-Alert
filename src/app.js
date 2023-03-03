import 'dotenv/config'
import express from 'express'
import * as database from './database/users-operations.js'
import { setupDiscordClient } from './discord/discord-client.js'
import { handleRefreshToken } from './database/index.js'

const app = express()

database.setupDatabaseConnection()
setupDiscordClient()

app.listen(3001, () => {
  console.log('Server is running...')
})

app.get('/', async (request, result) => {
  handleRefreshToken(request)

  result.send('YAY')
})
