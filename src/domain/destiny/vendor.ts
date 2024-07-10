import { UserInterface } from '../user/user.js'
import { Mod } from './mod.js'
import { DestinyService } from './destiny-client.js'

export class Vendor {
  constructor (private readonly destinyService: DestinyService) { }

  /**
   * Collect mods for sale by Ada-1 that are not owned by the user
   */
  async getUnownedModsForSaleByAda (user: UserInterface): Promise<string[]> {
    const ownedModHashIds = await this.destinyService.getCollectibleInfo(user.destinyId)
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
    const adaMerchandise = await this.destinyService.getVendorInfo(
      user.destinyId,
      user.destinyCharacterId,
      user.refreshToken
    )

    const equippableMods = await this.destinyService.getDestinyEquippableMods()
    const unownedModHashes = adaMerchandise.filter(
      (itemHash) =>
        equippableMods.some((mod) => mod.hash === itemHash)
    )
    const unownedEquippableModsFromAda = equippableMods.filter((mod) => unownedModHashes.includes(mod.hash))

    return unownedEquippableModsFromAda
  }
}
