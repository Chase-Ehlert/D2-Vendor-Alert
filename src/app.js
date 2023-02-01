import express from 'express'
import path from 'path'
import sessions from 'express-session'
import cookieParser from 'cookie-parser'
import sqlite3 from 'sqlite3';
const app = express()
const port = 3000
const oneDay = 1000*60*60*24

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })

const db = new sqlite3.Database("db.sqlite", (err) => {
  if (err) {
    // Cannot open database
    console.error(err.message);
    throw err;
  } else {
    console.log("Connected to the SQLite database.");
  }
});

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

db.run(
  `CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username text, password text)`,
  (err) => {
    if (err) {
      // console.log(err)
      // Table already created
    } else {
      // Table just created, creating some rows
      var insert = "INSERT INTO users (username, password) VALUES (?,?)";
      users.map((user) => {
        db.run(insert, [
          `${user.username}`,
          `${user.password}`
        ]);
      });
    }
  }
)

app.use(sessions({
  secret: 'abc',
  saveUnintialized: true,
  cookie: {maxAge: oneDay},
  resave: false
}))

app.use(express.json())
app.use(express.urlencoded({extended: true}))

const __dirname = path.dirname('app.js')

app.use(express.static(__dirname))

app.use(cookieParser())

var session

app.get('/', (request, result) => {
  session = request.session
  if(session.userid) {
    result.send("Welcome! <a href='/logout'>Click to logout</a>")
  } else {
    result.sendFile('views/index.html', {root: __dirname})
  }
})

app.post('/user', (request, result) => {
  if(request.body.username == user && request.body.password == password) {
    session = request.session
    session.userid = request.body.username
    console.log(request.session)
    result.send("Whats up! <a href='/logout'>Click to logout</a>")
  } else {
    result.send('Invalid login combo')
  }
})

app.get('/logout', (request, result) => {
  request.session.destroy()
  result.redirect('/')
})

app.listen(port, () => console.log(`Server running at port ${port}`))

