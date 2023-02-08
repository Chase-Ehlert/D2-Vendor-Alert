import mongoose from 'mongoose'
mongoose.set('strictQuery', false)

const UserSchema = new mongoose.Schema({
        user: String,
        password: String
    })

const User = mongoose.model("d2-vendor-alert-users", UserSchema)

export { User }