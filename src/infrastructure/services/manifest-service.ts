import { DestinyApiClient } from '../destiny/destiny-api-client.js'
import { Mod } from '../../domain/mod.js'

export class ManifestService {
  constructor (private readonly destinyApiClient: DestinyApiClient) { }

  /**
   * Collect info (name and hashId) of mods from the manifest
   */
  async getModInfoFromManifest (itemHashes: string[]): Promise<Mod[]> {
    const destinyInventoryModDescriptions = await this.destinyApiClient.getDestinyInventoryItemDefinition()
    const unownedMods = itemHashes.filter(item => destinyInventoryModDescriptions.has(item))

    const unownedModInfo = unownedMods.map(item => {
      const modName = destinyInventoryModDescriptions.get(item)
      if (modName !== undefined) {
        return new Mod(item, modName)
      }
    })

    return unownedModInfo.filter((item): item is Mod => item !== undefined)
  }
}
