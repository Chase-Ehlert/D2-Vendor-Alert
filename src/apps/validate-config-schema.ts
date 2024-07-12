import 'dotenv/config.js'
import { Schema } from 'joi'
import { Config } from '../domain/config.js'

export function validateSchema (schema: Schema): Config {
  const { value, error } = schema
    .prefs({ errors: { label: 'key' } })
    .validate(process.env)

  if (error !== undefined) {
    throw new Error(`Config validation error: ${error.message}`)
  }

  return value
}
