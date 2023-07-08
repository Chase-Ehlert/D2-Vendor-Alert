import mongoose from 'mongoose';
import { config } from '../../config/config.js';
export class DatabaseService {
    /**
       * Establishes a connection to the MongoDB for the list of users waiting for an alert
       */
    async connectToDatabase() {
        mongoose.set('strictQuery', false);
        await mongoose.connect(`mongodb+srv://${config.configModel.databaseUser}:${config.configModel.databasePassword}@${config.configModel.databaseCluster}.mongodb.net/${config.configModel.databaseName}`);
    }
    /**
       * Closes the connection to the MongoDB instance
       */
    async disconnectToDatabase() {
        await mongoose.disconnect();
    }
}
//# sourceMappingURL=database-service.js.map