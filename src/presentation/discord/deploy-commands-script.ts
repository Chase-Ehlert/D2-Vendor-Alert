import { AlertCommand } from './commands/alert-command.js'
import { DeployCommands } from './deploy-commands.js'
import { AlertCommandConfigClass } from './commands/alert-command-config-class.js'
import { DeployCommandsConfigClass } from './deploy-commands-config-class.js'
import { notifierConfigSchema, validateSchema } from '../../apps/config-schema.js'

const config = validateSchema(notifierConfigSchema)
const DEPLOY_COMMANDS_CONFIG = DeployCommandsConfigClass.fromConfig(config)
const ALERT_COMMAND_CONFIG = AlertCommandConfigClass.fromConfig(config)

const deployCommands = new DeployCommands(DEPLOY_COMMANDS_CONFIG, new AlertCommand(ALERT_COMMAND_CONFIG))

await deployCommands.registerCommands()
