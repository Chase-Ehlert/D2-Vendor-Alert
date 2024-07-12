import 'dotenv/config.js'
import joi, { Schema } from 'joi'
import { DestinyConfig } from './destiny-config.js'

export const destinyConfigSchema = joi
  .object<DestinyConfig>()
  .keys({
    DESTINY_API_KEY: joi.string().required(),
    DESTINY_OAUTH_CLIENT_ID: joi.string().required(),
    DESTINY_OAUTH_SECRET: joi.string().required()
  })
  .unknown()

export function validateDestinySchema (schema: Schema): DestinyConfig {
  const { value, error } = schema
    .prefs({ errors: { label: 'key' } })
    .validate(process.env)

  if (error !== undefined) {
    throw new Error(`Config validation error: ${error.message}`)
  }

  return value
}
