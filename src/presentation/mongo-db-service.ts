import mongoose from 'mongoose'
import { MongoDbServiceConfig } from '../configs/mongo-db-service-config.js'

export class MongoDbService {
  constructor (private readonly config: MongoDbServiceConfig) { }

  /**
     * Establishes a connection to the MongoDB for the list of users waiting for an alert
     */
  async connectToDatabase (): Promise<void> {
    mongoose.set('strictQuery', false)
    await mongoose.connect(String(this.config.mongoUri))
    console.log('Database connection set')
  }

  /**
     * Closes the connection to the MongoDB instance
     */
  async disconnectToDatabase (): Promise<void> {
    await mongoose.disconnect()
  }
}
