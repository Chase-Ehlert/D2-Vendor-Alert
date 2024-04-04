import { DiscordService } from './discord-service'
import { Vendor } from '../destiny/vendor'
import { MongoUserRepository } from '../database/mongo-user-repository'
import { ManifestService } from './manifest-service'
import { DestinyApiClient } from '../destiny/destiny-api-client'
import { AxiosHttpClient } from '../utility/axios-http-client'
import { DESTINY_API_CLIENT_CONFIG, DISCORD_CONFIG } from '../config/config'

jest.mock('./../utility/url', () => {
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
