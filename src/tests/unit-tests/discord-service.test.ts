import { DiscordService } from '../../presentation/discord-service'
import { Vendor } from '../../presentation/vendor'
import { MongoUserRepository } from '../../infrastructure/database/mongo-user-repository'
import { ManifestService } from '../../presentation/manifest-service'
import { DestinyApiClient } from '../../presentation/destiny-api-client'
import { AxiosHttpClient } from '../../infrastructure/database/axios-http-client'
import { DESTINY_API_CLIENT_CONFIG, DISCORD_CONFIG } from '../../configs/config'

jest.mock('./../helpers/url', () => {
  return 'example'
})

describe('<DiscordService/>', () => {
  const destinyApiClient = new DestinyApiClient(
    new AxiosHttpClient(),
    new MongoUserRepository(),
    DESTINY_API_CLIENT_CONFIG
  )
  const vendor = new Vendor(
    destinyApiClient,
    new ManifestService(destinyApiClient)
  )
  const discordService = new DiscordService(vendor, new AxiosHttpClient(), DISCORD_CONFIG)

  it('should instantiate', () => {
    expect(discordService).not.toBeNull()
  })
})
