import { TokenInfo } from './token-info'
import { UserInterface } from './user'

export interface UserRepository {
  doesUserExist: (bungieNetUsername: string) => Promise<boolean>

  addUser: (
    bungieUsername: string,
    bungieUsernameCode: string,
    discordId: string,
    discordChannelId: string
  ) => Promise<void>

  updateUserByMembershipId: (tokenInfo: TokenInfo) => Promise<void>

  updateUserByUsername: (
    bungieUsername: string,
    refreshExpirationTime: string,
    refreshToken: string,
    destinyId: string,
    characterId: string
  ) => Promise<void>

  fetchAllUsers: () => Promise<UserInterface[]>
}
