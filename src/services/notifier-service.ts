import { UserRepository } from '../database/user-repository.js'

export class NotifierService {
  constructor (
    private readonly database: UserRepository
  ) { }

  /**
   * Alert registered users about today's vendor inventory
   */
  async alertUsersOfUnownedModsForSale (): Promise<void> {
    for await (const user of await this.database.fetchAllUsers()) {
      // await this.checkRefreshTokenExpiration(user)
      // await this.compareModsForSaleWithUserInventory(user)
      console.log(user)

      // call notifier api
    }
  }
}
