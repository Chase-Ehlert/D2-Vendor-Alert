import * as fs from 'fs';
import { DestinyService } from './destiny-service.js';
const destinyService = new DestinyService();
const fsPromises = fs.promises;
export class ManifestService {
    /**
     * Collect names of mods for sale from the manifest
     */
    async getItemFromManifest(itemType, itemList) {
        let inventoryNameList = [];
        const manifestFileName = await destinyService.getManifestFile();
        const destinyInventoryItemDefinition = await destinyService.getDestinyInventoryItemDefinition(manifestFileName);
        inventoryNameList = await this.readItemsFromManifest(itemType, inventoryNameList, itemList, destinyInventoryItemDefinition);
        return inventoryNameList;
    }
    /**
     * Compile list of mod names from manifest or create the manifest and then compile the list
     */
    async readItemsFromManifest(itemType, inventoryNameList, itemList, destinyInventoryItemDefinition) {
        try {
            await fsPromises.access('manifest-items.json', fs.constants.F_OK);
            inventoryNameList = await this.readFile(itemType, 'manifest-items.json', itemList, inventoryNameList, false);
        }
        catch (error) {
            inventoryNameList = await this.writeFile(itemType, 'manifest-items.json', destinyInventoryItemDefinition, itemList, inventoryNameList, false);
        }
        return inventoryNameList;
    }
    /**
     * Get the manifest file and read the list of collectibles from it
     */
    async getCollectibleFromManifest(itemType, itemList) {
        let inventoryNameList = [];
        const manifestFileName = await destinyService.getManifestFile();
        const newData = await destinyService.getDestinyInventoryItemDefinition(manifestFileName);
        inventoryNameList = await this.readCollectiblesFromManifest(itemType, inventoryNameList, itemList, newData);
        return inventoryNameList;
    }
    /**
     * Compile list of collectibles from Destiny's manifest or create the manifest and then compile the list
     */
    async readCollectiblesFromManifest(itemType, inventoryNameList, itemList, data) {
        try {
            await fsPromises.access('manifest-collectibles.json', fs.constants.F_OK);
            inventoryNameList = await this.readFile(itemType, 'manifest-collectibles.json', itemList, inventoryNameList, true);
        }
        catch (error) {
            inventoryNameList = await this.writeFile(itemType, 'manifest-collectibles.json', data.data.DestinyCollectibleDefinition, itemList, inventoryNameList, true);
        }
        return inventoryNameList;
    }
    /**
     * Read manifest file for a list of names of collectibles or items
     */
    async readFile(itemType, fileName, itemList, inventoryNameList, collectible) {
        await fsPromises.readFile(fileName)
            .then((fileContents) => {
            if (collectible) {
                inventoryNameList = this.getCollectibleName(itemList, JSON.parse(String(fileContents)));
            }
            else {
                inventoryNameList = this.getItemName(itemType, itemList, JSON.parse(String(fileContents)));
            }
        })
            .catch((error) => {
            console.log('Error reading file!');
            throw error;
        });
        return inventoryNameList;
    }
    /**
     * Write manifest file and then read it for a list of names of collectibles or items
     */
    async writeFile(itemType, fileName, manifestData, itemList, inventoryNameList, collectible) {
        await fsPromises.writeFile(fileName, JSON.stringify(manifestData))
            .then(() => {
            if (collectible) {
                inventoryNameList = this.getCollectibleName(itemList, manifestData);
            }
            else {
                inventoryNameList = this.getItemName(itemType, itemList, manifestData);
            }
        })
            .catch((error) => {
            console.log('Error while writing!');
            throw error;
        });
        return inventoryNameList;
    }
    /**
     * Compile list of names for items on sale
     */
    getItemName(itemType, inventoryItemList, manifest) {
        const manifestKeys = Object.keys(manifest);
        const itemListValues = Object.values(inventoryItemList);
        const itemHashList = [];
        const itemNameList = [];
        itemListValues.forEach(item => {
            itemHashList.push(Object(item).itemHash);
        });
        for (let i = 0; i < manifestKeys.length; i++) {
            if (this.canManifestItemBeAdded(itemType, itemHashList, manifest, manifestKeys, i, itemNameList)) {
                if (manifest[manifestKeys[i]].collectibleHash !== undefined) {
                    itemNameList.push(manifest[manifestKeys[i]].collectibleHash);
                }
            }
        }
        return itemNameList;
    }
    /**
     * Compile list of names for collectibles on sale
     */
    getCollectibleName(inventoryItemList, manifest) {
        const itemNameList = [];
        const manifestKeys = Object.keys(manifest);
        for (let i = 0; i < manifestKeys.length; i++) {
            for (const item of inventoryItemList) {
                if (manifestKeys[i] === item) {
                    itemNameList.push(manifest[manifestKeys[i]].displayProperties.name);
                }
            }
        }
        return itemNameList;
    }
    /**
     * Check whether an item from the manifest is for sale or not
     */
    canManifestItemBeAdded(itemType, itemHashList, manifest, manifestKeys, index, itemNameList) {
        return itemHashList.includes(manifest[manifestKeys[index]].hash) &&
            manifest[manifestKeys[index]].itemType === itemType &&
            !itemNameList.includes(manifest[manifestKeys[index]].collectibleHash);
    }
}
//# sourceMappingURL=manifest-service.js.map