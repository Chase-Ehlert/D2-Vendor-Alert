import { config } from '../../config/config.js'
import { DatabaseService } from './database-service.js'
import mongoose from 'mongoose'

describe('<DatabaseService/>', () => {
  let databaseService = new DatabaseService()

  it('should instantiate', () => {
    expect(databaseService).not.toBeNull()
  })

  it('should establish a connection to the mongo database', async () => {
    const expectedDatabaseUser = 'jack'
    const expectedDatabasePassword = '123'
    const expectedDatabaseCluster = 'someCluster'
    const expectedDatabaseName = 'someName'
    config.configModel = {
      ...config.configModel,
      databaseUser: expectedDatabaseUser,
      databasePassword: expectedDatabasePassword,
      databaseCluster: expectedDatabaseCluster,
      databaseName: expectedDatabaseName
    }

    databaseService = new DatabaseService()

    mongoose.connect = jest.fn()

    await databaseService.connectToDatabase()

    expect(mongoose.connect).toHaveBeenCalledWith(
      `mongodb+srv://${expectedDatabaseUser}:${expectedDatabasePassword}@${expectedDatabaseCluster}.mongodb.net/${expectedDatabaseName}`
    )
  })

  it('should disconnest the connection to the mongo database', async () => {
    const disconnectMock = jest.fn()
    jest.spyOn(mongoose, 'disconnect').mockImplementation(disconnectMock)

    await databaseService.disconnectToDatabase()

    expect(disconnectMock).toHaveBeenCalled()
  })
})
