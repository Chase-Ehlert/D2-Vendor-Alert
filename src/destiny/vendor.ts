import { MongoUserRepository } from '../database/mongo-user-repository.js'
import { ManifestService } from '../services/manifest-service.js'
import { DestinyService } from '../services/destiny-service.js'
import { UserInterface } from '../database/models/user.js'

export class Vendor {
  public destinyService
  public userRepo
  public manifestService

  constructor (destinyService: DestinyService, userRepo: MongoUserRepository, manifestService: ManifestService) {
    this.destinyService = destinyService
    this.userRepo = userRepo
    this.manifestService = manifestService
  }

  /**
   * Collect mods for sale by Ada-1
   */
  async getProfileCollectibles (user: UserInterface): Promise<string[]> {
    const adaVendorId = '350061650'
    const collectibleId = 65
    const collectibleList: string[] = []

    await Promise.all([
      this.destinyService.getDestinyCollectibleInfo(user.destinyId),
      this.getVendorModInventory(user, adaVendorId)
    ]).then((values) => {
      values[1].forEach((key: string) => {
        if (values[0][key].state === collectibleId) {
          collectibleList.push(key)
        }
      })
    })

    return await this.manifestService.getCollectibleFromManifest(19, collectibleList)
  }

  /**
   * Collect mods for a specific vendor
   */
  private async getVendorModInventory (user: UserInterface, vendorId: string): Promise<string[]> {
    const tokenInfo = await this.destinyService.getAccessToken(user.refreshToken)
    await this.userRepo.updateUserByMembershipId(
      tokenInfo.bungieMembershipId,
      tokenInfo.refreshTokenExpirationTime,
      tokenInfo.refreshToken
    )
    let vendorInventory

    if (tokenInfo.accessToken !== undefined) {
      const vendorInfo = await this.destinyService.getDestinyVendorInfo(user, tokenInfo.accessToken)

      for (const key in vendorInfo) {
        if (key === vendorId) {
          vendorInventory = vendorInfo[key].saleItems
        }
      }

      return await this.manifestService.getItemFromManifest(19, vendorInventory)
    } else {
      throw Error('Missing access token for retreiving vendor mod inventory.')
    }
  }
}
