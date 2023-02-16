import 'dotenv/config'
import express from 'express'
import path from 'path'
import sessions from 'express-session'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import {getUser} from './routes/userRoutes.mjs'
import discord from 'discord.js'

mongoose.set('strictQuery', false)
const app = express()
const discordClient = new discord.Client
const port = 3001
const oneDay = 1000 * 60 * 60 * 24
var session

// const database = new sqlite3.Database('db.sqlite', (error) => {
//   if (error) {
//     console.error(error.message)
//     throw error
//   } else {
//     console.log('Connected to database!')
//   }
// });

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
//       var insert = 'INSERT INTO users (username, password) VALUES (?,?)';
//       users.map((user) => {
//         database.run(insert, [
//           `${user.username}`,
//           `${user.password}`
//         ]);
//       });
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

const minutes = 5
const interval = minutes * 60 * 1000
setInterval(function() {
  console.log('here')
}, interval)

// app.listen(port, () => console.log(`Server running at port ${port}`))

discordClient.on('message', message => {
  if (message.content == 'Speak Bot') {
    message.reply('Hello World')
  }
})

discordClient.login(process.env.VENDOR_ALERT_TOKEN)