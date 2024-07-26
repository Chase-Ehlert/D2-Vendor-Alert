import { Vendor } from '../../domain/destiny/vendor.js'
import { UserInterface } from '../../domain/user/user.js'
import { HttpClient } from '../persistence/http-client.js'
import { DiscordClientConfig } from '../../presentation/discord/configs/discord-client-config.js'

export class DiscordService {
  constructor (
    private readonly vendor: Vendor,
    private readonly httpClient: HttpClient,
    private readonly config: DiscordClientConfig
  ) {}

  /**
   * Check whether any mods for sale are owned by the user
   */
  async compareModsForSaleWithUserInventory (
    user: UserInterface
  ): Promise<void> {
    const unownedMods = await this.vendor.getUnownedMods(user)

    if (unownedMods.length > 0) {
      await this.messageUnownedModsList(user, unownedMods)
    } else {
      await this.messageEmptyModsList(user)
    }
  }

  /**
   * Send alert message for unowned mods
   */
  private async messageUnownedModsList (user: UserInterface, unownedModList: string[]): Promise<void> {
    let message = `<@${user.discordId}>\r\nYou have these unowned mods for sale, grab them!`

    unownedModList.forEach((mod) => {
      message = message + `\r\n${mod}`
    })

    await this.discordRequest(user, message)
  }

  /**
   * Send update message for no alert required
   */
  private async messageEmptyModsList (user: UserInterface): Promise<void> {
    const message = `${user.bungieUsername} does not have any unowned mods for sale today.`

    await this.discordRequest(user, message)
  }

  /**
   * Send off message to user's desired Discord alert channel
   */
  async discordRequest (
    user: UserInterface,
    message: string
  ): Promise<void> {
    await this.httpClient.post(
      `https://discord.com/api/v10/channels/${user.discordChannelId}/messages`,
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
  }
}
