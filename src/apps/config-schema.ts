import 'dotenv/config.js'
import joi, { Schema } from 'joi'
import { Config } from '../domain/config.js'

export const notifierConfigSchema = joi
  .object<Config>()
  .keys({
    DESTINY_API_KEY: joi.string().required(),
    DESTINY_OAUTH_CLIENT_ID: joi.string().required(),
    DESTINY_OAUTH_SECRET: joi.string().required()
  })
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
