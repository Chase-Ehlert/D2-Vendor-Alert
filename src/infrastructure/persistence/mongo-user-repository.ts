import { UserRepository } from '../../domain/user/user-repository.js'
import { UserInterface } from '../../domain/user/user.js'
import { User } from './user-schema.js'

export class MongoUserRepository implements UserRepository {
  /**
     * Checks if user exists in database
     */
  async doesUserExist (bungieNetUsername: string): Promise<boolean> {
    const index = bungieNetUsername.indexOf('#')
    const username = bungieNetUsername.substring(0, index)

    const doesUserExist = await User.exists({ bungieUsername: username })

    if (doesUserExist !== null) {
      return true
    } else {
      return false
    }
  }

  /**
     * Adds the specified user's information to the database
     */
  async addUser (
    bungieUsername: string,
    bungieUsernameCode: string,
    discordId: string,
    discordChannelId: string
  ): Promise<void> {
    const newUser = new User({
      bungieUsername: bungieUsername,
      bungieUsernameCode: bungieUsernameCode,
      discordId: discordId,
      discordChannelId: discordChannelId
    })

    await newUser.save()
  }

  /**
     * Updates the database information for a specific user using their Bungie membership id
     */
  async updateUserByMembershipId (
    membershipId: string,
    refreshToken: string,
    refreshTokenExpirationTime: string
  ): Promise<void> {
    const filter = { bungieMembershipId: membershipId }
    const updatedUser = new User({
      refreshExpiration: this.determineExpirationDate(refreshTokenExpirationTime),
      refreshToken: refreshToken
    },
    { _id: false }
    )

    await User.findOneAndUpdate(filter, updatedUser)
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
    const filter = { bungieUsername: bungieUsername }
    const updatedUser = new User(
      {
        refreshExpiration: this.determineExpirationDate(refreshExpirationTime),
        refreshToken: refreshToken,
        destinyId: destinyId,
        destinyCharacterId: characterId
      },
      { _id: false }
    )

    await User.findOneAndUpdate(filter, { $set: updatedUser })
  }

  /**
   * Returns a list of all users subscribed to be alerted
   */
  async fetchAllUsers (): Promise<UserInterface[]> {
    return User.find()
  }

  private determineExpirationDate (refreshExpirationTime: string): string {
    const daysTillTokenExpires = Number(refreshExpirationTime) / 60 / 60 / 24
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + daysTillTokenExpires)

    return expirationDate.toISOString().split('.')[0] + 'Z'
  }
}
