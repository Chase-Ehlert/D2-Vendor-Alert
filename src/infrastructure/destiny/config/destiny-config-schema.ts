import 'dotenv/config.js'
import joi from 'joi'
import { DestinyConfig } from './destiny-config.js'

export const destinyConfigSchema = joi
  .object<DestinyConfig>()
  .keys({
    DESTINY_API_KEY: joi.string().required(),
    DESTINY_OAUTH_CLIENT_ID: joi.string().required(),
    DESTINY_OAUTH_SECRET: joi.string().required()
  })
  .unknown()
