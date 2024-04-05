import { Vendor } from './vendor.js'
import { UserInterface } from '../domain/user.js'
import { HttpClient } from './http-client.js'
import { DiscordConfig } from '../configs/discord-config.js'

export class DiscordService {
  constructor (
    private readonly vendor: Vendor,
    private readonly httpClient: HttpClient,
    private readonly config: DiscordConfig
  ) {}

  /**
   * Check whether any mods for sale are owned by the user
   */
  async compareModsForSaleWithUserInventory (
    user: UserInterface
  ): Promise<void> {
    const discordEndpoint = `channels/${user.discordChannelId}/messages`
    const unownedMods = await this.vendor.getUnownedModsForSaleByAda(user)

    if (unownedMods.length > 0) {
      await this.messageUnownedModsList(
        discordEndpoint,
        user.discordId,
        unownedMods
      )
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

    unownedModList.forEach((mod) => {
      message = message + `\r\n${mod}`
    })

    await this.discordRequest(discordEndpoint, message)
  }

  /**
   * Send update message for no alert required
   */
  private async messageEmptyModsList (
    discordEndpoint: string,
    username: string
  ): Promise<void> {
    const message = `${username} does not have any unowned mods for sale today.`

    await this.discordRequest(discordEndpoint, message)
  }

  /**
   * Send off message to user's desired Discord alert channel
   */
  private async discordRequest (
    endpoint: string,
    message: string
  ): Promise<void> {
    const result = await this.httpClient.post(
      'https://discord.com/api/v10/' + endpoint,
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
