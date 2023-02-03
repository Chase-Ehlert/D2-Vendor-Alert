import express from 'express'
import { User } from '../models/users.mjs'

const app = express()

export const getUserRow = app.get('/user-row', async (request, response) => {
    const users = await User.find({})

    try {
        response.send(users)
    } catch (error) {
        response.status(500).send(error)
    }
})
