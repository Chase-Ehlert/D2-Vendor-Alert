import { AlertCommand } from './commands/alert-command.js'
import { DeployCommands } from './deploy-commands.js'
import { AlertCommandConfigClass } from './commands/alert-command-config-class.js'
import { DeployCommandsConfigClass } from './configs/deploy-commands-config-class.js'
import { discordConfigSchema } from './configs/discord-config-schema.js'
import { destinyConfigSchema } from '../../infrastructure/destiny/config/destiny-config-schema.js'
import { validateSchema } from '../../apps/validate-config-schema.js'

const discordConfig = validateSchema(discordConfigSchema)
const destinyConfig = validateSchema(destinyConfigSchema)
const deployCommandsConfig = DeployCommandsConfigClass.fromConfig(discordConfig)
const alertCommandConfig = AlertCommandConfigClass.fromConfig(destinyConfig)

const deployCommands = new DeployCommands(deployCommandsConfig, new AlertCommand(alertCommandConfig))

await deployCommands.registerCommands()
