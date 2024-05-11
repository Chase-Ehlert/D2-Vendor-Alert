import { NotifierServiceConfigClass } from './notifier-service-config-class.js'

describe('NotifierServiceConfigClass', () => {
  it('should return NotifierServiceConfigClass from static fromConfig()', () => {
    const expectedAddress = '123 Cloverfield Lane'
    const expectedNotifierServiceConfigClass = new NotifierServiceConfigClass(
      expectedAddress
    )

    expect(NotifierServiceConfigClass.fromConfig(
      {
        DISCORD_NOTIFIER_ADDRESS: expectedAddress
      }
    )).toStrictEqual(expectedNotifierServiceConfigClass)
  })
})
