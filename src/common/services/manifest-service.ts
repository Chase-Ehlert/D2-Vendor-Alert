import { DestinyApiClient } from '../destiny/destiny-api-client.js'
import { Mod } from './models/mod.js'

export class ManifestService {
  constructor (private readonly destinyApiClient: DestinyApiClient) { }

  /**
   * Collect info (name and hashId) of mods from the manifest
   */
  async getModInfoFromManifest (itemHashes: Mod[]): Promise<Mod[]> {
    const destinyInventoryModDescriptions = await this.destinyApiClient.getDestinyInventoryItemDefinition()
    const unownedMods = itemHashes.filter(item => destinyInventoryModDescriptions.has(item.itemHash))
    const unownedModInfo = unownedMods.map(item => {
      const modName = destinyInventoryModDescriptions.get(item.itemHash)
      if (modName !== undefined) {
        return new Mod(item.itemHash, modName)
      }
    })
    const legitmateUnownedModInfo = unownedModInfo.filter((item): item is Mod => item !== undefined)

    return legitmateUnownedModInfo
  }
}
