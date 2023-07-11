import * as fs from 'fs';
const fsPromises = fs.promises;
export class ManifestService {
    constructor(destinyService) {
        this.destinyService = destinyService;
    }
    /**
     * Collect names of mods for sale from the manifest
     */
    async getItemFromManifest(itemType, itemList) {
        const manifestFileName = await this.destinyService.getManifestFile();
        const destinyInventoryItemDefinition = await this.destinyService.getDestinyInventoryItemDefinition(manifestFileName);
        return await this.readItemsFromManifest(itemType, itemList, destinyInventoryItemDefinition);
    }
    /**
     * Compile list of mod names from manifest or create the manifest and then compile the list
     */
    async readItemsFromManifest(itemType, itemList, destinyInventoryItemDefinition) {
        try {
            await fsPromises.access('manifest-items.json', fs.constants.F_OK);
            return await this.readFile(itemType, 'manifest-items.json', itemList, false);
        }
        catch (error) {
            return await this.writeFile(itemType, 'manifest-items.json', destinyInventoryItemDefinition, itemList, false);
        }
    }
    /**
     * Get the manifest file and read the list of collectibles from it
     */
    async getCollectibleFromManifest(itemType, itemList) {
        const manifestFileName = await this.destinyService.getManifestFile();
        const newData = await this.destinyService.getDestinyInventoryItemDefinition(manifestFileName);
        return await this.readCollectiblesFromManifest(itemType, itemList, newData);
    }
    /**
     * Compile list of collectibles from Destiny's manifest or create the manifest and then compile the list
     */
    async readCollectiblesFromManifest(itemType, itemList, data) {
        try {
            await fsPromises.access('manifest-collectibles.json', fs.constants.F_OK);
            return await this.readFile(itemType, 'manifest-collectibles.json', itemList, true);
        }
        catch (error) {
            return await this.writeFile(itemType, 'manifest-collectibles.json', data, itemList, true);
        }
    }
    /**
     * Read manifest file for a list of names of collectibles or items
     */
    async readFile(itemType, fileName, itemList, collectible) {
        return await fsPromises.readFile(fileName)
            .then((fileContents) => {
            if (collectible) {
                return this.getCollectibleName(itemList, JSON.parse(String(fileContents)));
            }
            else {
                return this.getItemName(itemType, itemList, JSON.parse(String(fileContents)));
            }
        });
    }
    /**
     * Write manifest file and then read it for a list of names of collectibles or items
     */
    async writeFile(itemType, fileName, manifestData, itemList, collectible) {
        return await fsPromises.writeFile(fileName, JSON.stringify(manifestData))
            .then(() => {
            if (collectible) {
                return this.getCollectibleName(itemList, manifestData);
            }
            else {
                return this.getItemName(itemType, itemList, manifestData);
            }
        });
    }
    /**
     * Compile list of names for items on sale
     */
    getItemName(itemType, itemList, manifest) {
        const manifestKeys = Object.keys(manifest);
        const itemListValues = Object.values(itemList);
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
    getCollectibleName(itemList, manifest) {
        const itemNameList = [];
        const itemListKeys = Object.keys(itemList);
        const manifestKeys = Object.keys(manifest);
        for (let i = 0; i < manifestKeys.length; i++) {
            for (let j = 0; j < itemListKeys.length; j++) {
                if (manifestKeys[i] === itemListKeys[j]) {
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