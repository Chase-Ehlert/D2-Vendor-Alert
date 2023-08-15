import mongoose from 'mongoose'
import logger from '../utility/logger.js'
import { UserServiceConfig } from '../config/config.js'

export class UserService {
  private readonly config

  constructor (config: UserServiceConfig) {
    this.config = config
  }

  /**
     * Establishes a connection to the MongoDB for the list of users waiting for an alert
     */
  async connectToDatabase (): Promise<void> {
    mongoose.set('strictQuery', false)
    await mongoose.connect(
      `mongodb+srv://${this.config.databaseUser}:${this.config.databasePassword}@${this.config.databaseCluster}.mongodb.net/${this.config.databaseName}`
    )
    logger.info('Database connection set')
  }

  /**
     * Closes the connection to the MongoDB instance
     */
  async disconnectToDatabase (): Promise<void> {
    await mongoose.disconnect()
  }
}
