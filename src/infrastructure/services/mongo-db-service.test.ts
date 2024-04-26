import { MongoDbService } from './mongo-db-service'
import { MongoDbServiceConfig } from '../../configs/mongo-db-service-config'
import mongoose from 'mongoose'

beforeAll(() => {
  global.console = {
    ...console,
    log: jest.fn()
  }
})

describe('MongoDbService', () => {
  let mongoDbService = new MongoDbService({} satisfies MongoDbServiceConfig)

  it('should establish a connection to the mongo database', async () => {
    const expectedDatabaseUser = 'jack'
    const expectedDatabasePassword = '123'
    const expectedDatabaseCluster = 'someCluster'
    const expectedDatabaseName = 'someName'
    const config = {
      mongoUri: `mongodb+srv://${expectedDatabaseUser}:` +
      `${expectedDatabasePassword}@` +
      `${expectedDatabaseCluster}.mongodb.net/` +
      `${expectedDatabaseName}`
    }
    mongoDbService = new MongoDbService(config)

    mongoose.connect = jest.fn()

    await mongoDbService.connectToDatabase()

    expect(mongoose.connect).toHaveBeenCalledWith(
      `mongodb+srv://${expectedDatabaseUser}:` +
      `${expectedDatabasePassword}@` +
      `${expectedDatabaseCluster}.mongodb.net/` +
      `${expectedDatabaseName}`
    )
  })

  it('should disconnest the connection to the mongo database', async () => {
    const disconnectMock = jest.fn()
    jest.spyOn(mongoose, 'disconnect').mockImplementation(disconnectMock)

    await mongoDbService.disconnectToDatabase()

    expect(disconnectMock).toHaveBeenCalled()
  })
})
