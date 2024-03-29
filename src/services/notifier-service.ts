import { UserRepository } from '../database/user-repository.js'
import axios from 'axios'
import { NotifierServiceConfig } from './config/notifier-service-config.js'
import logger from '../utility/logger.js'

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
      axios.post(
        String(this.config.address).concat(':3002/notify'),
        { user: user },
        { headers: { 'Content-Type': 'application/json' } }
      ).catch(
        (error) => logger.error(error)
      )
    }
  }
}
