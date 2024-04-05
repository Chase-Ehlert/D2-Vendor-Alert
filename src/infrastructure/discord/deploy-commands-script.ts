import { ALERT_CONFIG, DEPLOY_COMMANDS_CONFIG } from '../../configs/config'
import { AlertCommand } from './commands/alert'
import { DeployCommands } from './deploy-commands'

const deployCommands = new DeployCommands(DEPLOY_COMMANDS_CONFIG, new AlertCommand(ALERT_CONFIG))

await deployCommands.registerCommands()
