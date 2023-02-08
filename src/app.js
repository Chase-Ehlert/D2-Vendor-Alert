import 'dotenv/config'
import express from 'express'
import path from 'path'
import sessions from 'express-session'
import cookieParser from 'cookie-parser'
import sqlite3 from 'sqlite3'

const app = express()
const port = 3000
const oneDay = 1000 * 60 * 60 * 24
const database = new sqlite3.Database('db.sqlite', (error) => {
  if (error) {
    console.error(error.message)
    throw error
  } else {
    console.log('Connected to database!')
  }
});
const directoryName = path.dirname('app.js')
var users = [
  {
    id: '1',
    username: 'user',
    password: 'pass'
  },
  {
    id: '2',
    username: 'users',
    password: 'passs'
  }
]
var session

database.each(
  'CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username text, password text)',
  (error) => {
    if (error) {
    } else {
      var insert = 'INSERT INTO users (username, password) VALUES (?,?)';
      users.map((user) => {
        database.run(insert, [
          `${user.username}`,
          `${user.password}`
        ]);
      });
    }
  }
)

app.use(sessions({
  secret: 'blah',
  saveUninitialized: true,
  cookie: { maxAge: oneDay },
  resave: false
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(directoryName))
app.use(cookieParser())

app.get('/', (request, result) => {
  session = request.session
  if (session.userid) {
    result.send(`Welcome ${session.userid}!<a href='/logout'>Click to logout</a>`)
  } else {
    result.sendFile('views/index.html', { root: directoryName })
  }
})

app.post('/user', (request, result) => {
  const selectQuery = `SELECT * FROM users WHERE username='${request.body.username}'`
  database.get(
    selectQuery,
    (error, queryResult) => {
      if (error || request.body.password == '') {
        result.send("Username does not exist\n<a href='/logout'>Logout</a>")
      } else if (queryResult.password == request.body.password) {
        session = request.session
        session.userid = request.body.username
        result.send("Whats up! <a href='/logout'>Click to logout</a>")
      } else {
        result.send("Username does not exist\n<a href='/logout'>Logout</a>")
      }
    })
})

app.get('/logout', (request, result) => {
  request.session.destroy()
  result.redirect('/')
})

app.listen(port, () => console.log(`Server running at port ${port}`))
