import express from 'express'
import bodyParser from 'body-parser'
import { User } from '../models/users.mjs'

const app = express()
const jsonParser = bodyParser.json()

export const getUsers = app.get('/users', async (request, response) => {
    const users = await User.find({})

    try {
        response.send(users)
    } catch (error) {
        response.status(500).send(error)
    }
})

export const getUserEndpoint = app.get('/user', jsonParser, async (request, response) => {
    const userRequest = new User(request.body)
    await User.findOne({ user: userRequest.user }).then((user, error) => {
        if (error) {
            response.status(500).send(error)
        } else {
            user == null ? response.send("User record does not exist!") : response.send(user)
        }
    })
})

export async function getUser(user) {
    const userRequest = new User(user)
    return await User.findOne({ user: userRequest.username }).lean().then((user, error) => {
        if (error) {
            return error
        } else {
            return user.user
        }
    })
}

export const addUser = app.post('/save', jsonParser, async (request, response) => {
    const user = new User(request.body)
    try {
        await user.save()
        response.send(user)
    } catch (error) {
        response.send(500).send(error)
    }
})

export const updateUser = app.patch('/user/:id', jsonParser, async (request, response) => {
    try {
        const something = await User.findByIdAndUpdate(request.params.id, request.body)
        await something.save()
        response.send(something)
    } catch (error) {
        response.send(500).send(error)
    }
})

export const deleteUser = app.delete('/user/:id', jsonParser, async (request, response) => {
    try {
        const user = await User.findByIdAndDelete(request.params.id)

        if (!user) {
            response.status(404).send('The user does not exist')
        }
        response.status(200).send()
    } catch (error) {
        response.status(500).send(error)
    }
})
