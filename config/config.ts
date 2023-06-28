import 'dotenv/config'
import * as joi from 'joi'

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

class Config {
  constructor(
    public databaseUser: string,
    public databaseCluster: string,
    public databaseName: string,
    public databasePassword: string,
    public apiKey: string,
    public token: string,
    public clientId: string,
    public oauthClientId: string,
    public oauthSecret: string
  ) { }
}

export const config = new Config(
  value.DATABASE_USER,
  value.DATABASE_CLUSTER,
  value.DATABASE_NAME,
  value.DATABASE_PASSWORD,
  value.API_KEY,
  value.TOKEN,
  value.CLIENT_ID,
  value.OAUTH_CLIENT_ID,
  value.OAUTH_SECRET
)
