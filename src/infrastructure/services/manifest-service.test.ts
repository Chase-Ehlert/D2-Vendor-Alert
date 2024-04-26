import { MongoUserRepository } from '../database/mongo-user-repository'
import { AxiosHttpClient } from '../database/axios-http-client'
import { Mod } from '../../domain/mod'
import { DestinyApiClientConfig } from '../../configs/destiny-api-client-config'
import { DestinyApiClient } from '../destiny/destiny-api-client'
import { ManifestService } from './manifest-service'

jest.mock('./../../testing-helpers/url', () => {
  return 'example'
})

describe('ManifestService', () => {
  const destinyApiClient = new DestinyApiClient(new AxiosHttpClient(), new MongoUserRepository(), {} satisfies DestinyApiClientConfig)
  const manifestService = new ManifestService(destinyApiClient)

  it('should return a list of mods with their info from the manifest', async () => {
    const itemHash1 = '123'
    const itemHash2 = '321'
    const itemName1 = 'Gloves of Hercules'
    const itemName2 = 'Glasses of Zeron'
    const expectedManifest = new Map()
    expectedManifest.set(itemHash1, itemName1)
    expectedManifest.set(itemHash2, itemName2)

    const getDestinyInventoryItemDefinitionMock =
      jest.spyOn(destinyApiClient, 'getDestinyInventoryItemDefinition').mockResolvedValue(expectedManifest)
    const itemHashes = [itemHash1, itemHash2]
    const expectedItemNameList = [new Mod(itemHash1, itemName1), new Mod(itemHash2, itemName2)]

    const result = await manifestService.getModInfoFromManifest(itemHashes)

    expect(getDestinyInventoryItemDefinitionMock).toHaveBeenCalled()
    expect(result).toEqual(expectedItemNameList)
  })
})
