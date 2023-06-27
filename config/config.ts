// @ts-check

import 'dotenv/config'
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
    OAUTH_SECRET: joi.string().required(),
  })
  .unknown()

  const { value, error } = environmentVariableSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env)

  if (error) {
    throw new Error(`Config validation error: ${error.message}`)
  }

  export const config = {
    databaseUser: value.DATABASE_USER,
    databaseCluster: value.DATABASE_CLUSTER,
    databaseName: value.DATABASE_NAME,
    databasePassword: value.DATABASE_PASSWORD,
    apiKey: value.API_KEY,
    token: value.TOKEN,
    clientId: value.CLIENT_ID,
    oauthClientId: value.OAUTH_CLIENT_ID,
    oauthSecret: value.OAUTH_SECRET
  }