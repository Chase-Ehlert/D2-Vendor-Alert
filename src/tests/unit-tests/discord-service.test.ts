import { DiscordService } from '../../infrastructure/services/discord-service'
import { Vendor } from '../../infrastructure/destiny/vendor'
import { MongoUserRepository } from '../../infrastructure/database/mongo-user-repository'
import { ManifestService } from '../../infrastructure/services/manifest-service'
import { DestinyApiClient } from '../../infrastructure/destiny/destiny-api-client'
import { AxiosHttpClient } from '../../infrastructure/database/axios-http-client'
import { DESTINY_API_CLIENT_CONFIG, DISCORD_CONFIG } from '../../configs/config'

jest.mock('./../infrastructure/url', () => {
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
