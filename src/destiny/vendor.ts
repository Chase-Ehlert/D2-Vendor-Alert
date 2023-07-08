import { DatabaseRepository } from '../database/database-repository.js'
import { ManifestService } from '../services/manifest-service.js'
import { DestinyService } from '../services/destiny-service.js'
import { User } from '../database/models/user.js'

const destinyService = new DestinyService()
const databaseRepo = new DatabaseRepository()
const manifestService = new ManifestService(destinyService)

export class Vendor {
  /**
   * Collect mods for a specific vendor
   */
  async getVendorModInventory (user: User, vendorId: string): Promise<string[]> {
    const tokenInfo = await destinyService.getAccessToken(user.refreshToken)
    await databaseRepo.updateUserByMembershipId(
      tokenInfo.bungieMembershipId,
      tokenInfo.refreshTokenExpirationTime,
      tokenInfo.refreshToken
    )
    let vendorInventory

    if (tokenInfo.accessToken !== undefined) {
      const vendorInfo = await destinyService.getDestinyVendorInfo(user, tokenInfo.accessToken)

      for (const key in vendorInfo) {
        if (key === vendorId) {
          vendorInventory = vendorInfo[key].saleItems
        }
      }
    }

    return await manifestService.getItemFromManifest(19, vendorInventory)
  }

  /**
   * Collect mods for sale by Ada-1
   */
  async getProfileCollectibles (user: User): Promise<string[]> {
    const adaVendorId = '350061650'
    const collectibleId = 65
    const collectibleList: string[] = []

    await Promise.all([
      destinyService.getDestinyCollectibleInfo(user.destinyId),
      this.getVendorModInventory(user, adaVendorId)
    ]).then((values) => {
      const modsForSale = values[1].join(', ')
      console.log(`Ada has these mods for sale: ${modsForSale}`)
      values[1].forEach((key: string) => {
        if (values[0][key].state === collectibleId) {
          collectibleList.push(key)
        }
      })
    })

    return await manifestService.getCollectibleFromManifest(19, collectibleList)
  }
}
