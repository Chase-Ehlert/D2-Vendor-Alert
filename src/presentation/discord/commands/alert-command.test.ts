import { AlertCommand } from './alert-command'
import { AlertCommandConfig } from './alert-command-config.js'

describe('AlertCommand', () => {
  it('should setup the alert command', () => {
    const expectedOauthClientId = 'id'
    const alertConfig = { oauthClientId: expectedOauthClientId } as unknown as AlertCommandConfig
    const alertCommand = new AlertCommand(alertConfig)

    const command = alertCommand.setupCommand()

    expect(command).toMatchObject({
      data: expect.objectContaining({
        constructor: expect.any(Function),
        default_member_permissions: undefined,
        default_permission: undefined,
        description: 'Invites user to be added to the alert list',
        description_localizations: undefined,
        dm_permission: undefined,
        name: 'alert',
        name_localizations: undefined,
        nsfw: undefined,
        options: expect.any(Array)
      }),
      execute: expect.any(Function)
    })
  })
})
