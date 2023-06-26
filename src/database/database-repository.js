// @ts-check

import { User } from './models/user.js'
import DatabaseService from './../services/database-service.js'

const databaseService = new DatabaseService()

/**
 * Checks if user exists in database
 * @param {string} bungieNetUsername User's Bungie Net username 
 * @returns {Promise<boolean>} true/false
 */
export async function doesUserExist(bungieNetUsername) {
    await databaseService.connectToDatabase()
    const doesUserExist = await User.exists({ bungie_username: bungieNetUsername }).exec() ? true : false
    databaseService.disconnectToDatabase()

    return doesUserExist
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

    await databaseService.connectToDatabase()
    await user.save()
    databaseService.disconnectToDatabase()
}

/**
 * Updates the database information for a specific user
 * @param {string} bungieMembershipId User's membership id on Bungie
 * @param {number} refreshExpirationTime Date of expiration for user's refresh token
 * @param {string} refreshToken User's refresh token
 * @param {string} [destinyId] User's id in Destiny 2
 * @param {string} [characterId] User's character (Hunter, Titan, Warlock) id
 */
export async function updateUser(bungieMembershipId, refreshExpirationTime, refreshToken, destinyId, characterId) {
    const daysTillTokenExpires = refreshExpirationTime / 60 / 60 / 24
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + daysTillTokenExpires)

    await databaseService.connectToDatabase()
    await User.updateOne(
        { bungie_membership_id: bungieMembershipId },
        {
            $set: {
                destiny_id: destinyId,
                destiny_character_id: characterId,
                refresh_expiration: expirationDate.toISOString(),
                refresh_token: refreshToken
            }
        })
    databaseService.disconnectToDatabase()
}
