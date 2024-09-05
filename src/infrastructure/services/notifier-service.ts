import { NotifierServiceConfig } from './configs/notifier-service-config.js'
import { HttpClient } from '../persistence/http-client.js'
import { MongoUserRepository } from '../persistence/mongo-user-repository.js'

export class NotifierService {
  constructor (
    private readonly database: MongoUserRepository,
    private readonly config: NotifierServiceConfig,
    private readonly httpClient: HttpClient
  ) { }

  /**
   * Alert registered users about today's vendor inventory
   */
  async alertUsersOfUnownedModsForSale (): Promise<void> {
    if (this.config.address !== undefined) {
      for await (const user of await this.database.fetchAllUsers()) {
        try {
          await this.httpClient.post(
            this.config.address + ':3002/notify',
            { user: user },
            { headers: { 'Content-Type': 'application/json' } }
          )
        } catch (error) {
          console.error(`Failed to alert user ${user.bungieUsername}`)
          console.error(error.stack)
        }
      }
    } else {
      throw new Error('Notifier address is undefined!')
    }
  }
}
