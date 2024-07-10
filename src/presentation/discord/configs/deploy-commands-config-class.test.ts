import { DeployCommandsConfigClass } from './deploy-commands-config-class.js'

describe('DeployCommandsConfigClass', () => {
  it('should return DestinyClientConfigClass from static fromConfig()', () => {
    const expectedToken = 'token'
    const expectedClientId = 'id'
    const expectedDeployCommandsConfigClass = new DeployCommandsConfigClass(
      expectedToken,
      expectedClientId
    )

    expect(DeployCommandsConfigClass.fromConfig(
      {
        DISCORD_TOKEN: expectedToken,
        DISCORD_CLIENT_ID: expectedClientId
      }
    )).toStrictEqual(expectedDeployCommandsConfigClass)
  })
})
