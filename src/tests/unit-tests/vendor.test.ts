import { MongoUserRepository } from '../../infrastructure/database/mongo-user-repository'
import { UserInterface } from '../../domain/user'
import { ManifestService } from '../../presentation/manifest-service'
import { Vendor } from '../../presentation/vendor'
import { DestinyApiClient } from '../../presentation/destiny-api-client'
import { AxiosHttpClient } from '../../infrastructure/database/axios-http-client'
import { DESTINY_API_CLIENT_CONFIG } from '../../configs/config'
import { Mod } from '../../domain/mod'

jest.mock('./../presentation/url', () => {
  return 'example'
})

describe('<Vendor/>', () => {
  const destinyApiClient = new DestinyApiClient(new AxiosHttpClient(), new MongoUserRepository(), DESTINY_API_CLIENT_CONFIG)
  const manifestService = new ManifestService(destinyApiClient)
  const vendor = new Vendor(destinyApiClient, manifestService)
  const user = {
    bungieUsername: 'name',
    bungieUsernameCode: 'code',
    discordId: 'discordId',
    discordChannelId: 'channelId',
    bungieMembershipId: 'bungie',
    destinyId: 'destinyId',
    destinyCharacterId: 'destinyCharacterId',
    refreshExpiration: 'expiration',
    refreshToken: 'token'
  } as unknown as UserInterface

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should instantiate', () => {
    expect(vendor).not.toBeNull()
  })

  it('should collect all the mods for sale by Ada-1', async () => {
    const modHash1 = '123'
    const modName1 = 'Boots of Flying'
    const modHash2 = '456'
    const modName2 = 'Helmet of Forseeing'
    const expectedCollectibleList = [modName1, modName2]
    const unownedMods = [modHash1, modHash2]
    const adaMerchandise = [new Mod(modHash1), new Mod(modHash2)]
    const adaMerchandiseInfo = [new Mod('321', modName1), new Mod('654', modName2)]
    const getUnownedModsMock = jest.spyOn(destinyApiClient, 'getCollectibleInfo').mockResolvedValue(unownedMods)
    const getVendorInfoMock = jest.spyOn(destinyApiClient, 'getVendorInfo').mockResolvedValue(adaMerchandise)
    const manifestServiceMock = jest.spyOn(manifestService, 'getModInfoFromManifest').mockResolvedValue(adaMerchandiseInfo)

    const result = await vendor.getUnownedModsForSaleByAda(user)

    expect(getUnownedModsMock).toHaveBeenCalledWith(user.destinyId)
    expect(getVendorInfoMock).toHaveBeenCalledWith(user.destinyId, user.destinyCharacterId, user.refreshToken)
    expect(manifestServiceMock).toHaveBeenCalledWith(adaMerchandise)
    expect(result).toEqual(expectedCollectibleList)
  })
})
