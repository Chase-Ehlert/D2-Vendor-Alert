import { UserSchema } from './models/user-schema.js';
export class DatabaseRepository {
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    /**
       * Checks if user exists in database
       */
    async doesUserExist(bungieNetUsername) {
        await this.databaseService.connectToDatabase();
        const doesUserExist = !((await UserSchema.exists({ bungie_username: bungieNetUsername }).exec()) == null);
        await this.databaseService.disconnectToDatabase();
        return doesUserExist;
    }
    /**
       * Adds the specified user's information to the database
       */
    async addUser(user) {
        await this.databaseService.connectToDatabase();
        await user.save();
        await this.databaseService.disconnectToDatabase();
    }
    /**
       * Updates the database information for a specific user using their Bungie username
       */
    async updateUserByUsername(bungieUsername, refreshExpirationTime, refreshToken, destinyId, characterId) {
        const daysTillTokenExpires = Number(refreshExpirationTime) / 60 / 60 / 24;
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + daysTillTokenExpires);
        await this.databaseService.connectToDatabase();
        await UserSchema.updateOne({ bungie_username: bungieUsername }, {
            $set: {
                destiny_id: destinyId,
                destiny_character_id: characterId,
                refresh_expiration: expirationDate.toISOString().split('.')[0] + 'Z',
                refresh_token: refreshToken
            }
        });
        await this.databaseService.disconnectToDatabase();
    }
    /**
       * Updates the database information for a specific user using their Bungie membership id
       */
    async updateUserByMembershipId(bungieMembershipId, refreshExpirationTime, refreshToken) {
        const daysTillTokenExpires = Number(refreshExpirationTime) / 60 / 60 / 24;
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + daysTillTokenExpires);
        await this.databaseService.connectToDatabase();
        await UserSchema.updateOne({ bungie_membership_id: bungieMembershipId }, {
            $set: {
                refresh_expiration: expirationDate.toISOString().split('.')[0] + 'Z',
                refresh_token: refreshToken
            }
        });
        await this.databaseService.disconnectToDatabase();
    }
}
//# sourceMappingURL=database-repository.js.map