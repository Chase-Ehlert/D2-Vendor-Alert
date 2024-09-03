import 'dotenv/config.js'
import joi from 'joi'
import { DatabaseConfig } from './database-config.js'

export const databaseConfigSchema = joi
  .object<DatabaseConfig>()
  .keys({
    MONGO_URI: joi.string(),
    DATABASE_USER: joi.string(),
    DATABASE_CLUSTER: joi.string(),
    DATABASE_NAME: joi.string(),
    DATABASE_PASSWORD: joi.string()
  })
  .without(
    'MONGO_URI',
    ['DATABASE_USER', 'DATABASE_CLUSTER', 'DATABASE_NAME', 'DATABASE_PASSWORD']
  )
  .or('DATABASE_USER', 'MONGO_URI')
  .or('DATABASE_CLUSTER', 'MONGO_URI')
  .or('DATABASE_NAME', 'MONGO_URI')
  .or('DATABASE_PASSWORD', 'MONGO_URI')
  .and('DATABASE_USER', 'DATABASE_CLUSTER', 'DATABASE_NAME', 'DATABASE_PASSWORD')
  .unknown()
