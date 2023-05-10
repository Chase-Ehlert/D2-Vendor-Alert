import 'dotenv/config'
import express from 'express'
import path from 'path'
import * as database from './database/users-operations.js'
import { setupDiscordClient } from './discord/discord-client.js'
import { handleAuthorizationCode } from './utilities/token-utils.js'
import { sendMessage } from './utilities/discord-utils.js'

const app = express()
const directoryName = path.dirname('app.js')

database.setupDatabaseConnection()
setupDiscordClient()

app.listen(3001, () => {
  console.log('Server is running...')
})

app.get('/', async (request, result) => {
  if (request.query.code) {
    await handleAuthorizationCode(request)

    result.sendFile('src/views/landing-page.html', { root: directoryName })
  }
})

dailyReset()

function dailyReset() {
  let today = new Date()
  const tomorrowResetTime = new Date();
  tomorrowResetTime.setDate(today.getDate() + 1)
  tomorrowResetTime.setUTCHours(17, 2, 0, 0)

  const waitTime = tomorrowResetTime - Date.now()

  if (waitTime > 0) {
    console.log('Starting timeout')
    const now = new Date(Date.now())
    const options = {
      timeZone: 'America/New_York',
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      hour12: false
    }
    console.log(now.toLocaleString('en-US', options))

    setTimeout(startServer, waitTime)
  } else {
    console.log('Timeout not required')
    today = new Date()
    startServer()
  }
}

async function startServer() {
  const now = new Date(Date.now())
  const options = {
    timeZone: 'America/New_York',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false
  }
  console.log(now.toLocaleString('en-US', options))
  await sendMessage()
  dailyReset()
}
