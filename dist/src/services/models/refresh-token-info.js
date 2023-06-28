export class RefreshTokenInfo {
    bungieMembershipId;
    refreshTokenExpirationTime;
    refreshToken;
    accessToken;
    constructor(bungieMembershipId, refreshTokenExpirationTime, refreshToken, accessToken) {
        this.bungieMembershipId = bungieMembershipId;
        this.refreshTokenExpirationTime = refreshTokenExpirationTime;
        this.refreshToken = refreshToken;
        this.accessToken = accessToken;
    }
}
//# sourceMappingURL=refresh-token-info.js.map