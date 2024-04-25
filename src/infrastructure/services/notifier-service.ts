import { UserRepository } from '../../domain/user-repository'
import axios from 'axios'
import { NotifierServiceConfig } from '../../configs/notifier-service-config'

export class NotifierService {
  constructor (
    private readonly database: UserRepository,
    private readonly config: NotifierServiceConfig
  ) { }

  /**
   * Alert registered users about today's vendor inventory
   */
  async alertUsersOfUnownedModsForSale (): Promise<void> {
    for await (const user of await this.database.fetchAllUsers()) {
      await axios.post(
        String(this.config.address).concat(':3002/notify'),
        { user: user },
        { headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
}
