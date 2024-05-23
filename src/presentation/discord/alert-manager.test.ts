import { NotifierServiceConfig } from '../../infrastructure/services/configs/notifier-service-config.js'
import { MongoUserRepository } from '../../infrastructure/persistence/mongo-user-repository.js'
import { NotifierService } from '../../infrastructure/services/notifier-service'
import { AlertManager } from './alert-manager'
import { AxiosHttpClient } from '../../infrastructure/persistence/axios-http-client.js'

describe('AlertManager', () => {
  const notifierService = new NotifierService(new MongoUserRepository(), { address: '' } satisfies NotifierServiceConfig, new AxiosHttpClient())
  const alertManager = new AlertManager(notifierService)

  it('should call beginAlerting() at 17:01:00 UTC the next day when its after 17:01:00', () => {
    const expectedHours = 15
    const expectedMinutes = 0
    const expectedSeconds = 0
    const expectedMilliseconds = 0
    const mockDate = jest.fn()
    const mockDateNow = jest.fn()

    jest.useFakeTimers()
    mockDate.mockReturnValue(new Date(57600001))
    mockDateNow.mockReturnValue(new Date(140400000).getTime())
    global.Date = mockDate as any
    global.Date.now = mockDateNow
    notifierService.alertUsersOfUnownedModsForSale = jest.fn()

    alertManager.dailyReset(expectedHours, expectedMinutes, expectedSeconds, expectedMilliseconds)

    jest.advanceTimersByTime(0)

    expect(notifierService.alertUsersOfUnownedModsForSale).toHaveBeenCalled()
  })
})
