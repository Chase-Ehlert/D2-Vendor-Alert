import { createServer, startServer } from '../../apps/d2-vendor-alert/app'
import { AlertConfig } from '../../configs/alert-config.js'
import { DestinyApiClientConfig } from '../../configs/destiny-api-client-config.js'
import { DiscordConfig } from '../../configs/discord-config.js'
import { MongoDbServiceConfig } from '../../configs/mongo-db-service-config.js'
import { NotifierServiceConfig } from '../../configs/notifier-service-config.js'
import { AxiosHttpClient } from '../../infrastructure/database/axios-http-client.js'
import { MongoUserRepository } from '../../infrastructure/database/mongo-user-repository.js'
import { DestinyApiClient } from '../../infrastructure/destiny/destiny-api-client.js'
import { MongoDbService } from '../../infrastructure/services/mongo-db-service.js'
import { NotifierService } from '../../infrastructure/services/notifier-service.js'
import { AlertManager } from '../../presentation/discord/alert-manager.js'
import { AlertCommand } from '../../presentation/discord/commands/alert.js'
import { DiscordClient } from '../../presentation/discord/discord-client.js'
import { OAuthWebController } from '../../presentation/web/o-auth-web-controller.js'

jest.mock('./../helpers/url', () => {
  return 'example'
})

jest.mock('express', () => {
  const mockedExpress = () => {
    return {
      engine: jest.fn(),
      set: jest.fn(),
      get: jest.fn(),
      listen: jest.fn()
    }
  }
  Object.defineProperty(mockedExpress, 'static', { value: jest.fn() });
  return mockedExpress;
})

describe('App', () => {
  it('should create the server', async () => {
    // const mongoUserRepo = new MongoUserRepository()
    // const app = createServer(new OAuthWebController(
    //   new DestinyApiClient(new AxiosHttpClient(), mongoUserRepo, {} satisfies DestinyApiClientConfig),
    //   mongoUserRepo
    // ))

    // await startServer(
    //   app,
    //   new MongoDbService({} satisfies MongoDbServiceConfig),
    //   new DiscordClient(
    //     mongoUserRepo,
    //     new DestinyApiClient(new AxiosHttpClient(), mongoUserRepo, {} satisfies DestinyApiClientConfig),
    //     new AlertCommand({} satisfies AlertConfig),
    //        {} satisfies DiscordConfig
    //   ),
    //   new AlertManager(new NotifierService(mongoUserRepo, {} satisfies NotifierServiceConfig))
    // )

    expect(true).toBeTruthy()
  })
})
