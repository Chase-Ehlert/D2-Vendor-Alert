export class RefreshTokenInfo {
  constructor (
    public bungieMembershipId: string,
    public refreshTokenExpirationTime: string,
    public refreshToken: string,
    public accessToken?: string
  ) { }
}
