import { MongoDbServiceConfig } from './mongo-db-service-config.js'
import mongoose from 'mongoose'

export class MongoDbService {
  constructor (private readonly config: MongoDbServiceConfig) { }

  /**
     * Establishes a connection to the MongoDB for the list of users waiting for an alert
     */
  async connectToDatabase (): Promise<void> {
    if (this.config.mongoUri !== undefined) {
      mongoose.set('strictQuery', false)
      await mongoose.connect(this.config.mongoUri)
      console.log('Database connection set')
    } else {
      throw new Error('Mongo URI is undefined in MongoDbService!')
    }
  }

  /**
     * Closes the connection to the MongoDB instance
     */
  async disconnectToDatabase (): Promise<void> {
    await mongoose.disconnect()
  }
}
