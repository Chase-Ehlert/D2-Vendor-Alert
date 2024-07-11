import { MongoUserRepository } from '../../infrastructure/persistence/mongo-user-repository'
import { UserInterface } from '../user/user'
import { AxiosHttpClient } from '../../infrastructure/persistence/axios-http-client'
import { DisplayProperties, Mod } from './mod'
import { DestinyClientConfig } from '../../infrastructure/destiny/config/destiny-client-config'
import { DestinyClient } from '../../infrastructure/destiny/destiny-client'
import { Vendor } from './vendor'

jest.mock('./../../testing-helpers/url', () => {
  return 'example'
})

describe('Vendor', () => {
  const destinyClient = new DestinyClient(
    new AxiosHttpClient(),
    new MongoUserRepository(),
    {} satisfies DestinyClientConfig
  )
  const vendor = new Vendor(destinyClient)
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

  it('should collect all the unowned mods for sale by Ada-1', async () => {
    const modId1 = '123'
    const modName1 = { name: 'Boots of Flying' } satisfies DisplayProperties
    const modId2 = '456'
    const modName2 = { name: 'Helmet of Forseeing' } satisfies DisplayProperties
    const expectedCollectibleList = [modName1.name, modName2.name]
    const unownedMods = ['111', '222']
    const vendorMerchandise = new Map<string, Map<string, Mod>>()
    const adaMerchandise = new Map<string, Mod>()
    const randomVendorMerchandise = new Map<string, Mod>()
    const adaMerchandiseInfo = [new Mod(modId1, modName1), new Mod(modId2, modName2)]

    randomVendorMerchandise.set('987', new Mod(
      '99',
       { name: 'Sword of Daggerfall' } satisfies DisplayProperties)
    )
    adaMerchandise.set(modId1, new Mod('1', modName1))
    adaMerchandise.set(modId2, new Mod('2', modName2))
    vendorMerchandise.set('111111111', randomVendorMerchandise)
    vendorMerchandise.set('350061650', adaMerchandise)

    const getUnownedModsSpy = jest.spyOn(destinyClient, 'getUnownedModIds').mockResolvedValue(unownedMods)
    const getVendorInfoSpy = jest.spyOn(destinyClient, 'getVendorMerchandise').mockResolvedValue(
      vendorMerchandise
    )
    const getAdaMerchandiseIdsSpy = jest.spyOn(destinyClient, 'getAdaMerchandiseIds').mockReturnValue(
      [modId1, modId2]
    )
    const getEquippableModsSpy = jest.spyOn(destinyClient, 'getEquippableMods')
      .mockResolvedValue(adaMerchandiseInfo)

    const result = await vendor.getUnownedMods(user)

    expect(getUnownedModsSpy).toHaveBeenCalledWith(user.destinyId)
    expect(getVendorInfoSpy).toHaveBeenCalledWith(user.destinyId, user.destinyCharacterId, user.refreshToken)
    expect(getAdaMerchandiseIdsSpy).toHaveBeenCalledWith('350061650', vendorMerchandise)
    expect(getEquippableModsSpy).toHaveBeenCalled()
    expect(result).toEqual(expectedCollectibleList)
  })
})
