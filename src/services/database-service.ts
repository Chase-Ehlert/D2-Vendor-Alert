import mongoose from 'mongoose'
import { config } from '../../config/config.js'

export class DatabaseService {
  /**
     * Establishes a connection to the MongoDB for the list of users waiting for an alert
     */
  async connectToDatabase (): Promise<void> {
    mongoose.set('strictQuery', false)
    await mongoose.connect(
      `mongodb+srv://${config.configModel.databaseUser}:${config.configModel.databasePassword}@${config.configModel.databaseCluster}.mongodb.net/${config.configModel.databaseName}`
    )
  }

  /**
     * Closes the connection to the MongoDB instance
     */
  async disconnectToDatabase (): Promise<void> {
    await mongoose.disconnect()
  }
}
