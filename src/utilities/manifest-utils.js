import * as oldfs from 'fs'
import axios from 'axios'
import fs from 'fs'

const fsPromises = fs.promises

export async function getItemFromManifest(itemType, itemList) {
  let inventoryNameList = []
  const manifestFileName = await getManifestFile()
  const itemManifestFileName = 'manifest-items.json'
  console.log('ROBOT')
  console.log(manifestFileName)




  // const code = await axios.get('https://www.bungie.net' + manifestFileName,
  //   { maxBodyLength: Infinity, maxContentLength: Infinity, responseType: 'stream' }
  // )
  // await fsPromises.writeFile(itemManifestFileName,
  //    code.data)
  //    .catch((error) => {
  //   console.error('OH NO NO NO NO', error)
  // })

  // await fsPromises.readFile('manifest.json').then((contents) => {
  //   console.log(Object.keys(JSON.parse(contents).DestinyInventoryItemDefinition)[0])
  // })

  const code = await axios.get('https://www.bungie.net' + manifestFileName
  )
  // console.log(Object.keys(code.data.DestinyInventoryItemDefinition))
  // console.log(Object.keys(code.data.DestinyInventoryItemDefinition)[0])





  console.log('YOWZAASADFASDFASDFADS')



  // try {
  //   writeStream.on('open', async () => {
  //   }).on('end', () => {
  //     writeStream.end()
  //   })
  // } catch (error) {
  //   console.error('writing json failed', error)
  // }

  // try {
  //   fs.readFile('/root/workspaces/D2-Vendor-Alert/manifest.json', (error, data) => {
  //     console.log('READING FILE')
  //     if (error) throw error
  //     const jsonData = JSON.parse(data)
  //     const value = jsonData['DestinyInventoryItemDefinition']
  //     console.log(value)
  //   })
  // } catch (error) {
  //   console.error('reading manifest failed', error)
  // }

  console.log('DOG')
  inventoryNameList = await readItemsFromManifest(
    itemType,
    itemManifestFileName,
    inventoryNameList,
    itemList,
    code.data.DestinyInventoryItemDefinition
  )
  console.log('GIRAFFE')
  console.log(inventoryNameList)

  return inventoryNameList
}

async function readItemsFromManifest(itemType, fileName, inventoryNameList, itemList, data) {
  console.log('BATMAN')
  try {
    await fsPromises.access(fileName, oldfs.constants.F_OK)
    inventoryNameList = await readFile(itemType, fileName, itemList, inventoryNameList, false)
  } catch (error) {
    inventoryNameList = await writeFile(itemType, fileName, data, itemList, inventoryNameList, false)
  }
  return inventoryNameList
}

export async function getCollectibleFromManifest(itemType, itemList) {
  let inventoryNameList = []
  const manifestFileName = await getManifestFile()
  console.log('ZEBRA')
  console.log(manifestFileName)
  const itemManifestFileName = 'manifest-collectibles.json'

  const newData = await axios.get('https://www.bungie.net' + manifestFileName)
  inventoryNameList = await readCollectiblesFromManifest(
    itemType,
    itemManifestFileName,
    inventoryNameList,
    itemList,
    newData
  )
  console.log('LION')
  console.log(inventoryNameList)

  return inventoryNameList
}

async function readCollectiblesFromManifest(itemType, fileName, inventoryNameList, itemList, data) {
  try {
    await fsPromises.access(fileName, oldfs.constants.F_OK)
    inventoryNameList = await readFile(itemType, fileName, itemList, inventoryNameList, true)
  } catch (error) {
    inventoryNameList = await writeFile(itemType, fileName, data.data.DestinyCollectibleDefinition, itemList, inventoryNameList, true)
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
