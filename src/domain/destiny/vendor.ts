import { DestinyClient } from '../../infrastructure/destiny/destiny-client.js'
import { UserInterface } from '../user/user.js'
import { Mod } from './mod.js'

export class Vendor {
  constructor (private readonly destinyClient: DestinyClient) { }

  /**
   * Collect mods for sale by Ada-1 that are not owned by the user
   */
  async getUnownedMods (user: UserInterface): Promise<string[]> {
    const unownedModHashes = await this.destinyClient.getUnownedModIds(user.destinyId)
    const modsForSaleByAda = await this.getModsForSaleByAda(user)
    const unownedMods = modsForSaleByAda.filter((mod) => {
      return !unownedModHashes.includes(mod.hash)
    })

    return unownedMods.map((mod) => mod.displayProperties.name)
  }

  /**
   * Collect mod info of merchandise for sale by Ada
   */
  private async getModsForSaleByAda (user: UserInterface): Promise<Mod[]> {
    const equippableMods = await this.destinyClient.getEquippableMods()
    const unownedModHashesFromAda = await this.getUnownedModHashesFromAda(user, equippableMods)
    const unownedEquippableModsFromAda = equippableMods.filter((mod) => unownedModHashesFromAda.includes(mod.hash))

    return unownedEquippableModsFromAda
  }

  private async getUnownedModHashesFromAda (user: UserInterface, equippableMods: Mod[]): Promise<string[]> {
    const adaVendorId = '350061650'
    const vendorMerchandise = await this.destinyClient.getVendorMerchandise(
      user.destinyId,
      user.destinyCharacterId,
      user.refreshToken
    )
    const equippableModHashes = equippableMods.map((mod) => mod.hash)

    const adaMerchandiseHashes = this.destinyClient.getAdaMerchandiseHashes(adaVendorId, vendorMerchandise)
    return adaMerchandiseHashes.filter(
      (itemHash) => {
        return equippableModHashes.includes(itemHash)
      }
    )
  }
}
