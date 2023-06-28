export class User {
    bungieUsername;
    discordId;
    discordChannelId;
    bungieMembershipId;
    destinyId;
    destinyCharacterId;
    refreshExpiration;
    refreshToken;
    constructor(bungieUsername, discordId, discordChannelId, bungieMembershipId, destinyId, destinyCharacterId, refreshExpiration, refreshToken) {
        this.bungieUsername = bungieUsername;
        this.discordId = discordId;
        this.discordChannelId = discordChannelId;
        this.bungieMembershipId = bungieMembershipId;
        this.destinyId = destinyId;
        this.destinyCharacterId = destinyCharacterId;
        this.refreshExpiration = refreshExpiration;
        this.refreshToken = refreshToken;
    }
}
//# sourceMappingURL=user.js.map