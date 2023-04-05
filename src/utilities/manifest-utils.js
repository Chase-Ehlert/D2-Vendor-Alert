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

  const response = await axios.get(
    'https://www.bungie.net' + manifestFileName,
     {maxBodyLength: Infinity, maxContentLength: Infinity}
     )
    // .then(async data => {
      console.log('DOG')
      console.log(response)
      let jsonObject
      try {
        
        fs.createReadStream(response.data).on('data', (text) => {
          console.log(`Received ${text.length} bytes`)

          console.log(text)
        }).on('end', () => {
          console.log('stream has finished')
        }).on('error', (error) => {
          console.error('stream broke', error)
        })
        // readStream.on('data', (data) => {
        //   console.log(data)
        // })
        // readStream.on('end', () => {
        //   console.log('stream has finished')
        // })
        // readStream.on('error', (error) => {
        //   console.error('readstream broke', error)
        // })
        console.log('BLUE')
        response.data.toString('utf-8', (error, code) => {
          if (error) {
            console.error('failed parsing buffer', error)
          } else {
            console.log('parsed buffer', code)
          }
        })
        console.log('RED')
        jsonObject = JSON.parse(response.data.toString('utf8'))
        console.log(jsonObject)
      } catch (error) {
        console.log(error)
        throw error
      }
      inventoryNameList = await readItemsFromManifest(
        itemType,
        itemManifestFileName,
        inventoryNameList,
        itemList,
        // CHECKING THIS RESPONSE DATA PASS, RESET SERVER AND CHECK
        jsonObject.DestinyInventoryItemDefinition
      )
    // }
    // )
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

  await axios.get('https://www.bungie.net' + manifestFileName)
    .then(async data => {
      const newData = await data.json()
      inventoryNameList = await readCollectiblesFromManifest(
        itemType,
        itemManifestFileName,
        inventoryNameList,
        itemList,
        newData
      )
    }
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
    inventoryNameList = await writeFile(itemType, fileName, data.DestinyCollectibleDefinition, itemList, inventoryNameList, true)
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
