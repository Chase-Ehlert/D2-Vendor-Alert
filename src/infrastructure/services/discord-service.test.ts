import { MongoUserRepository } from '../database/mongo-user-repository'
import { AxiosHttpClient } from '../database/axios-http-client'
import { UserInterface } from '../../domain/user'
import axios from 'axios'
import { DestinyApiClientConfig } from '../destiny/destiny-api-client-config'
import { DiscordConfig } from '../../presentation/discord/discord-config'
import { DestinyApiClient } from '../destiny/destiny-api-client'
import { Vendor } from '../destiny/vendor'
import { DiscordService } from './discord-service'

jest.mock('./../../testing-helpers/url', () => {
  return 'example'
})

describe('DiscordService', () => {
  const destinyApiClient = new DestinyApiClient(
    new AxiosHttpClient(),
    new MongoUserRepository(),
    {} satisfies DestinyApiClientConfig
  )
  const vendor = new Vendor(destinyApiClient)
  const expectedToken = '123Token'
  const discordService = new DiscordService(
    vendor,
    new AxiosHttpClient(),
      { token: expectedToken } satisfies DiscordConfig
  )

  it('should message a user if they have any unowned mods', async () => {
    const user = {
      discordId: 'CoolGuy123',
      discordChannelId: 'coolGuysServer'
    } as unknown as UserInterface
    const modName1 = 'Sword of Hyrule'
    const modName2 = 'Shield of Galanor'
    const expectedUnownedMods = [modName1, modName2]
    const expectedMessage =
    `<@${user.discordId}>\r\nYou have these unowned mods for sale, grab them!\r\n${modName1}\r\n${modName2}`
    const expectedPostUrl = `https://discord.com/api/v10/channels/${user.discordChannelId}/messages`
    const expectedPostData = { content: expectedMessage }
    const expectedPostConfig = {
      headers: {
        Authorization: `Bot ${expectedToken}`,
        'Content-Type': 'application/json'
      }
    }

    jest.spyOn(vendor, 'getUnownedModsForSaleByAda').mockResolvedValue(expectedUnownedMods)
    axios.post = jest.fn().mockResolvedValue({ status: 200 })

    await discordService.compareModsForSaleWithUserInventory(user)

    expect(axios.post).toHaveBeenCalledWith(expectedPostUrl, expectedPostData, expectedPostConfig)
  })

  it('should update a user if they have no unowned mods', async () => {
    const user = {
      discordChannelId: 'coolGuysServer',
      bungieUsername: 'someUsername'
    } as unknown as UserInterface
    const expectedUnownedMods: string[] = []
    const expectedMessage =
    `${user.bungieUsername} does not have any unowned mods for sale today.`
    const expectedPostUrl = `https://discord.com/api/v10/channels/${user.discordChannelId}/messages`
    const expectedPostData = { content: expectedMessage }
    const expectedPostConfig = {
      headers: {
        Authorization: `Bot ${expectedToken}`,
        'Content-Type': 'application/json'
      }
    }

    jest.spyOn(vendor, 'getUnownedModsForSaleByAda').mockResolvedValue(expectedUnownedMods)
    axios.post = jest.fn().mockResolvedValue({ status: 200 })

    await discordService.compareModsForSaleWithUserInventory(user)

    expect(axios.post).toHaveBeenCalledWith(expectedPostUrl, expectedPostData, expectedPostConfig)
  })
})
