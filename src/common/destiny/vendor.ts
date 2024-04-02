import logger from '../utility/logger.js'
import { ManifestService } from '../services/manifest-service.js'
import { UserInterface } from '../database/models/user.js'
import { Mod } from '../services/models/mod.js'
import { DestinyApiClient } from './destiny-api-client.js'

export class Vendor {
  constructor (
    private readonly destinyApiClient: DestinyApiClient,
    private readonly manifestService: ManifestService
  ) { }

  /**
   * Collect mods for sale by Ada-1 that are not owned by the user
   */
  async getUnownedModsForSaleByAda (user: UserInterface): Promise<string[]> {
    try {
      const unownedMods = await this.destinyApiClient.getCollectibleInfo(user.destinyId)
      const modsForSaleByAda = await this.getModsForSaleByAda(user)
      const unownedModsForSaleByAda = modsForSaleByAda.filter(mod => !unownedMods.includes(mod.itemHash))

      return unownedModsForSaleByAda.map(mod => mod.displayPropertyName)
    } catch (error) {
      logger.error(error)
      throw new Error('Problem with retreiving the collectibles for sale from Ada')
    }
  }

  /**
   * Collect mod info of merchandise for sale by Ada
   */
  private async getModsForSaleByAda (user: UserInterface): Promise<Mod[]> {
    try {
      const adaMerchandise = await this.destinyApiClient.getVendorInfo(user.destinyId, user.destinyCharacterId, user.refreshToken)

      return await this.manifestService.getModInfoFromManifest(adaMerchandise)
    } catch (error) {
      logger.error(error)
      throw new Error('Problem with retreiving vendor mod inventory')
    }
  }
}
