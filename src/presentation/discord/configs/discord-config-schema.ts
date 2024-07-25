import 'dotenv/config.js'
import joi from 'joi'
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
