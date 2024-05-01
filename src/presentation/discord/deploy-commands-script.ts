import { ALERT_COMMAND_CONFIG, DEPLOY_COMMANDS_CONFIG } from '../../apps/config.js'
import { AlertCommand } from './commands/alert-command.js'
import { DeployCommands } from './deploy-commands.js'

const deployCommands = new DeployCommands(DEPLOY_COMMANDS_CONFIG, new AlertCommand(ALERT_COMMAND_CONFIG))

await deployCommands.registerCommands()
