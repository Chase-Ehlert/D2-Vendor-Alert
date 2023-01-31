import express from 'express'
import path from 'path'
import sessions from 'express-session'
import cookieParser from 'cookie-parser'
const app = express()
const port = 3000
const oneDay = 1000*60*60*24

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })

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

//store in database
const user = 'user'
const password = 'pass'

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

