import mongoose, { Schema } from 'mongoose'
import { UserInterface } from '../../domain/user/user.js'

const UserSchema = new Schema({
  bungieUsername: { type: String, required: true },
  bungieUsernameCode: { type: String, required: true },
  discordId: { type: String, required: true },
  discordChannelId: { type: String, required: true },
  bungieMembershipId: { type: String },
  destinyId: { type: String },
  destinyCharacterId: { type: String },
  refreshExpiration: { type: String },
  refreshToken: { type: String }
})

export const User = mongoose.model<UserInterface>('Users', UserSchema)
