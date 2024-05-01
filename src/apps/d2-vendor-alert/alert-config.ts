import joi from 'joi'
import { Config } from './../../configs/config.js'
import { NotifierServiceConfig } from './../../configs/notifier-service-config.js'

interface AlertConfig extends Config {
  DISCORD_NOTIFIER_ADDRESS?: string
}

const environmentVariableSchema = joi
  .object<AlertConfig>()
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

class NotifierServiceConfigClass implements NotifierServiceConfig {
  constructor (public readonly address?: string) { }
  static fromConfig ({ DISCORD_NOTIFIER_ADDRESS: address }: AlertConfig): NotifierServiceConfig {
    return new NotifierServiceConfigClass(address)
  }
}

export const DISCORD_NOTIFIER_ADDRESS = NotifierServiceConfigClass.fromConfig(value)
export default value
