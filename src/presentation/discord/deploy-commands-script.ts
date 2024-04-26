import { ALERT_CONFIG, DEPLOY_COMMANDS_CONFIG } from '../../configs/config.js'
import { AlertCommand } from './commands/alert-command.js'
import { DeployCommands } from './deploy-commands.js'

const deployCommands = new DeployCommands(DEPLOY_COMMANDS_CONFIG, new AlertCommand(ALERT_CONFIG))

await deployCommands.registerCommands()
