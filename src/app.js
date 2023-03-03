import 'dotenv/config'
import express from 'express'
import path from 'path'
import * as url from 'url'
import sessions from 'express-session'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import * as database from './routes/userRoutes.mjs'
import discord, { Collection, Events } from 'discord.js'
import fs from 'fs'
import axios from 'axios'

mongoose.set('strictQuery', false)
const app = express()
const discordClient = new discord.Client({intents: [discord.GatewayIntentBits.Guilds]})
const port = 3001
const oneDay = 1000 * 60 * 60 * 24
// var session
const dirName = url.fileURLToPath(new URL('.', import.meta.url))

discordClient.commands = new Collection()

mongoose.connect(
  `mongodb+srv://deathdealer699:${process.env.DATABASE_PASSWORD}@cluster0.ikypndl.mongodb.net/users`,
  {
      useNewUrlParser: true,
      useUnifiedTopology: true
  }
)

app.listen(port, () => {
  console.log('Server is running...')
})

const directoryName = path.dirname('app.js')
// var users = [
//   {
//     id: '1',
//     username: 'user',
//     password: 'pass'
//   },
//   {
//     id: '2',
//     username: 'users',
//     password: 'passs'
//   }
// ]

// database.each(
//   'CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username text, password text)',
//   (error) => {
//     if (error) {
//     } else {
//       var insert = 'INSERT INTO users (username, password) VALUES (?,?)'
//       users.map((user) => {
//         database.run(insert, [
//           `${user.username}`,
//           `${user.password}`
//         ])
//       })
//     }
//   }
// )

app.use(sessions({
  secret: process.env.SESSION_KEY,
  saveUninitialized: true,
  cookie: { maxAge: oneDay },
  resave: false
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(directoryName))
app.use(cookieParser())

// app.get('/', (request, result) => {
//   session = request.session
//   if (session.userid) {
//     result.send(`Welcome ${session.userid}!<a href='/logout'>Click to logout</a>`)
//   } else {
//     result.sendFile('views/index.html', { root: directoryName })
//   }
// })

app.get('/', async (request, result) => {
  console.log('MESSAGE RECEIVED')

  const {data} = await axios.post('https://www.bungie.net/platform/app/oauth/token/', {
    grant_type: 'authorization_code',
    code: request.query.code,
    client_secret: process.env.VENDOR_ALERT_OAUTH_SECRET,
    client_id: process.env.VENDOR_ALERT_OAUTH_CLIENT_ID
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-api-key': process.env.VENDOR_ALERT_API_KEY
    }
  })

  console.log(data.refresh_expires_in)

  // need to save the user's membership id, the current time plus refresh expiration (to know when it'll expire), and the refresh token in the DB
  const daysTillTokenExpires = data.refresh_expires_in / 60 / 60 / 24
  // const currentDate = Date.now()
  const currentDate = new Date(new Date().toUTCString())
  currentDate.setDate(currentDate.getDate() + daysTillTokenExpires)
  const refreshTokenInfo = {
    refresh_expiration: currentDate,
    refresh_token: data.refresh_token
}

  if (await database.doesUserExist(data.membership_id)) {
    await database.updateUser(data.membership_id, refreshTokenInfo)
  } else {
    await database.addUser(data.membership_id, refreshTokenInfo)
  }

  result.send('YAY')
})

// app.post('/user', async (request, result) => {
  // const selectQuery = `SELECT * FROM users WHERE username='${request.body.username}'`
  // database.get(
  //   selectQuery,
  //   (error, queryResult) => {
  //     if (error || request.body.password == '') {
  //       result.send("Username does not exist\n<a href='/logout'>Logout</a>")
  //     } else if (queryResult.password == request.body.password) {
  //       session = request.session
  //       session.userid = request.body.username
  //       result.send("Whats up! <a href='/logout'>Click to logout</a>")
  //     } else {
  //       result.send("Username does not exist\n<a href='/logout'>Logout</a>")
  //     }
  //   })
//     const userQuery = await getUser(request.body)
//     console.log(userQuery)
// })

// app.get('/logout', (request, result) => {
//   request.session.destroy()
//   result.redirect('/')
// })

// const minutes = 5
// const interval = minutes * 60 * 1000
// setInterval(function() {
//   console.log('here')
// }, interval)

discordClient.once(discord.Events.ClientReady, eventClient => {
  console.log(`Ready, logged in as ${eventClient.user.tag}`)
})

discordClient.login(process.env.VENDOR_ALERT_TOKEN)

const commandsPath = path.join(dirName, 'commands')
const commandsFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

for (const file of commandsFiles) {
  const filePath = path.join(commandsPath, file)
  const command = await import(`./commands/${file}`)

  if ('data' in command.default && 'execute' in command.default) {
    discordClient.commands.set(command.default.data.name, command.default)
  } else {
    console.log(`The command at ${filePath} is missing "data" or "execute"`)
  }
}


discordClient.on(Events.InteractionCreate, async interaction => {
  const command = interaction.client.commands.get(interaction.commandName)

  try {
    await command.execute(interaction)
  } catch (error) {
    console.log(error)
    await interaction.reply({content: 'Something went wrong!'})
  }
})

