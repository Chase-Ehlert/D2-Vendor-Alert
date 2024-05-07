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
      await this.httpClient.post(
        String(this.config.address).concat(':3002/notify'),
        { user: user },
        { headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
}
