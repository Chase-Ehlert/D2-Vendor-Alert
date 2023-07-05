import { DatabaseService } from './database-service.js'
import mongoose from 'mongoose'
import { Config } from './../../config/config.js'

jest.mock('./../../config/config.js')

describe('<DatabaseService/>', () => {
  it('should instantiate', () => {
    const databaseService = new DatabaseService(new Config())
    expect(databaseService).not.toBeNull()
  })

  it('should establish a connection to the mongo database', async () => {
    const expectedDatabaseUser = 'jack'
    const expectedDatabasePassword = '123'
    const expectedDatabaseCluster = 'someCluster'
    const expectedDatabaseName = 'someName'
    const configMock = new Config()
    configMock.configModel = {
      ...configMock.configModel,
      databaseUser: expectedDatabaseUser,
      databasePassword: expectedDatabasePassword,
      databaseCluster: expectedDatabaseCluster,
      databaseName: expectedDatabaseName
    }

    const databaseService = new DatabaseService(configMock)

    mongoose.connect = jest.fn()

    await databaseService.connectToDatabase()

    expect(mongoose.connect).toHaveBeenCalledWith(
      `mongodb+srv://${expectedDatabaseUser}:${expectedDatabasePassword}@${expectedDatabaseCluster}.mongodb.net/${expectedDatabaseName}`
    )
  })

  it('should disconnest the connection to the mongo database', async () => {
    const databaseService = new DatabaseService(new Config())
    const disconnectMock = jest.fn()
    jest.spyOn(mongoose, 'disconnect').mockImplementation(disconnectMock)

    await databaseService.disconnectToDatabase()

    expect(disconnectMock).toHaveBeenCalled()
  })
})
