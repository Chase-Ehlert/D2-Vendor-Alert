import { MongoUserRepository } from '../database/mongo-user-repository.js'
import { ManifestService } from '../services/manifest-service.js'
import { DestinyService } from '../services/destiny-service.js'
import { UserInterface } from '../database/models/user.js'
import logger from '../utility/logger.js'

export class Vendor {
  public destinyService
  public mongoUserRepo
  public manifestService

  constructor (
    destinyService: DestinyService,
    mongoUserRepo: MongoUserRepository,
    manifestService: ManifestService
  ) {
    this.destinyService = destinyService
    this.mongoUserRepo = mongoUserRepo
    this.manifestService = manifestService
  }

  /**
   * Collect mods for sale by Ada-1
   */
  async getProfileCollectibles (user: UserInterface): Promise<string[] | undefined> {
    const adaVendorId = '350061650'
    const collectibleId = 65
    const collectibleList: string[] = []

    return await Promise.all([
      this.destinyService.getDestinyCollectibleInfo(user.destinyId),
      this.getVendorModInventory(user, adaVendorId)
    ]).then(async (values) => {
      if (values[1] !== undefined) {
        values[1].forEach((key: string) => {
          if (values[0][key].state === collectibleId) {
            collectibleList.push(key)
          }
        })
        return await this.manifestService.getCollectibleFromManifest(19, collectibleList)
      }
    }).catch(async (error) => {
      logger.error(error)
      return await Promise.reject(error)
    })
  }

  /**
   * Collect mods for a specific vendor
   */
  private async getVendorModInventory (user: UserInterface, vendorId: string): Promise<string[] | undefined> {
    const tokenInfo = await this.destinyService.getAccessToken(user.refreshToken)
    if (tokenInfo?.accessToken !== undefined) {
      await this.mongoUserRepo.updateUserByMembershipId(
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

      return await this.manifestService.getItemFromManifest(19, vendorInventory)
    } else {
      logger.error('Missing access token for retreiving vendor mod inventory.')
      return await Promise.reject(new Error('Missing access token'))
    }
  }
}
