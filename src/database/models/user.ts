import mongoose from 'mongoose'

mongoose.set('strictQuery', false)

const UserSchema = new mongoose.Schema({
    bungie_username: String,
    discord_id: String,
    discord_channel_id: String,
    bungie_membership_id: String,
    destiny_id: String,
    destiny_character_id: String,
    refresh_expiration: String,
    refresh_token: String
})

export const User = mongoose.model("users", UserSchema)