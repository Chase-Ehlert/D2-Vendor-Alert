import value, { DEPLOY_COMMANDS_CONFIG } from '../../apps/config.js'
import { AlertCommand } from './commands/alert-command.js'
import { DeployCommands } from './deploy-commands.js'
import { AlertCommandConfigClass } from '../../presentation/discord/commands/alert-command-config-class.js'

const ALERT_COMMAND_CONFIG = AlertCommandConfigClass.fromConfig(value)
const deployCommands = new DeployCommands(DEPLOY_COMMANDS_CONFIG, new AlertCommand(ALERT_COMMAND_CONFIG))

await deployCommands.registerCommands()
