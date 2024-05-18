import { MongoDbServiceConfigClass } from './mongo-db-service-config-class.js'

describe('MongoDbServiceConfigClass', () => {
  it('should return MongoDbServiceConfigClass from static fromConfig() for mongoUri', () => {
    const expectedMongoUri = 'http://somewhere'
    const expectedMongoDbServiceConfigClass = new MongoDbServiceConfigClass(
      expectedMongoUri
    )

    expect(MongoDbServiceConfigClass.fromConfig(
      {
        MONGO_URI: expectedMongoUri
      }
    )).toStrictEqual(expectedMongoDbServiceConfigClass)
  })

  it('should return MongoDbServiceConfigClass from static fromConfig() for database info', () => {
    const databaseUser = 'clark'
    const databasePassword = '123'
    const databaseCluster = 'cluster'
    const databaseName = 'smallville'
    const expectedMongoUri = `mongodb+srv://${databaseUser}:` + `${databasePassword}@` +
    `${databaseCluster}.mongodb.net/` + databaseName

    expect(MongoDbServiceConfigClass.fromConfig(
      {
        DATABASE_USER: databaseUser,
        DATABASE_PASSWORD: databasePassword,
        DATABASE_CLUSTER: databaseCluster,
        DATABASE_NAME: databaseName
      }
    )).toStrictEqual(new MongoDbServiceConfigClass(expectedMongoUri))
  })

  it('should throw an error when all database info is undefined', () => {
    try {
      expect(MongoDbServiceConfigClass.fromConfig({
        MONGO_URI: undefined,
        DATABASE_USER: undefined,
        DATABASE_PASSWORD: undefined,
        DATABASE_CLUSTER: undefined,
        DATABASE_NAME: undefined
      })).toThrow('Mongo DB Service Config is missing uri info!')
    } catch (error) {}
  })
})
