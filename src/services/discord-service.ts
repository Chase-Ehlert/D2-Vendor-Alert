import { Vendor } from '../destiny/vendor.js'
import { DestinyService } from './destiny-service.js'
import { UserInterface } from '../database/models/user.js'
import { UserRepository } from '../database/user-repository.js'
import { HttpClient } from '../utility/http-client.js'
import { DiscordConfig } from '../discord/configs/discord-config.js'

export class DiscordService {
  constructor (
    private readonly vendor: Vendor,
    private readonly destinyService: DestinyService,
    private readonly database: UserRepository,
    private readonly httpClient: HttpClient,
    private readonly config: DiscordConfig
  ) { }

  /**
   * Alert registered users about today's vendor inventory
   */
  async alertUsersOfUnownedModsForSale (): Promise<void> {
    for await (const user of await this.database.fetchAllUsers()) {
      await this.checkRefreshTokenExpiration(user)
      await this.compareModsForSaleWithUserInventory(user)
    }
  }

  /**
   * Check the token expiration date and update it if it's expired
   */
  private async checkRefreshTokenExpiration (user: UserInterface): Promise<void> {
    const currentDate = new Date()
    const expirationDate = new Date(String(user.refreshExpiration))
    expirationDate.setDate(expirationDate.getDate() - 1)

    if (currentDate.getTime() > expirationDate.getTime()) {
      const tokenInfo = await this.destinyService.getAccessToken(user.refreshToken)
      await this.database.updateUserByMembershipId(
        tokenInfo.bungieMembershipId,
        tokenInfo.refreshTokenExpirationTime,
        tokenInfo.refreshToken
      )
    }
  }

  /**
   * Check whether any mods for sale are owned by the user
   */
  private async compareModsForSaleWithUserInventory (user: UserInterface): Promise<void> {
    const discordEndpoint = `channels/${user.discordChannelId}/messages`
    const unownedModList = await this.vendor.getCollectiblesForSaleByAda(user)

    if (unownedModList.length > 0) {
      await this.messageUnownedModsList(discordEndpoint, user.discordId, unownedModList)
    } else {
      await this.messageEmptyModsList(discordEndpoint, user.bungieUsername)
    }
  }

  /**
   * Send alert message for unowned mods
   */
  private async messageUnownedModsList (
    discordEndpoint: string,
    discordId: string,
    unownedModList: string[]
  ): Promise<void> {
    let message = `<@${discordId}>\r\nYou have these unowned mods for sale, grab them!`

    unownedModList.forEach(mod => {
      message = message + `\r\n${mod}`
    })

    await this.discordRequest(discordEndpoint, message)
  }

  /**
   * Send update message for no alert required
   */
  private async messageEmptyModsList (discordEndpoint: string, username: string): Promise<void> {
    const message = `${username} does not have any unowned mods for sale today.`

    await this.discordRequest(discordEndpoint, message)
  }

  /**
   * Send off message to user's desired Discord alert channel
   */
  private async discordRequest (endpoint: string, message: string): Promise<void> {
    const result = await this.httpClient.post('https://discord.com/api/v10/' + endpoint,
      {
        content: message
      },
      {
        headers: {
          Authorization: `Bot ${String(this.config.token)}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (result.status !== 200) {
      throw new Error(String(result.status))
    }
  }
}
