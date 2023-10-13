import { MONGO_DB_SERVICE_CONFIG } from '../config/config.js'
import { MongoDbService } from './mongo-db-service.js'
import mongoose from 'mongoose'

jest.mock('./../utility/logger', () => {
  return {
    info: jest.fn()
  }
})

describe('<MongoDbService/>', () => {
  let mongoDbService = new MongoDbService(MONGO_DB_SERVICE_CONFIG)

  it('should instantiate', () => {
    expect(mongoDbService).not.toBeNull()
  })

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
