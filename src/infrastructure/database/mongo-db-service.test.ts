import { MongoDbService } from './mongo-db-service'
import mongoose, { Mongoose } from 'mongoose'

beforeAll(() => {
  global.console = {
    ...console,
    log: jest.fn()
  }
})

describe('MongoDbService', () => {
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
  const mongoDbService = new MongoDbService(config)

  it('should establish a connection to the mongo database', async () => {
    const connectResponse = {} as unknown as Mongoose
    const connectSpy = jest.spyOn(mongoose, 'connect').mockResolvedValue(connectResponse)
    const setSpy = jest.spyOn(mongoose, 'set')
    const logSpy = jest.spyOn(console, 'log')

    await mongoDbService.connectToDatabase()

    expect(setSpy).toHaveBeenCalledWith('strictQuery', false)
    expect(connectSpy).toHaveBeenCalledWith(
      `mongodb+srv://${expectedDatabaseUser}:` +
      `${expectedDatabasePassword}@` +
      `${expectedDatabaseCluster}.mongodb.net/` +
      `${expectedDatabaseName}`
    )
    expect(logSpy).toHaveBeenCalledWith('Database connection set')
  })

  it('should throw an error when mongoUri is undefined', async () => {
    const mongoDbService = new MongoDbService({ mongoUri: undefined })

    try {
      expect(await mongoDbService.connectToDatabase()).toThrow('Mongo URI is undefined in MongoDbService!')
    } catch (error) {}
  })

  it('should disconnest the connection to the mongo database', async () => {
    const disconnectSpy = jest.spyOn(mongoose, 'disconnect').mockResolvedValue()

    await mongoDbService.disconnectToDatabase()

    expect(disconnectSpy).toHaveBeenCalled()
  })
})
