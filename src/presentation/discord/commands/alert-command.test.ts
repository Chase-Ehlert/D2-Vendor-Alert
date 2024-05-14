import { hyperlink } from 'discord.js'
import { AlertCommand } from './alert-command'
import { AlertCommandConfig } from './alert-command-config.js'

describe('AlertCommand', () => {
  const expectedOauthClientId = 'id'
  const alertConfig = { oauthClientId: expectedOauthClientId } as unknown as AlertCommandConfig
  const alertCommand = new AlertCommand(alertConfig)

  it('should setup the alert command', () => {
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

  it('should return a function that creates a hyperlink', () => {
    const interaction = { followUp: jest.fn() }
    const interactionFollowUp = (alertCommand as any).interactionFollowUp()

    interactionFollowUp(interaction)

    expect(interaction.followUp).toHaveBeenCalledWith(hyperlink(
      'Authorize D2 Vendor Alert',
      `https://www.bungie.net/en/oauth/authorize?client_id=${String(alertConfig.oauthClientId)}&response_type=code`
    ))
  })

  it('should throw an error when oauthClientId is undefined', () => {
    const alertConfig = { oauthClientId: undefined } as unknown as AlertCommandConfig
    const alertCommand = new AlertCommand(alertConfig)
    const interaction = { followUp: jest.fn() }
    const interactionFollowUp = (alertCommand as any).interactionFollowUp()

    try {
      expect(interactionFollowUp(interaction)).toThrow('OAuth Client Id is undefined for the Alert command!')
    } catch (error) {}
  })
})
