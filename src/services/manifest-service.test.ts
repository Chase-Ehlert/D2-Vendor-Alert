import { DestinyService } from './destiny-service'
import { ManifestService } from './manifest-service'
import fs from 'fs'

describe('<ManifestService/>', () => {
  const destinyService = new DestinyService()
  const manifestService = new ManifestService(destinyService)

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should instantiate', () => {
    expect(manifestService).not.toBeNull()
  })

  it('should return a list of item names from the read manifest', async () => {
    const expectedManifestFilename = 'manifest'
    const getManifestFileMock = jest.spyOn(destinyService, 'getManifestFile').mockResolvedValue(expectedManifestFilename)
    const getDestinyInventoryItemDefinitionMock = jest.spyOn(destinyService, 'getDestinyInventoryItemDefinition').mockResolvedValue({})
    const itemList = { item1: { itemHash: '123' }, item2: { itemHash: '321' } }
    const expectedManifest = '{ "item1": { "hash": "123", "itemType": 1, "collectibleHash": "456" }, "item2": { "hash": "321", "itemType": 1, "collectibleHash": "654" }}'
    const expectedItemNameList = ['456', '654']
    fs.promises.access = jest.fn().mockImplementation(async () => await Promise.resolve())
    fs.promises.readFile = jest.fn().mockImplementation(async () => await Promise.resolve(expectedManifest))

    const result = await manifestService.getItemFromManifest(1, itemList)

    expect(getManifestFileMock).toHaveBeenCalled()
    expect(getDestinyInventoryItemDefinitionMock).toHaveBeenCalled()
    expect(fs.promises.readFile).toHaveBeenCalledWith('manifest-items.json')
    expect(result).toEqual(expectedItemNameList)
  })

  it('should return a list of item names from the written manifest', async () => {
    const expectedManifest = {
      item1: { hash: 123, itemType: 1, collectibleHash: 456 },
      item2: { hash: 321, itemType: 1, collectibleHash: 654 }
    }
    const expectedManifestFilename = 'manifest'
    const itemList = { item1: { itemHash: 123 }, item2: { itemHash: 321 } }
    const expectedItemNameList = [456, 654]

    jest.spyOn(destinyService, 'getManifestFile').mockResolvedValue(expectedManifestFilename)
    jest.spyOn(destinyService, 'getDestinyInventoryItemDefinition').mockResolvedValue(expectedManifest)
    fs.promises.access = jest.fn().mockImplementation(async () => await Promise.reject(Error))
    fs.promises.writeFile = jest.fn().mockImplementation(async () => await Promise.resolve())

    const result = await manifestService.getItemFromManifest(1, itemList)

    expect(fs.promises.writeFile).toHaveBeenCalledWith('manifest-items.json', JSON.stringify(expectedManifest))
    expect(result).toEqual(expectedItemNameList)
  })

  it('should return a list of collectibles from the read manifest', async () => {
    const expectedManifest = {
      item1: { displayProperties: { name: 'item1' } },
      item2: { displayProperties: { name: 'item2' } }
    }
    const itemList = { item1: { itemHash: 123 }, item2: { itemHash: 321 } }
    const expectedManifestFilename = 'manifest'
    jest.spyOn(destinyService, 'getManifestFile').mockResolvedValue(expectedManifestFilename)
    jest.spyOn(destinyService, 'getDestinyInventoryItemDefinition').mockResolvedValue(expectedManifest)
    fs.promises.access = jest.fn().mockImplementation(async () => await Promise.resolve())
    fs.promises.readFile = jest.fn().mockImplementation(async () => await Promise.resolve(expectedManifest))

    const result = await manifestService.getCollectibleFromManifest(1, itemList)

    expect(fs.promises.readFile).toHaveBeenCalledWith('manifest-collectibles.json')
    expect(result).toEqual(['item1', 'item2'])
  })

  it('should return a list of collectibles from the written manifest', async () => {
    const expectedManifest = {
      item1: { displayProperties: { name: 'item1' } },
      item2: { displayProperties: { name: 'item2' } }
    }
    const itemList = { item1: { itemHash: 123 }, item2: { itemHash: 321 } }
    const expectedManifestFilename = 'manifest'
    jest.spyOn(destinyService, 'getManifestFile').mockResolvedValue(expectedManifestFilename)
    jest.spyOn(destinyService, 'getDestinyInventoryItemDefinition').mockResolvedValue(expectedManifest)
    fs.promises.access = jest.fn().mockImplementation(async () => await Promise.reject(Error))
    fs.promises.writeFile = jest.fn().mockImplementation(async () => await Promise.resolve())

    const result = await manifestService.getCollectibleFromManifest(1, itemList)

    expect(fs.promises.writeFile).toHaveBeenCalledWith('manifest-collectibles.json', JSON.stringify(expectedManifest))
    expect(result).toEqual(['item1', 'item2'])
  })
})
