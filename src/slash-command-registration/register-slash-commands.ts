import { validateSchema } from '../apps/validate-config-schema.js'
import { destinyConfigSchema } from '../infrastructure/destiny/config/destiny-config-schema.js'
import { AlertCommandConfigClass } from '../presentation/discord/alert-command/alert-command-config-class.js'
import { AlertCommand } from '../presentation/discord/alert-command/alert-command.js'
import { discordConfigSchema } from '../presentation/discord/configs/discord-config-schema.js'
import { DeployCommandsConfigClass } from '../presentation/discord/deploy-commands/deploy-commands-config-class.js'
import { DeployCommands } from '../presentation/discord/deploy-commands/deploy-commands.js'

const discordConfig = validateSchema(discordConfigSchema)
const destinyConfig = validateSchema(destinyConfigSchema)
const DEPLOY_COMMANDS_CONFIG = DeployCommandsConfigClass.fromConfig(discordConfig)
const ALERT_COMMAND_CONFIG = AlertCommandConfigClass.fromConfig(destinyConfig)

const deployCommands = new DeployCommands(
  DEPLOY_COMMANDS_CONFIG,
  new AlertCommand(ALERT_COMMAND_CONFIG)
)

await deployCommands.registerCommands()
