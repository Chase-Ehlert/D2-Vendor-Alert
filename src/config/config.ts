import 'dotenv/config.js'
import joi from 'joi'
import { DestinyApiClientConfig } from '../destiny/config/destiny-api-client-config'
import { DiscordConfig } from '../discord/configs/discord-config'
import { MongoDbServiceConfig } from '../services/config/mongo-db-service-config'
import { AlertConfig } from '../discord/configs/alert-config'
import { DeployCommandsConfig } from '../discord/configs/deploy-commands-config'

interface Config {
  DATABASE_USER?: string
  DATABASE_CLUSTER?: string
  DATABASE_NAME?: string
  DATABASE_PASSWORD?: string

  DISCORD_TOKEN?: string
  DISCORD_CLIENT_ID?: string

  DESTINY_API_KEY?: string
  DESTINY_OAUTH_CLIENT_ID?: string
  DESTINY_OAUTH_SECRET?: string
}

const environmentVariableSchema = joi
  .object<Config>()
  .keys({
    DATABASE_USER: joi.string().required(),
    DATABASE_CLUSTER: joi.string().required(),
    DATABASE_NAME: joi.string().required(),
    DATABASE_PASSWORD: joi.string().required(),

    DISCORD_TOKEN: joi.string().required(),
    DISCORD_CLIENT_ID: joi.string().required(),

    DESTINY_API_KEY: joi.string().required(),
    DESTINY_OAUTH_CLIENT_ID: joi.string().required(),
    DESTINY_OAUTH_SECRET: joi.string().required()
  })
  .unknown()

const { value, error } = environmentVariableSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env)

if (error !== undefined) {
  throw new Error(`Config validation error: ${error.message}`)
}

class DestinyApiClientConfigClass implements DestinyApiClientConfig {
  constructor (
    public readonly apiKey?: string,
    public readonly oauthSecret?: string,
    public readonly oauthClientId?: string
  ) { }

  static fromConfig ({
    DESTINY_API_KEY: key,
    DESTINY_OAUTH_SECRET: secret,
    DESTINY_OAUTH_CLIENT_ID: clientId
  }: Config): DestinyApiClientConfig {
    return new DestinyApiClientConfigClass(key, secret, clientId)
  }
}

class DiscordConfigClass implements DiscordConfig {
  constructor (public readonly token?: string) { }

  static fromConfig ({ DISCORD_TOKEN: tokenConfig }: Config): DiscordConfig {
    return new DiscordConfigClass(tokenConfig)
  }
}

class MongoDbServiceConfigClass implements MongoDbServiceConfig {
  constructor (
    public readonly databaseUser?: string,
    public readonly databasePassword?: string,
    public readonly databaseCluster?: string,
    public readonly databaseName?: string
  ) { }

  static fromConfig ({
    DATABASE_USER: databaseUserConfig,
    DATABASE_PASSWORD: databasePasswordConfig,
    DATABASE_CLUSTER: databaseClusterConfig,
    DATABASE_NAME: databaseNameConfig
  }: Config): MongoDbServiceConfig {
    return new MongoDbServiceConfigClass(
      databaseUserConfig,
      databasePasswordConfig,
      databaseClusterConfig,
      databaseNameConfig)
  }
}

class AlertConfigClass implements AlertConfig {
  constructor (public readonly oauthClientId?: string) { }

  static fromConfig ({ DESTINY_OAUTH_CLIENT_ID: oauthClientId }: Config): AlertConfig {
    return new AlertConfigClass(oauthClientId)
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

export const DESTINY_API_CLIENT_CONFIG = DestinyApiClientConfigClass.fromConfig(value)
export const DISCORD_CONFIG = DiscordConfigClass.fromConfig(value)
export const MONGO_DB_SERVICE_CONFIG = MongoDbServiceConfigClass.fromConfig(value)
export const ALERT_CONFIG = AlertConfigClass.fromConfig(value)
export const DEPLOY_COMMANDS_CONFIG = DeployCommandsConfigClass.fromConfig(value)
