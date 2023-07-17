import mongoose, { Document, Schema } from 'mongoose'

export interface UserInterface extends Document {
  bungieUsername: string
  bungieUsernameCode: string
  discordId: string
  discordChannelId: string
  bungieMembershipId: string
  destinyId: string
  destinyCharacterId: string
  refreshExpiration: string
  refreshToken: string
}

const NewUserSchema = new Schema({
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

const UpdatedUserSchema = new Schema({
  bungieUsername: { type: String, required: true },
  bungieUsernameCode: { type: String, required: true },
  discordId: { type: String, required: true },
  discordChannelId: { type: String, required: true },
  bungieMembershipId: { type: String },
  destinyId: { type: String },
  destinyCharacterId: { type: String },
  refreshExpiration: { type: String },
  refreshToken: { type: String }
},
{ _id: false }
)

export const NewUser = mongoose.model<UserInterface>('NewUsers', NewUserSchema)
export const UpdatedUser = mongoose.model<UserInterface>('UpdatedUsers', UpdatedUserSchema)
