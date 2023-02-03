import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    user: {
        user: String,
        password: String
    }
})

const User = mongoose.model("User", UserSchema)

export { User }