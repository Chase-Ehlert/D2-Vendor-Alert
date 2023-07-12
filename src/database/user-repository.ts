import { UserService } from '../services/user-service.js'
import { UserSchema } from './models/user-schema.js'

export class UserRepository {
  public userService

  constructor(userService: UserService) {
    this.userService = userService
  }

  /**
     * Checks if user exists in database
     */
  async doesUserExist (bungieNetUsername: string): Promise<boolean> {
    const doesUserExist = !((await UserSchema.exists({ bungie_username: bungieNetUsername }).exec()) == null)

    return doesUserExist
  }

  /**
     * Adds the specified user's information to the database
     */
  async addUser (user: any): Promise<void> {
    await user.save()
  }

  /**
     * Updates the database information for a specific user using their Bungie username
     */
  async updateUserByUsername (
    bungieUsername: string,
    refreshExpirationTime: string,
    refreshToken: string,
    destinyId: string,
    characterId: string
  ): Promise<void> {
    const daysTillTokenExpires = Number(refreshExpirationTime) / 60 / 60 / 24
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + daysTillTokenExpires)

    await UserSchema.updateOne(
      { bungie_username: bungieUsername },
      {
        $set: {
          destiny_id: destinyId,
          destiny_character_id: characterId,
          refresh_expiration: expirationDate.toISOString().split('.')[0] + 'Z',
          refresh_token: refreshToken
        }
      })
  }

  /**
     * Updates the database information for a specific user using their Bungie membership id
     */
  async updateUserByMembershipId (
    bungieMembershipId: string,
    refreshExpirationTime: string,
    refreshToken: string
  ): Promise<void> {
    const daysTillTokenExpires = Number(refreshExpirationTime) / 60 / 60 / 24
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + daysTillTokenExpires)

    await UserSchema.updateOne(
      { bungie_membership_id: bungieMembershipId },
      {
        $set: {
          refresh_expiration: expirationDate.toISOString().split('.')[0] + 'Z',
          refresh_token: refreshToken
        }
      })
  }
}
