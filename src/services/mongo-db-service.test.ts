import { UserServiceConfig } from '../config/config.js'
import { MongoDbService } from './mongo-db-service.js'
import mongoose from 'mongoose'

jest.mock('./../utility/logger', () => {
  return {
    info: jest.fn()
  }
})

describe('<UserService/>', () => {
  let userService = new MongoDbService(new UserServiceConfig())

  it('should instantiate', () => {
    expect(userService).not.toBeNull()
  })

  it('should establish a connection to the mongo database', async () => {
    const expectedDatabaseUser = 'jack'
    const expectedDatabasePassword = '123'
    const expectedDatabaseCluster = 'someCluster'
    const expectedDatabaseName = 'someName'
    const expectedConfig = {
      databaseUser: expectedDatabaseUser,
      databasePassword: expectedDatabasePassword,
      databaseCluster: expectedDatabaseCluster,
      databaseName: expectedDatabaseName
    }

    userService = new MongoDbService(expectedConfig)

    mongoose.connect = jest.fn()

    await userService.connectToDatabase()

    expect(mongoose.connect).toHaveBeenCalledWith(
      `mongodb+srv://${expectedDatabaseUser}:${expectedDatabasePassword}@${expectedDatabaseCluster}.mongodb.net/${expectedDatabaseName}`
    )
  })

  it('should disconnest the connection to the mongo database', async () => {
    const disconnectMock = jest.fn()
    jest.spyOn(mongoose, 'disconnect').mockImplementation(disconnectMock)

    await userService.disconnectToDatabase()

    expect(disconnectMock).toHaveBeenCalled()
  })
})
