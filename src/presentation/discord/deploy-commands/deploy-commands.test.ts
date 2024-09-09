import { AlertCommandConfig } from '../alert-command/alert-command-config.js'
import { AlertCommand } from '../alert-command/alert-command.js'
import { DeployCommandsConfig } from './deploy-commands-config.js'
import { DeployCommands } from './deploy-commands.js'

const putResponse = 'response'
const slashCommand = {
  data: { key: 'something' }
}
let deployCommands: DeployCommands
let alertCommand: AlertCommand

jest.mock('discord.js', () => ({
  REST: jest.fn().mockImplementation(() => ({
    setToken: jest.fn().mockReturnThis(),
    put: jest.fn().mockReturnValue(putResponse)
  })),
  Routes: {
    applicationCommands: jest.fn()
  }
}))

beforeAll(() => {
  global.console = {
    ...console,
    log: jest.fn()
  }
})

beforeEach(() => {
  alertCommand = new AlertCommand({} satisfies AlertCommandConfig)
  deployCommands = new DeployCommands(
    {} satisfies DeployCommandsConfig,
    alertCommand
  )

  alertCommand.setupCommand = jest.fn().mockReturnValue(slashCommand)
})

describe('DeployCommands', () => {
  it('should register the alert command', async () => {
    const logSpy = jest.spyOn(console, 'log')

    await deployCommands.registerCommands()

    expect(alertCommand.setupCommand).toHaveBeenCalled()
    expect(logSpy).toHaveBeenCalledWith('Started refreshing the alert application (/) command.')
    expect(logSpy).toHaveBeenCalledWith(`Successfully reloaded ${putResponse.length} application (/) commands.`)
  })
})
