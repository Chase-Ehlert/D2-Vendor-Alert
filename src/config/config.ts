import 'dotenv/config.js'
import joi from 'joi'

const environmentVariableSchema = joi
  .object()
  .keys({
    DATABASE_USER: joi.string().required(),
    DATABASE_CLUSTER: joi.string().required(),
    DATABASE_NAME: joi.string().required(),
    DATABASE_PASSWORD: joi.string().required(),
    API_KEY: joi.string().required(),
    TOKEN: joi.string().required(),
    CLIENT_ID: joi.string().required(),
    OAUTH_CLIENT_ID: joi.string().required(),
    OAUTH_SECRET: joi.string().required()
  })
  .unknown()

const { value, error } = environmentVariableSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env)

if (error !== undefined) {
  throw new Error(`Config validation error: ${error.message}`)
}

export interface Config {
  databaseUser?: string
  databaseCluster?: string
  databaseName?: string
  databasePassword?: string
  apiKey?: string
  token?: string
  clientId?: string
  oauthClientId?: string
  oauthSecret?: string
}

export class DestinyApiClientConfig implements Config {
  apiKey: string
  oauthSecret: string
  oauthClientId: string

  constructor () {
    this.apiKey = value.API_KEY
    this.oauthSecret = value.OAUTH_SECRET
    this.oauthClientId = value.OAUTH_CLIENT_ID
  }
}

export class DiscordConfig implements Config {
  token: string

  constructor () {
    this.token = value.TOKEN
  }
}

export class UserServiceConfig implements Config {
  databaseUser: string
  databasePassword: string
  databaseCluster: string
  databaseName: string

  constructor () {
    this.databaseUser = value.DATABASE_USER
    this.databasePassword = value.DATABASE_PASSWORD
    this.databaseCluster = value.DATABASE_CLUSTER
    this.databaseName = value.DATABASE_NAME
  }
}

export class AlertConfig implements Config {
  oauthClientId: string

  constructor () {
    this.oauthClientId = value.OAUTH_CLIENT_ID
  }
}

export class DeployCommandsConfig implements Config {
  token: string
  clientId: string

  constructor () {
    this.token = value.TOKEN
    this.clientId = value.CLIENT_ID
  }
}
