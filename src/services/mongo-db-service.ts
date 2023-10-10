import mongoose from 'mongoose'
import logger from '../utility/logger.js'
import { MongoDbServiceConfig } from './config/mongo-db-service-config.js'

export class MongoDbService {
  constructor (private readonly config: MongoDbServiceConfig) { }

  /**
     * Establishes a connection to the MongoDB for the list of users waiting for an alert
     */
  async connectToDatabase (): Promise<void> {
    mongoose.set('strictQuery', false)
    await mongoose.connect(
      'mongodb+srv://' +
      `${String(this.config.databaseUser)}:` +
      `${String(this.config.databasePassword)}@` +
      `${String(this.config.databaseCluster)}.mongodb.net/` +
      String(this.config.databaseName)
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
