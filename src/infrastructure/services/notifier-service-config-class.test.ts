import { NotifierServiceConfigClass } from './notifier-service-config-class.js'

describe('NotifierServiceConfigClass', () => {
  it('should return DestinyApiClientConfigClass from static fromConfig()', () => {
    const expectedAddress = '123 Cloverfield Lane'
    const expectedDestinyApiClientConfigClass = new NotifierServiceConfigClass(
      expectedAddress
    )

    expect(NotifierServiceConfigClass.fromConfig(
      {
        DISCORD_NOTIFIER_ADDRESS: expectedAddress
      }
    )).toStrictEqual(expectedDestinyApiClientConfigClass)
  })
})
