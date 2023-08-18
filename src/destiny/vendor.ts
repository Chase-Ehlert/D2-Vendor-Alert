import logger from '../utility/logger.js'
import { ManifestService } from '../services/manifest-service.js'
import { DestinyService } from '../services/destiny-service.js'
import { UserInterface } from '../database/models/user.js'
import { UserRepository } from '../database/user-repository.js'

export class Vendor {
  constructor (
    private readonly destinyService: DestinyService,
    private readonly database: UserRepository,
    private readonly manifestService: ManifestService
  ) { }

  /**
   * Collect mods for sale by Ada-1
   */
  async getCollectiblesForSaleByAda (user: UserInterface): Promise<string[]> {
    const adaVendorId = '350061650'
    const collectibleId = 65
    const collectibleList: string[] = []

    try {
      const vendorModInventory = await this.getVendorModInventory(user, adaVendorId)
      const collectibleInfo = await this.destinyService.getDestinyCollectibleInfo(user.destinyId)

      vendorModInventory.forEach(mod => {
        if (collectibleInfo[mod].state === collectibleId) {
          collectibleList.push(mod)
        }
      })
      return await this.manifestService.getCollectiblesFromManifest(19, collectibleList)
    } catch (error) {
      logger.error(error)
      throw new Error('Problem with retreiving the collectibles for sale from Ada')
    }
  }

  /**
   * Collect mods for a specific vendor
   */
  private async getVendorModInventory (user: UserInterface, vendorId: string): Promise<string[]> {
    const tokenInfo = await this.destinyService.getAccessToken(user.refreshToken)
    try {
      await this.database.updateUserByMembershipId(
        tokenInfo.bungieMembershipId,
        tokenInfo.refreshTokenExpirationTime,
        tokenInfo.refreshToken
      )
      let vendorInventory

      const vendorInfo = await this.destinyService.getDestinyVendorInfo(user, tokenInfo.accessToken)

      for (const key in vendorInfo) {
        if (key === vendorId) {
          vendorInventory = vendorInfo[key].saleItems
        }
      }

      return await this.manifestService.getItemsFromManifest(19, vendorInventory)
    } catch (error) {
      logger.error(error)
      throw new Error('Problem with retreiving vendor mod inventory')
    }
  }
}
