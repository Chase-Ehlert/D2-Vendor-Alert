import 'dotenv/config.js'
import joi from 'joi'
import { DestinyApiClientConfig } from '../destiny/config/destiny-api-client-config'
import { DiscordConfig } from '../discord/configs/discord-config'
import { MongoDbServiceConfig } from '../services/config/mongo-db-service-config'
import { AlertConfig } from '../discord/configs/alert-config'
import { DeployCommandsConfig } from '../discord/configs/deploy-commands-config'
import { NotifierServiceConfig } from '../services/config/notifier-service-config'

interface Config {
  MONGO_URI?: string
  DATABASE_USER?: string
  DATABASE_CLUSTER?: string
  DATABASE_NAME?: string
  DATABASE_PASSWORD?: string

  DISCORD_TOKEN?: string
  DISCORD_CLIENT_ID?: string

  DESTINY_API_KEY?: string
  DESTINY_OAUTH_CLIENT_ID?: string
  DESTINY_OAUTH_SECRET?: string

  DISCORD_NOTIFIER_ADDRESS?: string
}

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
    DESTINY_OAUTH_SECRET: joi.string().required(),

    DISCORD_NOTIFIER_ADDRESS: joi.string().required()
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

class DestinyApiClientConfigClass implements DestinyApiClientConfig {
  constructor (
    public readonly apiKey?: string,
    public readonly oauthSecret?: string,
    public readonly oauthClientId?: string
  ) { }

  static fromConfig ({
    DESTINY_API_KEY: apiKey,
    DESTINY_OAUTH_SECRET: oauthSecret,
    DESTINY_OAUTH_CLIENT_ID: oauthClientId
  }: Config): DestinyApiClientConfig {
    return new DestinyApiClientConfigClass(apiKey, oauthSecret, oauthClientId)
  }
}

class DiscordConfigClass implements DiscordConfig {
  constructor (public readonly token?: string) { }

  static fromConfig ({ DISCORD_TOKEN: token }: Config): DiscordConfig {
    return new DiscordConfigClass(token)
  }
}

class MongoDbServiceConfigClass implements MongoDbServiceConfig {
  constructor (
    public readonly mongoUri?: string,
    public readonly databaseUser?: string,
    public readonly databasePassword?: string,
    public readonly databaseCluster?: string,
    public readonly databaseName?: string
  ) { }

  static fromConfig ({
    MONGO_URI: mongoUri,
    DATABASE_USER: databaseUser,
    DATABASE_PASSWORD: databasePassword,
    DATABASE_CLUSTER: databaseCluster,
    DATABASE_NAME: databaseName
  }: Config): MongoDbServiceConfig {
    return new MongoDbServiceConfigClass(
      mongoUri ??
      'mongodb+srv://' +
      `${String(databaseUser)}:` +
      `${String(databasePassword)}@` +
      `${String(databaseCluster)}.mongodb.net/` +
      String(databaseName)
    )
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

class NotifierServiceConfigClass implements NotifierServiceConfig {
  constructor (public readonly address?: string) { }
  static fromConfig ({ DISCORD_NOTIFIER_ADDRESS: address }: Config): NotifierServiceConfig {
    return new NotifierServiceConfigClass(address)
  }
}

export const DESTINY_API_CLIENT_CONFIG = DestinyApiClientConfigClass.fromConfig(value)
export const DISCORD_CONFIG = DiscordConfigClass.fromConfig(value)
export const MONGO_DB_SERVICE_CONFIG = MongoDbServiceConfigClass.fromConfig(value)
export const ALERT_CONFIG = AlertConfigClass.fromConfig(value)
export const DEPLOY_COMMANDS_CONFIG = DeployCommandsConfigClass.fromConfig(value)
export const DISCORD_NOTIFIER_ADDRESS = NotifierServiceConfigClass.fromConfig(value)
export default value
