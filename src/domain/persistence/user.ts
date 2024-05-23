import { Document } from 'mongoose'

export interface UserInterface extends Document {
  bungieUsername: string
  bungieUsernameCode: string
  discordId: string
  discordChannelId: string
  bungieMembershipId: string
  destinyId: string
  destinyCharacterId: string
  refreshExpiration: number
  refreshToken: string
}
