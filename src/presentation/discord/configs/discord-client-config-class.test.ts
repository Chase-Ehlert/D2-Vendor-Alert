import { DiscordClientConfigClass } from './discord-client-config-class.js'

describe('DiscordClientConfigClass', () => {
  it('should return DiscordClientConfigClass from static fromConfig()', () => {
    const expectedToken = 'token'
    const expectedDiscordClientConfigClass = new DiscordClientConfigClass(
      expectedToken
    )

    expect(DiscordClientConfigClass.fromConfig(
      {
        DISCORD_TOKEN: expectedToken
      }
    )).toStrictEqual(expectedDiscordClientConfigClass)
  })
})
