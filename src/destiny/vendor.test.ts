import { MongoUserRepository } from '../database/mongo-user-repository'
import { UserInterface } from '../database/models/user'
import { DestinyService } from '../services/destiny-service'
import { ManifestService } from '../services/manifest-service'
import { RefreshTokenInfo } from '../services/models/refresh-token-info'
import { Vendor } from './vendor'
import { DestinyApiClient } from './destiny-api-client'
import logger from '../utility/logger'

jest.mock('./../utility/url', () => {
  return 'example'
})

describe('<Vendor/>', () => {
  const destinyService = new DestinyService(new DestinyApiClient())
  const userRepo = new MongoUserRepository()
  const manifestService = new ManifestService(new DestinyService(new DestinyApiClient()))
  const vendor = new Vendor(destinyService, userRepo, manifestService)
  let user = {
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
    const bungieMembershipId = '1323'
    const refreshTokenExpirationTime = '3212341'
    const refreshToken = '888'
    const accessToken = '000'
    const tokenInfo = new RefreshTokenInfo(bungieMembershipId, refreshTokenExpirationTime, refreshToken, accessToken)
    const expectedSaleItem = { saleItems: { item1: 'item1' } }
    const vendorInventory = { 350061650: expectedSaleItem, 456: { saleItems: { item2: 'item2' } } }
    const expectedCollectible = 'testing'
    const expectedManifestItem = [expectedCollectible]
    const expectedCollectibleList = ['item', 'anotherItem']
    const collectibleInfo = { testing: { state: 65 } }
    const getDestinyCollectibleInfoMock = jest.spyOn(destinyService, 'getDestinyCollectibleInfo').mockResolvedValue(collectibleInfo)
    const getAccessTokenMock = jest.spyOn(destinyService, 'getAccessToken').mockResolvedValue(tokenInfo)
    const updateUserByMembershipIdMock = jest.spyOn(userRepo, 'updateUserByMembershipId').mockResolvedValue()
    const getDestinyVendorInfoMock = jest.spyOn(destinyService, 'getDestinyVendorInfo').mockResolvedValue(vendorInventory)
    const getItemFromManifestMock = jest.spyOn(manifestService, 'getItemFromManifest').mockResolvedValue(expectedManifestItem)
    const getCollectibleFromManifestMock = jest.spyOn(manifestService, 'getCollectibleFromManifest').mockResolvedValue(expectedCollectibleList)

    const result = await vendor.getCollectiblesForSaleByAda(user)

    expect(getDestinyCollectibleInfoMock).toBeCalledWith(user.destinyId)
    expect(getAccessTokenMock).toBeCalledWith(user.refreshToken)
    expect(updateUserByMembershipIdMock).toBeCalledWith(bungieMembershipId, refreshTokenExpirationTime, refreshToken)
    expect(getDestinyVendorInfoMock).toBeCalledWith(user, accessToken)
    expect(getItemFromManifestMock).toBeCalledWith(19, expectedSaleItem.saleItems)
    expect(getCollectibleFromManifestMock).toBeCalledWith(19, [expectedCollectible])
    expect(result).toEqual(expectedCollectibleList)
  })

  it('should throw an error when the access token is undefined before calling getItemFromManifest()', async () => {
    const tokenInfo = new RefreshTokenInfo('bungieMembershipId', 'refreshTokenExpirationTime', 'refreshToken')
    jest.spyOn(destinyService, 'getDestinyCollectibleInfo').mockResolvedValue({})
    jest.spyOn(destinyService, 'getAccessToken').mockResolvedValue(tokenInfo)
    user = {
      ...user,
      refreshToken: ''
    } as unknown as UserInterface
    logger.error = jest.fn()

    await expect(async () => await vendor.getCollectiblesForSaleByAda(user)).rejects.toThrow(Error)

    expect(logger.error).toBeCalledWith('Missing access token for retreiving vendor mod inventory.')
  })
})
