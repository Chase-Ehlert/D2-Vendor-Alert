import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import { getUsers } from './routes/userRoutes.mjs'

const app = express()
mongoose.connect(
    `mongodb+srv://deathdealer699:${process.env.DATABASE_PASSWORD}@cluster0.ikypndl.mongodb.net/users`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
)

app.use(getUsers)

app.listen(3000, () => {
    console.log('Server is running...')
})