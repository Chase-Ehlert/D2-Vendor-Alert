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
        discord_channel_id: discordChannelId
    })
    try {
        await user.save()
    } catch (error) {
        console.log('Adding user failed')
        throw error
    }
}

export async function updateUser(bungieMembershipId, refreshExpiration, refreshToken, bungieNetUsername, destinyId, characterId) {
    const daysTillTokenExpires = refreshExpiration / 60 / 60 / 24
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + daysTillTokenExpires)

    try {
        await User.findOneAndUpdate(
            { bungie_username: bungieNetUsername },
            {
                $set: {
                    bungie_membership_id: bungieMembershipId,
                    destiny_id: destinyId,
                    destiny_character_id: characterId,
                    refresh_expiration: expirationDate.toISOString(),
                    refresh_token: refreshToken
                }
            },
            (error) => {
                if (error) {
                    console.log('Updating user record failed')
                    throw error
                } else {
                    console.log('Updated user record')
                }
            }
        )
    } catch (error) {
        return error
    }
}
