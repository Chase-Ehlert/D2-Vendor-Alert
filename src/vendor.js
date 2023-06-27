// @ts-check

import DestinyService from './services/destiny-service.js'
import DatabaseRepository from './database/database-repository.js'
import ManifestService from './services/manifest-service.js'

const destinyService = new DestinyService()
const databaseRepo = new DatabaseRepository()
const manifestService = new ManifestService()

class Vendor {
  constructor(){}

  /**
   * Collect mods for a specific vendor
   * @param {Object} user User profile information
   * @param {string} vendorId Id of vendor
   * @returns {Promise<Array<string>>} List of mods for sale
   */
  async getVendorModInventory(user, vendorId) {
    const tokenInfo = await destinyService.getAccessToken(Object(user).refresh_token)
    await databaseRepo.updateUser(
      tokenInfo.bungieMembershipId,
      tokenInfo.refreshTokenExpirationTime,
      tokenInfo.refreshToken
    )

    const vendorInfo = await destinyService.getDestinyVendorInfo(user, tokenInfo.accessToken)
    let vendorInventory

    for (let key in vendorInfo) {
      if (key === vendorId) {
        vendorInventory = vendorInfo[key].saleItems
      }
    }

    return await manifestService.getItemFromManifest(19, vendorInventory)
  }

  /**
   * Collect mods for sale by Banshee-44 and Ada-1
   * @param {Object} user User information
   * @returns {Promise<Array>} List of mods
   */
  async getProfileCollectibles(user) {
    const adaVendorId = '350061650'
    const collectibleId = 65
    const collectibleList = []

    await Promise.all([
      destinyService.getDestinyCollectibleInfo(user.destiny_id),
      this.getVendorModInventory(user, adaVendorId)
    ]).then((values) => {
      console.log(`Ada has these mods for sale: ${values[1]}`)
      values[1].forEach(key => {
        if (values[0][key].state === collectibleId) {
          collectibleList.push(key)
        }
      })
    })

    return await manifestService.getCollectibleFromManifest(19, collectibleList)
  }
}

export default Vendor
