// @ts-check

import { User } from '../database/models/users.js'

/**
 * Checks if user exists in database
 * @param {string} bungieNetUsername User's Bungie Net username 
 * @returns {Promise<boolean>} true/false
 */
export async function doesUserExist(bungieNetUsername) {
    return await User.exists({ bungie_username: bungieNetUsername }).exec() ? true : false
}

/**
 * Adds the specified user's information to the database
 * @param {string} bungieNetUsername User's Bungie Net username
 * @param {string} discordId User's Discord id
 * @param {string} discordChannelId Id of Discord channel user initialized the alert from
 */
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

/**
 * Updates the database information for a specific user
 * @param {string} bungieMembershipId User's membership id on Bungie
 * @param {number} refreshExpirationTime Date of expiration for user's refresh token
 * @param {string} refreshToken User's refresh token
 * @param {string} [bungieNetUsername] User's Bungie username
 * @param {string} [destinyId] User's id in Destiny 2
 * @param {string} [characterId] User's character (Hunter, Titan, Warlock) id
 */
export async function updateUser(bungieMembershipId, refreshExpirationTime, refreshToken, bungieNetUsername, destinyId, characterId) {
    const daysTillTokenExpires = refreshExpirationTime / 60 / 60 / 24
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + daysTillTokenExpires)

    try {
        await User.updateOne(
            { bungie_membership_id: bungieMembershipId },
            {
                $set: {
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