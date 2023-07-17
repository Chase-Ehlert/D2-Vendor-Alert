import { UserService } from '../services/user-service.js'
import { User, UserInterface } from './models/user.js'

export class MongoUserRepository {
  public userService

  constructor (userService: UserService) {
    this.userService = userService
  }

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

    try {
      await newUser.save()
    } catch (error) {
      throw Error('Could not create new user')
    }
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
    const updatedUser = new User({
      refreshExpiration: this.determineExpirationDate(refreshExpirationTime),
      refreshToken: refreshToken,
      destinyId: destinyId,
      destinyCharacterId: characterId
    },
    { _id: false })

    try {
      await User.findOneAndUpdate(filter, { $set: updatedUser })
    } catch (error) {
      console.error(error)
      throw Error(`The record for ${bungieUsername}, could not be updated`)
    }
  }

  /**
     * Updates the database information for a specific user using their Bungie membership id
     */
  async updateUserByMembershipId (
    bungieMembershipId: string,
    refreshExpirationTime: string,
    refreshToken: string
  ): Promise<void> {
    const filter = { bungieMembershipId: bungieMembershipId }
    const updatedUser = new User({
      refreshExpiration: this.determineExpirationDate(refreshExpirationTime),
      refreshToken: refreshToken
    },
    { _id: false }
    )

    try {
      await User.findOneAndUpdate(filter, updatedUser)
    } catch (error) {
      console.error(error)
      throw new Error(`The record for ${bungieMembershipId}, could not be updated`)
    }
  }

  /**
   * Returns a list of all users subscribed to be alerted
   */
  async fetchAllUsers (): Promise<UserInterface[]> {
    return await User.find()
  }

  public determineExpirationDate (refreshExpirationTime: string): string {
    const daysTillTokenExpires = Number(refreshExpirationTime) / 60 / 60 / 24
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + daysTillTokenExpires)

    return expirationDate.toISOString().split('.')[0] + 'Z'
  }
}
