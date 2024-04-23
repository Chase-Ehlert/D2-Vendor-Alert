import { ManifestService } from '../services/manifest-service'
import { UserInterface } from '../../domain/user'
import { Mod } from '../../domain/mod'
import { DestinyApiClient } from './destiny-api-client'

export class Vendor {
  constructor (
    private readonly destinyApiClient: DestinyApiClient,
    private readonly manifestService: ManifestService
  ) { }

  /**
   * Collect mods for sale by Ada-1 that are not owned by the user
   */
  async getUnownedModsForSaleByAda (user: UserInterface): Promise<string[]> {
    const unownedMods = await this.destinyApiClient.getCollectibleInfo(user.destinyId)
    const modsForSaleByAda = await this.getModsForSaleByAda(user)
    const unownedModsForSaleByAda = modsForSaleByAda.filter(mod => !unownedMods.includes(mod.itemHash))

    return unownedModsForSaleByAda.map(mod => mod.displayPropertyName)
  }

  /**
   * Collect mod info of merchandise for sale by Ada
   */
  private async getModsForSaleByAda (user: UserInterface): Promise<Mod[]> {
    const adaMerchandise = await this.destinyApiClient.getVendorInfo(user.destinyId, user.destinyCharacterId, user.refreshToken)

    return this.manifestService.getModInfoFromManifest(adaMerchandise)
  }
}
