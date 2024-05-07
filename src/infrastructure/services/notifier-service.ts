import { UserRepository } from '../../domain/user-repository.js'
import { NotifierServiceConfig } from './notifier-service-config.js'
import { HttpClient } from '../../domain/http-client.js'

export class NotifierService {
  constructor (
    private readonly database: UserRepository,
    private readonly config: NotifierServiceConfig,
    private readonly httpClient: HttpClient
  ) { }

  /**
   * Alert registered users about today's vendor inventory
   */
  async alertUsersOfUnownedModsForSale (): Promise<void> {
    for await (const user of await this.database.fetchAllUsers()) {
      try {
        await this.httpClient.post(
          String(this.config.address) + ':3002/notify',
          { user: user },
          { headers: { 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error(`Failed to alert user ${user.bungieUsername}`)
        console.error(error.stack)
      }
    }
  }
}
