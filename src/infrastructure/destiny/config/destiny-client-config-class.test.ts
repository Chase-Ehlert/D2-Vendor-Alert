import { DestinyClientConfigClass } from './destiny-client-config-class.js'

describe('DestinyClientConfigClass', () => {
  it('should return DestinyClientConfigClass from static fromConfig()', () => {
    const expectedApiKey = 'key'
    const expectedOauthSecret = 'secret'
    const expectedOauthClientId = 'id'
    const expectedDestinyClientConfigClass = new DestinyClientConfigClass(
      expectedApiKey,
      expectedOauthSecret,
      expectedOauthClientId
    )

    expect(DestinyClientConfigClass.fromConfig(
      {
        DESTINY_API_KEY: expectedApiKey,
        DESTINY_OAUTH_SECRET: expectedOauthSecret,
        DESTINY_OAUTH_CLIENT_ID: expectedOauthClientId
      }
    )).toStrictEqual(expectedDestinyClientConfigClass)
  })
})
