import { AlertCommand } from './commands/alert-command.js'
import { DeployCommands } from './deploy-commands.js'
import { AlertCommandConfigClass } from './commands/alert-command-config-class.js'
import { DeployCommandsConfigClass } from './configs/deploy-commands-config-class.js'
import { discordConfigSchema, validateDiscordSchema } from './configs/discord-config-schema.js'
import { destinyConfigSchema, validateDestinySchema } from '../../infrastructure/destiny/config/destiny-config-schema.js'

const discordConfig = validateDiscordSchema(discordConfigSchema)
const destinyConfig = validateDestinySchema(destinyConfigSchema)
const DEPLOY_COMMANDS_CONFIG = DeployCommandsConfigClass.fromConfig(discordConfig)
const ALERT_COMMAND_CONFIG = AlertCommandConfigClass.fromConfig(destinyConfig)

const deployCommands = new DeployCommands(DEPLOY_COMMANDS_CONFIG, new AlertCommand(ALERT_COMMAND_CONFIG))

await deployCommands.registerCommands()
