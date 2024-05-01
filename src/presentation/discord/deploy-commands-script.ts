import value from '../../apps/discord-notifier/notifier-config-schema.js'
import { AlertCommand } from './commands/alert-command.js'
import { DeployCommands } from './deploy-commands.js'
import { AlertCommandConfigClass } from './commands/alert-command-config-class.js'
import { DeployCommandsConfigClass } from './deploy-commands-config-class.js'

const DEPLOY_COMMANDS_CONFIG = DeployCommandsConfigClass.fromConfig(value)
const ALERT_COMMAND_CONFIG = AlertCommandConfigClass.fromConfig(value)
const deployCommands = new DeployCommands(DEPLOY_COMMANDS_CONFIG, new AlertCommand(ALERT_COMMAND_CONFIG))

await deployCommands.registerCommands()
