import { DestinyClient } from '../../infrastructure/destiny/destiny-client.js'
import { UserInterface } from '../user/user.js'
import { Mod } from './mod.js'

export class Vendor {
  constructor (private readonly destinyClient: DestinyClient) { }

  /**
   * Collect mods for sale by Ada-1 that are not owned by the user
   */
  async getUnownedMods (user: UserInterface): Promise<string[]> {
    const unownedModIds = await this.destinyClient.getUnownedModIds(user.destinyId)
    const modsForSaleByAda = await this.getModsForSaleByAda(user)
    const unownedMods = modsForSaleByAda.filter((mod) => {
      return !unownedModIds.includes(mod.id)
    })

    return unownedMods.map((mod) => mod.displayProperties.name)
  }

  /**
   * Collect mod info of merchandise for sale by Ada
   */
  private async getModsForSaleByAda (user: UserInterface): Promise<Mod[]> {
    const adaVendorId = '350061650'
    const vendorMerchandise = await this.destinyClient.getVendorMerchandise(
      user.destinyId,
      user.destinyCharacterId,
      user.refreshToken
    )
    const adaMerchandiseIds = this.destinyClient.getAdaMerchandiseIds(adaVendorId, vendorMerchandise)
    const equippableMods = await this.destinyClient.getEquippableMods()
    const unownedModIds = adaMerchandiseIds.filter(
      (itemId) =>
        equippableMods.some((mod) => mod.id === itemId)
    )
    const unownedEquippableModsFromAda = equippableMods.filter((mod) => unownedModIds.includes(mod.id))

    return unownedEquippableModsFromAda
  }
}
