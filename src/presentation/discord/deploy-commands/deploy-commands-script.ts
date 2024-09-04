import { validateSchema } from '../../../apps/validate-config-schema.js'
import { destinyConfigSchema } from '../../../infrastructure/destiny/config/destiny-config-schema.js'
import { AlertCommandConfigClass } from '../alert-command/alert-command-config-class.js'
import { AlertCommand } from '../alert-command/alert-command.js'
import { discordConfigSchema } from '../configs/discord-config-schema.js'
import { DeployCommandsConfigClass } from './deploy-commands-config-class.js'
import { DeployCommands } from './deploy-commands.js'

const discordConfig = validateSchema(discordConfigSchema)
const destinyConfig = validateSchema(destinyConfigSchema)
const DEPLOY_COMMANDS_CONFIG = DeployCommandsConfigClass.fromConfig(discordConfig)
const ALERT_COMMAND_CONFIG = AlertCommandConfigClass.fromConfig(destinyConfig)

const deployCommands = new DeployCommands(DEPLOY_COMMANDS_CONFIG, new AlertCommand(ALERT_COMMAND_CONFIG))

await deployCommands.registerCommands()
