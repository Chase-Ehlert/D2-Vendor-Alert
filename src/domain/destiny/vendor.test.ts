import { MongoUserRepository } from '../../infrastructure/persistence/mongo-user-repository'
import { UserInterface } from '../user/user'
import { AxiosHttpClient } from '../../infrastructure/persistence/axios-http-client'
import { Mod } from './mod'
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
    const modHash1 = '123'
    const modName1 = { name: 'Boots of Flying' }
    const modHash2 = '456'
    const modName2 = { name: 'Helmet of Forseeing' }
    const expectedCollectibleList = [modName1.name, modName2.name]
    const ownedMods = ['111', '222']
    const adaMerchandiseInfo = [new Mod(modHash1, modName1), new Mod(modHash2, modName2)]

    const getUnownedModsSpy = jest.spyOn(destinyClient, 'getCollectibleInfo').mockResolvedValue(ownedMods)
    const getVendorInfoSpy = jest.spyOn(destinyClient, 'getVendorInfo').mockResolvedValue([modHash1, modHash2])
    const getDestinyEquippableModsSpy = jest.spyOn(destinyClient, 'getDestinyEquippableMods')
      .mockResolvedValue(adaMerchandiseInfo)

    const result = await vendor.getUnownedModsForSaleByAda(user)

    expect(getUnownedModsSpy).toHaveBeenCalledWith(user.destinyId)
    expect(getVendorInfoSpy).toHaveBeenCalledWith(user.destinyId, user.destinyCharacterId, user.refreshToken)
    expect(getDestinyEquippableModsSpy).toHaveBeenCalled()
    expect(result).toEqual(expectedCollectibleList)
  })
})
