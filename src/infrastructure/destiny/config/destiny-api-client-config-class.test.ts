import { DestinyApiClientConfigClass } from './destiny-api-client-config-class.js'

describe('DestinyApiClientConfigClass', () => {
  it('should return DestinyApiClientConfigClass from static fromConfig()', () => {
    const expectedApiKey = 'key'
    const expectedOauthSecret = 'secret'
    const expectedOauthClientId = 'id'
    const expectedDestinyApiClientConfigClass = new DestinyApiClientConfigClass(
      expectedApiKey,
      expectedOauthSecret,
      expectedOauthClientId
    )

    expect(DestinyApiClientConfigClass.fromConfig(
      {
        DESTINY_API_KEY: expectedApiKey,
        DESTINY_OAUTH_SECRET: expectedOauthSecret,
        DESTINY_OAUTH_CLIENT_ID: expectedOauthClientId
      }
    )).toStrictEqual(expectedDestinyApiClientConfigClass)
  })
})
