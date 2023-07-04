import { DatabaseService } from './database-service'
import mongoose from 'mongoose'

const databaseService = new DatabaseService()

describe('<DatabaseService/>', () => {
  it('should instantiate', () => {
    expect(databaseService).not.toBeNull()
  })

  it('should establish a connection to the mongo database', async () => {
    const connectMock = jest.fn()
    jest.spyOn(mongoose, 'connect').mockImplementation(connectMock)

    await databaseService.connectToDatabase()

    expect(connectMock).toHaveBeenCalled()
  })

  it('should disconnest the connection to the mongo database', async () => {
    const disconnectMock = jest.fn()
    jest.spyOn(mongoose, 'disconnect').mockImplementation(disconnectMock)

    await databaseService.disconnectToDatabase()

    expect(disconnectMock).toHaveBeenCalled()
  })
})
