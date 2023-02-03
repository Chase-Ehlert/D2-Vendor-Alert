import 'dotenv/config';
import express from 'express'
import mongoose from 'mongoose'
import { getUserRow } from './routes/userRoutes.mjs'

const app = express()
mongoose.connect(
    `mongodb+srv://deathdealer699:${process.env.DATABASE_PASSWORD}@cluster0.ikypndl.mongodb.net/test`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
)

app.use(getUserRow)

app.listen(3000, () => {
    console.log('Server is running...')
})