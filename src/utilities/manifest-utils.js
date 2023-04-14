import * as oldfs from 'fs'
import axios from 'axios'
import fs from 'fs'

const fsPromises = fs.promises

export async function getItemFromManifest(itemType, itemList) {
  let inventoryNameList = []
  const manifestFileName = await getManifestFile()
  const code = await axios.get('https://www.bungie.net' + manifestFileName)

  inventoryNameList = await readItemsFromManifest(
    itemType,
    inventoryNameList,
    itemList,
    code.data.DestinyInventoryItemDefinition
  )

  return inventoryNameList
}

async function readItemsFromManifest(itemType, inventoryNameList, itemList, data) {
  try {
    await fsPromises.access('manifest-items.json', oldfs.constants.F_OK)
    inventoryNameList = await readFile(itemType, 'manifest-items.json', itemList, inventoryNameList, false)
  } catch (error) {
    inventoryNameList = await writeFile(itemType, 'manifest-items.json', data, itemList, inventoryNameList, false)
  }
  return inventoryNameList
}

export async function getCollectibleFromManifest(itemType, itemList) {
  let inventoryNameList = []
  const manifestFileName = await getManifestFile()

  const newData = await axios.get('https://www.bungie.net' + manifestFileName)
  inventoryNameList = await readCollectiblesFromManifest(
    itemType,
    inventoryNameList,
    itemList,
    newData
  )

  return inventoryNameList
}

async function readCollectiblesFromManifest(itemType, inventoryNameList, itemList, data) {
  try {
    await fsPromises.access('manifest-collectibles.json', oldfs.constants.F_OK)
    inventoryNameList = await readFile(itemType, 'manifest-collectibles.json', itemList, inventoryNameList, true)
  } catch (error) {
    inventoryNameList = await writeFile(itemType, 'manifest-collectibles.json', data.data.DestinyCollectibleDefinition, itemList, inventoryNameList, true)
  }
  return inventoryNameList
}

async function getManifestFile() {
  const manifest = await axios.get('https://www.bungie.net/Platform/Destiny2/Manifest/', {
    headers: {
      'X-API-Key': `${process.env.DESTINY_API_KEY}`
    }
  })

  return manifest.data.Response.jsonWorldContentPaths.en
}

async function readFile(itemType, fileName, itemList, inventoryNameList, collectible) {
  await fsPromises.readFile(fileName)
    .then((fileContents) => {
      if (collectible) {
        inventoryNameList = getCollectibleName(itemList, JSON.parse(fileContents))
      } else {
        inventoryNameList = getItemName(itemType, itemList, JSON.parse(fileContents))
      }
    })
    .catch((error) => {
      console.log('Error reading file!')
      throw (error)
    })

  return inventoryNameList
}

async function writeFile(itemType, fileName, manifestData, itemList, inventoryNameList, collectible) {
  await fsPromises.writeFile(fileName, JSON.stringify(manifestData))
    .then(() => {
      if (collectible) {
        inventoryNameList = getCollectibleName(itemList, manifestData)
      } else {
        inventoryNameList = getItemName(itemType, itemList, manifestData)
      }
    })
    .catch((error) => {
      console.log('Error while writing!')
      throw (error)
    })

  return inventoryNameList
}

function getItemName(itemType, inventoryItemList, manifest) {
  const manifestKeys = Object.keys(manifest)
  const itemListValues = Object.values(inventoryItemList)
  const itemHashList = []
  let itemNameList = []

  itemListValues.forEach(item => {
    itemHashList.push(item.itemHash)
  })

  for (let i = 0; i < manifestKeys.length; i++) {
    if (canManifestItemBeAdded(itemType, itemHashList, manifest, manifestKeys, i, itemNameList)) {
      itemNameList.push(manifest[manifestKeys[i]].collectibleHash)
    }
  }

  return itemNameList
}

function getCollectibleName(inventoryItemList, manifest) {
  let itemNameList = []
  const manifestKeys = Object.keys(manifest)

  for (let i = 0; i < manifestKeys.length; i++) {
    for (const item of inventoryItemList) {
      if (manifestKeys[i] == item) {
        itemNameList.push(manifest[manifestKeys[i]].displayProperties.name)
      }
    }
  }

  return itemNameList
}

function canManifestItemBeAdded(itemType, itemHashList, manifest, manifestKeys, index, itemNameList) {
  return itemHashList.includes(manifest[manifestKeys[index]].hash) &&
    manifest[manifestKeys[index]].itemType == itemType &&
    !itemNameList.includes(manifest[manifestKeys[index]].collectibleHash)
}

export async function getAggregatedManifestFile() {
  const manifestFileName = await getManifestFile()
  const aggregateFileName = manifestFileName.split('/')[5]

  await axios.get('https://www.bungie.net' + manifestFileName)
    .then(response => response.json())
    .then(async data => {
      await fsPromises.writeFile(aggregateFileName, JSON.stringify(data))
        .catch((error) => {
          console.log('Error while writing the aggregated manifest file!')
          throw (error)
        })
    })
}
