export class TokenInfo {
  constructor (
    public readonly bungieMembershipId: string,
    public readonly refreshTokenExpirationTime: string,
    public readonly refreshToken: string,
    public readonly accessToken: string = ''
  ) {}
}
