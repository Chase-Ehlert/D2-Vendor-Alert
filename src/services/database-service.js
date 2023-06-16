// @ts-check

import mongoose from 'mongoose'
import { config } from './../../config/config.js'

class DatabaseService {
    constructor() {}
    
    async connectToDatabase() {
        mongoose.set('strictQuery', false)
        mongoose.connect(
          `mongodb+srv://${config.databaseUser}:${config.databasePassword}@${config.databaseCluster}.mongodb.net/${config.databaseName}`
        )
        console.log('Successfully connected to the database!')
    }
    
    async disconnectToDatabase() {
        mongoose.disconnect()
        console.log('Successfully disconnected to the database!')
    }
}

export default DatabaseService