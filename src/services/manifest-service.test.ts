import { DestinyApiClient } from '../destiny/destiny-api-client'
import { AxiosHttpClient } from '../utility/axios-http-client'
import { DestinyService } from './destiny-service'
import { ManifestService } from './manifest-service'
import fs from 'fs'

jest.mock('./../utility/url', () => {
  return 'example'
})

describe('<ManifestService/>', () => {
  const destinyService = new DestinyService(new DestinyApiClient(new AxiosHttpClient()))
  const manifestService = new ManifestService(destinyService)

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should instantiate', () => {
    expect(manifestService).not.toBeNull()
  })

  it('should return a list of item names from the read manifest', async () => {
    const getDestinyInventoryItemDefinitionMock = jest.spyOn(destinyService, 'getDestinyInventoryItemDefinition').mockResolvedValue({})
    const itemList = { item1: { itemHash: '123' }, item2: { itemHash: '321' } }
    const expectedManifest = '{ "item1": { "hash": "123", "itemType": 1, "collectibleHash": "456" }, "item2": { "hash": "321", "itemType": 1, "collectibleHash": "654" }}'
    const expectedItemNameList = ['456', '654']
    fs.promises.access = jest.fn().mockImplementation(async () => await Promise.resolve())
    fs.promises.readFile = jest.fn().mockImplementation(async () => await Promise.resolve(expectedManifest))

    const result = await manifestService.getItemsFromManifest(1, itemList)

    expect(getDestinyInventoryItemDefinitionMock).toHaveBeenCalled()
    expect(fs.promises.readFile).toHaveBeenCalledWith('manifest-items.json')
    expect(result).toEqual(expectedItemNameList)
  })

  it('should return a list of item names from the written manifest', async () => {
    const expectedManifest = {
      item1: { hash: 123, itemType: 1, collectibleHash: 456 },
      item2: { hash: 321, itemType: 1, collectibleHash: 654 }
    }
    const itemList = { item1: { itemHash: 123 }, item2: { itemHash: 321 } }
    const expectedItemNameList = [456, 654]

    jest.spyOn(destinyService, 'getDestinyInventoryItemDefinition').mockResolvedValue(expectedManifest)
    fs.promises.access = jest.fn().mockImplementation(async () => await Promise.reject(Error))
    fs.promises.writeFile = jest.fn().mockImplementation(async () => await Promise.resolve())

    const result = await manifestService.getItemsFromManifest(1, itemList)

    expect(fs.promises.writeFile).toHaveBeenCalledWith('manifest-items.json', JSON.stringify(expectedManifest))
    expect(result).toEqual(expectedItemNameList)
  })

  it('should return a list of collectibles from the read manifest', async () => {
    const expectedManifest = {
      item1: { displayProperties: { name: 'item1' } },
      item2: { displayProperties: { name: 'item2' } }
    }
    const itemList = { item1: { itemHash: 123 }, item2: { itemHash: 321 } }
    jest.spyOn(destinyService, 'getDestinyInventoryItemDefinition').mockResolvedValue(expectedManifest)
    fs.promises.access = jest.fn().mockImplementation(async () => await Promise.resolve())
    fs.promises.readFile = jest.fn().mockImplementation(async () => await Promise.resolve(expectedManifest))

    const result = await manifestService.getCollectiblesFromManifest(1, itemList)

    expect(fs.promises.readFile).toHaveBeenCalledWith('manifest-collectibles.json')
    expect(result).toEqual(['item1', 'item2'])
  })

  it('should return a list of collectibles from the written manifest', async () => {
    const expectedManifest = {
      item1: { displayProperties: { name: 'item1' } },
      item2: { displayProperties: { name: 'item2' } }
    }
    const itemList = { item1: { itemHash: 123 }, item2: { itemHash: 321 } }
    jest.spyOn(destinyService, 'getDestinyInventoryItemDefinition').mockResolvedValue(expectedManifest)
    fs.promises.access = jest.fn().mockImplementation(async () => await Promise.reject(Error))
    fs.promises.writeFile = jest.fn().mockImplementation(async () => await Promise.resolve())

    const result = await manifestService.getCollectiblesFromManifest(1, itemList)

    expect(fs.promises.writeFile).toHaveBeenCalledWith('manifest-collectibles.json', JSON.stringify(expectedManifest))
    expect(result).toEqual(['item1', 'item2'])
  })
})
