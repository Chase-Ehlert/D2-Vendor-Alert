import 'dotenv/config.js'
import joi, { Schema } from 'joi'
import { Config } from '../domain/config.js'

export const notifierConfigSchema = joi
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

export const alertConfigSchema = notifierConfigSchema.append(
  { DISCORD_NOTIFIER_ADDRESS: joi.string().required() }
)

export function validateSchema (schema: Schema): Config {
  const { value, error } = schema
    .prefs({ errors: { label: 'key' } })
    .validate(process.env)

  if (error !== undefined) {
    throw new Error(`Config validation error: ${error.message}`)
  }

  return value
}
