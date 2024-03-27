import { DestinyService } from './destiny-service'
import { DestinyApiClient } from '../destiny/destiny-api-client'
import { AxiosHttpClient } from '../utility/axios-http-client'
import { DESTINY_API_CLIENT_CONFIG } from '../config/config'

jest.mock('./../utility/url', () => {
  return 'example'
})

beforeEach(() => {
  jest.resetAllMocks()
})

describe('<DestinyService/>', () => {
  const destinyApiClient = new DestinyApiClient(new AxiosHttpClient(), DESTINY_API_CLIENT_CONFIG)
  const destinyService = new DestinyService(destinyApiClient)

  it('should instantiate', async () => {
    expect(destinyService).not.toBeNull()
  })

  it('should check if a Destiny username exists based on a users Bungie username', async () => {
    const bungieUsername = 'name123'
    const bungieUsernameCode = '456'
    const expectedDestinyusername = 'coolGuy37'
    const usernameInfo = { data: { Response: { name: expectedDestinyusername } } }
    jest.spyOn(destinyApiClient, 'getDestinyUsername').mockResolvedValue(usernameInfo)

    const value = await destinyService.getDestinyUsername(bungieUsername, bungieUsernameCode)

    expect(value).toEqual(usernameInfo.data.Response)
  })
})
