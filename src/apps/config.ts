import 'dotenv/config.js'
import joi from 'joi'
import { DeployCommandsConfig } from '../presentation/discord/deploy-commands-config.js'
import { AlertCommandConfig } from '../presentation/discord/commands/alert-command-config.js'
import { Config } from '../domain/config.js'

const environmentVariableSchema = joi
  .object<Config>()
  .keys({
    MONGO_URI: joi.string(),
    DATABASE_USER: joi.string(),
    DATABASE_CLUSTER: joi.string(),
    DATABASE_NAME: joi.string(),
    DATABASE_PASSWORD: joi.string(),

    DISCORD_TOKEN: joi.string().required(),
    DISCORD_CLIENT_ID: joi.string().required(),

    DESTINY_API_KEY: joi.string().required(),
    DESTINY_OAUTH_CLIENT_ID: joi.string().required(),
    DESTINY_OAUTH_SECRET: joi.string().required()
  })
  .without('MONGO_URI', ['DATABASE_USER', 'DATABASE_CLUSTER', 'DATABASE_NAME', 'DATABASE_PASSWORD'])
  .or('DATABASE_USER', 'MONGO_URI')
  .or('DATABASE_CLUSTER', 'MONGO_URI')
  .or('DATABASE_NAME', 'MONGO_URI')
  .or('DATABASE_PASSWORD', 'MONGO_URI')
  .and('DATABASE_USER', 'DATABASE_CLUSTER', 'DATABASE_NAME', 'DATABASE_PASSWORD')
  .unknown()

const { value, error } = environmentVariableSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env)

if (error !== undefined) {
  throw new Error(`Config validation error: ${error.message}`)
}

class AlertCommandConfigClass implements AlertCommandConfig {
  constructor (public readonly oauthClientId?: string) { }

  static fromConfig ({ DESTINY_OAUTH_CLIENT_ID: oauthClientId }: Config): AlertCommandConfig {
    return new AlertCommandConfigClass(oauthClientId)
  }
}

class DeployCommandsConfigClass implements DeployCommandsConfig {
  constructor (
    public readonly token?: string,
    public readonly clientId?: string
  ) { }

  static fromConfig ({
    DISCORD_TOKEN: token,
    DISCORD_CLIENT_ID: clientId
  }: Config): DeployCommandsConfig {
    return new DeployCommandsConfigClass(token, clientId)
  }
}

export const ALERT_COMMAND_CONFIG = AlertCommandConfigClass.fromConfig(value)
export const DEPLOY_COMMANDS_CONFIG = DeployCommandsConfigClass.fromConfig(value)
export default value
