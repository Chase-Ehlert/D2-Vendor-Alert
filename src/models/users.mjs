import mongoose from 'mongoose'
mongoose.set('strictQuery', false)

const UserSchema = new mongoose.Schema({
    username: String,
    password: String
})

export const User = mongoose.model("d2-vendor-alert-users", UserSchema)
