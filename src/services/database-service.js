// @ts-check

import mongoose from 'mongoose'
import { config } from './../../config/config.js'

class DatabaseService {
    constructor() {}
    
    /**
     * Establishes a connection to the MongoDB for the list of users waiting for an alert
     */
    async connectToDatabase() {
        mongoose.set('strictQuery', false)
        await mongoose.connect(
          `mongodb+srv://${config.databaseUser}:${config.databasePassword}@${config.databaseCluster}.mongodb.net/${config.databaseName}`
        )
    }
    
    /**
     * Closes the connection to the MongoDB instance
     */
    disconnectToDatabase() {
        mongoose.disconnect()
    }
}

export default DatabaseService
