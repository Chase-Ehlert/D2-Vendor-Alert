import { DESTINY_API_CLIENT_CONFIG } from '../configs/config'
import { MongoUserRepository } from '../infrastructure/database/mongo-user-repository'
import { DestinyApiClient } from '../presentation/destiny-api-client'
import { AxiosHttpClient } from '../infrastructure/database/axios-http-client'
import { ManifestService } from '../presentation/manifest-service'
import { Mod } from '../domain/mod'

jest.mock('./../utility/url', () => {
  return 'example'
})

describe('<ManifestService/>', () => {
  const destinyApiClient = new DestinyApiClient(new AxiosHttpClient(), new MongoUserRepository(), DESTINY_API_CLIENT_CONFIG)
  const manifestService = new ManifestService(destinyApiClient)

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should instantiate', () => {
    expect(manifestService).not.toBeNull()
  })

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
    const itemHashes = [new Mod(itemHash1), new Mod(itemHash2)]
    const expectedItemNameList = [new Mod(itemHash1, itemName1), new Mod(itemHash2, itemName2)]

    const result = await manifestService.getModInfoFromManifest(itemHashes)

    expect(getDestinyInventoryItemDefinitionMock).toHaveBeenCalled()
    expect(result).toEqual(expectedItemNameList)
  })
})
