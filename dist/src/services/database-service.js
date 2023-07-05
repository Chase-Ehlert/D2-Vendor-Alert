import mongoose from 'mongoose';
export class DatabaseService {
    constructor(config) {
        this.config = config;
    }
    /**
       * Establishes a connection to the MongoDB for the list of users waiting for an alert
       */
    async connectToDatabase() {
        mongoose.set('strictQuery', false);
        await mongoose.connect(`mongodb+srv://${this.config.configModel.databaseUser}:${this.config.configModel.databasePassword}@${this.config.configModel.databaseCluster}.mongodb.net/${this.config.configModel.databaseName}`);
    }
    /**
       * Closes the connection to the MongoDB instance
       */
    async disconnectToDatabase() {
        await mongoose.disconnect();
    }
}
//# sourceMappingURL=database-service.js.map