import 'dotenv/config.js'
import joi, { Schema } from 'joi'
import { DiscordConfig } from './discord-config.js'

export const discordConfigSchema = joi
  .object<DiscordConfig>()
  .keys({
    DISCORD_TOKEN: joi.string(),
    DISCORD_CLIENT_ID: joi.string()
  })
  .unknown()

export const alertConfigSchema = discordConfigSchema.append(
  { DISCORD_NOTIFIER_ADDRESS: joi.string().required() }
)

export function validateDiscordSchema (schema: Schema): DiscordConfig {
  const { value, error } = schema
    .prefs({ errors: { label: 'key' } })
    .validate(process.env)

  if (error !== undefined) {
    throw new Error(`Config validation error: ${error.message}`)
  }

  return value
}
