import mongoose from 'mongoose'
mongoose.set('strictQuery', false)

const UserSchema = new mongoose.Schema({
    membership_id: String,
    refresh_expiration: String,
    refresh_token: String
})

export const User = mongoose.model("users", UserSchema)
