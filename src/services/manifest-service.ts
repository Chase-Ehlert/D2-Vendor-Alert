import * as fs from 'fs'
import { DestinyService } from './destiny-service.js'
import logger from '../utility/logger.js'

export class ManifestService {
  private readonly fsPromises = fs.promises

  constructor (private readonly destinyService: DestinyService) { }

  /**
   * Collect names of mods for sale from the manifest
   */
  async getItemsFromManifest (itemType: number, itemList: Object): Promise<string[]> {
    const destinyInventoryItemDefinition = await this.destinyService.getDestinyInventoryItemDefinition()

    return this.readItemsFromManifest(
      itemType,
      itemList,
      destinyInventoryItemDefinition
    )
  }

  /**
   * Compile list of mod names from manifest or create the manifest and then compile the list
   */
  private async readItemsFromManifest (
    itemType: number,
    itemList: Object,
    destinyInventoryItemDefinition: Object
  ): Promise<string[]> {
    try {
      await this.fsPromises.access('manifest-items.json', fs.constants.F_OK)
      return await this.readFile(itemType, 'manifest-items.json', itemList, false)
    } catch (error) {
      return await this.writeFile(itemType, 'manifest-items.json', destinyInventoryItemDefinition, itemList, false)
    }
  }

  /**
   * Get the manifest file and read the list of collectibles from it
   */
  async getCollectiblesFromManifest (itemType: number, itemList: Object): Promise<string[]> {
    const newData = await this.destinyService.getDestinyInventoryItemDefinition()

    return this.readCollectiblesFromManifest(itemType, itemList, newData)
  }

  /**
   * Compile list of collectibles from Destiny's manifest or create the manifest and then compile the list
   */
  private async readCollectiblesFromManifest (itemType: number, itemList: Object, data: any): Promise<string[]> {
    try {
      await this.fsPromises.access('manifest-collectibles.json', fs.constants.F_OK)
      return await this.readFile(
        itemType,
        'manifest-collectibles.json',
        itemList,
        true
      )
    } catch (error) {
      return await this.writeFile(
        itemType,
        'manifest-collectibles.json',
        data,
        itemList,
        true
      )
    }
  }

  /**
   * Read manifest file for a list of names of collectibles or items
   */
  private async readFile (itemType: number, fileName: string, itemList: Object, collectible: boolean): Promise<string[]> {
    try {
      const fileContents = await this.fsPromises.readFile(fileName)
      if (collectible) {
        return this.getCollectibleNames(itemList, JSON.parse(String(fileContents)))
      } else {
        return this.getItemNames(itemType, itemList, JSON.parse(String(fileContents)))
      }
    } catch (error) {
      logger.error(error)
      throw new Error('Problem with reading file')
    }
  }

  /**
   * Write manifest file and then read it for a list of names of collectibles or items
   */
  private async writeFile (itemType: number, fileName: string, manifestData: Object, itemList: Object, collectible: boolean): Promise<string[]> {
    try {
      await this.fsPromises.writeFile(fileName, JSON.stringify(manifestData))
    } catch (error) {
      logger.error(error)
      throw new Error('Problem with writing file')
    }

    if (collectible) {
      return this.getCollectibleNames(itemList, manifestData)
    } else {
      return this.getItemNames(itemType, itemList, manifestData)
    }
  }

  /**
   * Compile list of names for items on sale
   */
  private getItemNames (itemType: number, itemList: Object, manifest: any): string[] {
    const manifestKeys = Object.keys(manifest)
    const itemListValues = Object.values(itemList)
    const itemHashList: string[] = []
    const itemNameList = []

    itemListValues.forEach(item => {
      itemHashList.push(Object(item).itemHash)
    })

    for (let i = 0; i < manifestKeys.length; i++) {
      if (this.canManifestItemBeAdded(itemType, itemHashList, manifest, manifestKeys, i, itemNameList) &&
        manifest[manifestKeys[i]].collectibleHash !== undefined
      ) {
        itemNameList.push(manifest[manifestKeys[i]].collectibleHash)
      }
    }

    return itemNameList
  }

  /**
   * Compile list of names for collectibles on sale
   */
  private getCollectibleNames (itemList: Object, manifest: any): string[] {
    const itemNameList = []
    const itemListKeys = Object.keys(itemList)
    const manifestKeys = Object.keys(manifest)

    for (let i = 0; i < manifestKeys.length; i++) {
      for (let j = 0; j < itemListKeys.length; j++) {
        if (manifestKeys[i] === itemListKeys[j]) {
          itemNameList.push(manifest[manifestKeys[i]].displayProperties.name)
        }
      }
    }

    return itemNameList
  }

  /**
   * Check whether an item from the manifest is for sale or not
   */
  private canManifestItemBeAdded (
    itemType: number,
    itemHashList: string[],
    manifest: any,
    manifestKeys: string[],
    index: number,
    itemNameList: string[]
  ): boolean {
    return itemHashList.includes(manifest[manifestKeys[index]].hash) &&
      manifest[manifestKeys[index]].itemType === itemType &&
      !itemNameList.includes(manifest[manifestKeys[index]].collectibleHash)
  }
}
