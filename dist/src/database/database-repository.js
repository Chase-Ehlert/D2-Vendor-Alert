import { Config } from '../../config/config.js';
import { DatabaseService } from '../services/database-service.js';
import { UserSchema } from './models/user-schema.js';
const databaseService = new DatabaseService(new Config());
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
    async addUser(bungieNetUsername, bungieNetUsernameCode, discordId, discordChannelId) {
        const user = new UserSchema({
            bungie_username: bungieNetUsername,
            bungie_username_code: bungieNetUsernameCode,
            discord_id: discordId,
            discord_channel_id: discordChannelId
        });
        await databaseService.connectToDatabase();
        await user.save();
        await databaseService.disconnectToDatabase();
    }
    /**
       * Updates the database information for a specific user using their Bungie username
       */
    async updateUserByUsername(bungieUsername, refreshExpirationTime, refreshToken, destinyId, characterId) {
        const daysTillTokenExpires = Number(refreshExpirationTime) / 60 / 60 / 24;
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + daysTillTokenExpires);
        await databaseService.connectToDatabase();
        await UserSchema.updateOne({ bungie_username: bungieUsername }, {
            $set: {
                destiny_id: destinyId,
                destiny_character_id: characterId,
                refresh_expiration: expirationDate.toISOString(),
                refresh_token: refreshToken
            }
        });
        await databaseService.disconnectToDatabase();
    }
    /**
       * Updates the database information for a specific user using their Bungie membership id
       */
    async updateUserByMembershipId(bungieMembershipId, refreshExpirationTime, refreshToken) {
        const daysTillTokenExpires = Number(refreshExpirationTime) / 60 / 60 / 24;
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + daysTillTokenExpires);
        await databaseService.connectToDatabase();
        await UserSchema.updateOne({ bungie_membership_id: bungieMembershipId }, {
            $set: {
                refresh_expiration: expirationDate.toISOString(),
                refresh_token: refreshToken
            }
        });
        await databaseService.disconnectToDatabase();
    }
}
//# sourceMappingURL=database-repository.js.map