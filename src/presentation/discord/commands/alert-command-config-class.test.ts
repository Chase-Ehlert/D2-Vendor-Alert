import { AlertCommandConfigClass } from './alert-command-config-class.js'

describe('AlertCommandConfigClass', () => {
  it('should return AlertCommandConfigClass from static fromConfig()', () => {
    const expectedOauthClientId = 'id'
    const expectedAlertCommandConfigClass = new AlertCommandConfigClass(
      expectedOauthClientId
    )

    expect(AlertCommandConfigClass.fromConfig(
      {
        DESTINY_OAUTH_CLIENT_ID: expectedOauthClientId
      }
    )).toStrictEqual(expectedAlertCommandConfigClass)
  })
})
