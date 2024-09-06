import { AlertCommandConfig } from '../alert-command/alert-command-config.js'
import { AlertCommand } from '../alert-command/alert-command.js'
import { DeployCommandsConfig } from './deploy-commands-config.js'
import { DeployCommands } from './deploy-commands.js'

jest.mock('discord.js', () => ({
  REST: jest.fn().mockImplementation(() => ({
    setToken: jest.fn().mockReturnThis(),
    put: jest.fn().mockResolvedValue('mockedResponse')
  })),
  Routes: {
    applicationCommands: jest.fn()
  }
}))

let deployCommands: DeployCommands
let alertCommand: AlertCommand
const setupCommandMock = jest.fn()

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

  alertCommand.setupCommand = setupCommandMock
})

describe('DeployCommands', () => {
  it('should register the alert command', async () => {
    // const slashCommandBuilder: SlashCommandBuilder = jest.fn()
    // const slashCommand: SlashCommand = {
    //   data: slashCommandBuilder,
    //   execute: function (): void {
    //     throw new Error('Function not implemented.')
    //   }
    // }

    // (Routes.applicationCommands as jest.Mock).mockReturnValue('mockCommandRoute')

    const slashCommand = {
      data: { key: 'something' }
    }
    const logSpy = jest.spyOn(console, 'log')

    setupCommandMock.mockReturnValue(slashCommand)

    await deployCommands.registerCommands()

    expect(alertCommand.setupCommand).toHaveBeenCalled()
    expect(logSpy).toHaveBeenCalledWith('Started refreshing the alert application (/) command.')
    expect(logSpy).toHaveBeenCalledWith('Successfully reloaded 14 application (/) commands.')
  })
})
