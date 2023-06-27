// @ts-check

import mongoose from 'mongoose'
import { config } from './../../config/config.js'

class DatabaseService {
    constructor() {}
    
    async connectToDatabase() {
        mongoose.set('strictQuery', false)
        await mongoose.connect(
          `mongodb+srv://${config.databaseUser}:${config.databasePassword}@${config.databaseCluster}.mongodb.net/${config.databaseName}`
        )
    }
    
    disconnectToDatabase() {
        mongoose.disconnect()
    }
}

export default DatabaseService
