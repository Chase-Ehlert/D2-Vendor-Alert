import mongoose from 'mongoose'
import { User } from './models/users.js'

export function setupDatabaseConnection() {
    mongoose.set('strictQuery', false)
    mongoose.connect(
        `mongodb+srv://deathdealer699:${process.env.DATABASE_PASSWORD}@cluster0.ikypndl.mongodb.net/d2-vendor-alert`,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    )
}

export async function doesUserExist(bungieNetUsername) {
    return await User.exists({ bungie_username: bungieNetUsername }).exec() ? true : false
}

export async function addUser(bungieNetUsername, discordId, discordChannelId) {
    const user = new User({
        bungie_username: bungieNetUsername,
        discord_id: discordId,
        discord_channel_id: discordChannelId,
        destiny_id: '',
        refresh_expiration: '',
        refresh_token: ''
    })

    try {
        await user.save()
    } catch (error) {
        console.log('Adding user failed')
        console.log(error)
    }
}

export async function updateUser(bungieNetUsername, destinyId, refreshTokenInfo) {
    try {
        await User.findOneAndUpdate(
            { bungie_username: bungieNetUsername },
            { $set: { refreshTokenInfo } },
            { $set: { destinyId } },
            (error) => {
                if (error) {
                    console.log('Updating user record failed')
                    console.log(error)
                } else {
                    console.log('Updated user record')
                }
            }
        )
    } catch (error) {
        return error
    }
}
