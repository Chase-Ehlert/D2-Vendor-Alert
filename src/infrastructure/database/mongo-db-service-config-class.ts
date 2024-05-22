import { Config } from '../../domain/config.js'
import { MongoDbServiceConfig } from './mongo-db-service-config.js'

export class MongoDbServiceConfigClass implements MongoDbServiceConfig {
  constructor (
    public readonly mongoUri?: string,
    public readonly databaseUser?: string,
    public readonly databasePassword?: string,
    public readonly databaseCluster?: string,
    public readonly databaseName?: string
  ) { }

  static fromConfig ({
    MONGO_URI: mongoUri,
    DATABASE_USER: databaseUser,
    DATABASE_PASSWORD: databasePassword,
    DATABASE_CLUSTER: databaseCluster,
    DATABASE_NAME: databaseName
  }: Config): MongoDbServiceConfig {
    if (mongoUri !== undefined) {
      return new MongoDbServiceConfigClass(mongoUri)
    } else if (
      databaseUser !== undefined &&
      databasePassword !== undefined &&
       databaseCluster !== undefined &&
        databaseName !== undefined
    ) {
      return new MongoDbServiceConfigClass(
        `mongodb+srv://${databaseUser}:` +
        `${databasePassword}@` +
        `${databaseCluster}.mongodb.net/` +
        databaseName
      )
    } else {
      throw new Error('Mongo DB Service Config is missing uri info!')
    }
  }
}
