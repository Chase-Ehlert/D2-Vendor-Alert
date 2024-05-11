import { DiscordConfigClass } from './discord-config-class.js'

describe('DiscordConfigClass', () => {
  it('should return DiscordConfigClass from static fromConfig()', () => {
    const expectedToken = 'token'
    const expectedDiscordConfigClass = new DiscordConfigClass(
      expectedToken
    )

    expect(DiscordConfigClass.fromConfig(
      {
        DISCORD_TOKEN: expectedToken
      }
    )).toStrictEqual(expectedDiscordConfigClass)
  })
})
