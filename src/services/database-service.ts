import mongoose from 'mongoose'
import { Config } from '../../config/config.js'

export class DatabaseService {
  public readonly config

  constructor (config: Config) {
    this.config = config
  }

  /**
     * Establishes a connection to the MongoDB for the list of users waiting for an alert
     */
  async connectToDatabase (): Promise<void> {
    mongoose.set('strictQuery', false)
    await mongoose.connect(
      `mongodb+srv://${this.config.configModel.databaseUser}:${this.config.configModel.databasePassword}@${this.config.configModel.databaseCluster}.mongodb.net/${this.config.configModel.databaseName}`
    )
  }

  /**
     * Closes the connection to the MongoDB instance
     */
  async disconnectToDatabase (): Promise<void> {
    await mongoose.disconnect()
  }
}
