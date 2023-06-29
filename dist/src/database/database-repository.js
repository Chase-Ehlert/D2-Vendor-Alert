import { DatabaseService } from '../services/database-service.js';
import { UserSchema } from './models/user-schema.js';
const databaseService = new DatabaseService();
export class DatabaseRepository {
    /**
       * Checks if user exists in database
       */
    async doesUserExist(bungieNetUsername) {
        await databaseService.connectToDatabase();
        const doesUserExist = !((await UserSchema.exists({ bungie_username: bungieNetUsername }).exec()) == null);
        await databaseService.disconnectToDatabase();
        return doesUserExist;
    }
    /**
       * Adds the specified user's information to the database
       */
    async addUser(bungieNetUsername, discordId, discordChannelId) {
        const user = new UserSchema({
            bungie_username: bungieNetUsername,
            discord_id: discordId,
            discord_channel_id: discordChannelId
        });
        await databaseService.connectToDatabase();
        await user.save();
        await databaseService.disconnectToDatabase();
    }
    /**
       * Updates the database information for a specific user
       */
    async updateUser(bungieMembershipId, refreshExpirationTime, refreshToken, destinyId, characterId) {
        const daysTillTokenExpires = Number(refreshExpirationTime) / 60 / 60 / 24;
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + daysTillTokenExpires);
        await databaseService.connectToDatabase();
        await UserSchema.updateOne({ bungie_membership_id: bungieMembershipId }, {
            $set: {
                destiny_id: destinyId,
                destiny_character_id: characterId,
                refresh_expiration: expirationDate.toISOString(),
                refresh_token: refreshToken
            }
        });
        await databaseService.disconnectToDatabase();
    }
}
//# sourceMappingURL=database-repository.js.map