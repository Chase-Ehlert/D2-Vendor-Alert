import { UserInterface } from '../persistence/user.js'
import { Mod } from './mod.js'
import { DestinyClient } from './destiny-client.js'

export class Vendor {
  constructor (private readonly destinyClient: DestinyClient) { }

  /**
   * Collect mods for sale by Ada-1 that are not owned by the user
   */
  async getUnownedModsForSaleByAda (user: UserInterface): Promise<string[]> {
    const ownedModHashIds = await this.destinyClient.getCollectibleInfo(user.destinyId)
    const modsForSaleByAda = await this.getModsForSaleByAda(user)
    const unownedModsForSaleByAda = modsForSaleByAda.filter((mod) => {
      return !ownedModHashIds.includes(mod.hash)
    })

    return unownedModsForSaleByAda.map((mod) => mod.displayProperties.name)
  }

  /**
   * Collect mod info of merchandise for sale by Ada
   */
  private async getModsForSaleByAda (user: UserInterface): Promise<Mod[]> {
    const adaMerchandise = await this.destinyClient.getVendorInfo(
      user.destinyId,
      user.destinyCharacterId,
      user.refreshToken
    )

    const equippableMods = await this.destinyClient.getDestinyEquippableMods()
    const unownedModHashes = adaMerchandise.filter(
      (itemHash) =>
        equippableMods.some((mod) => mod.hash === itemHash)
    )
    const unownedEquippableModsFromAda = equippableMods.filter((mod) => unownedModHashes.includes(mod.hash))

    return unownedEquippableModsFromAda
  }
}
