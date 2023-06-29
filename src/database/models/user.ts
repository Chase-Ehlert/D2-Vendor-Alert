export class User {
  constructor (
    public bungieUsername: string,
    public bungieUsernameCode: string,
    public discordId: string,
    public discordChannelId: string,
    public bungieMembershipId: string,
    public destinyId: string,
    public destinyCharacterId: string,
    public refreshExpiration: string,
    public refreshToken: string
  ) {}
}
