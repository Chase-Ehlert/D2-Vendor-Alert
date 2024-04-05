import { RequestHandler } from 'express'
import { NotifierService } from '../../infrastructure/services/notifier-service.js'

export class AlertManager {
  constructor (private readonly notifierService: NotifierService) {}

  /**
 * Calculates the time till the next Destiny daily reset and waits till then to alert users of vendor inventory
 */
  dailyReset (): void {
    const resetTime = new Date()

    if (
      resetTime.getUTCHours() >= 17 &&
    resetTime.getUTCMinutes() >= 1 &&
    resetTime.getUTCSeconds() >= 0 &&
    resetTime.getUTCMilliseconds() > 0
    ) {
      resetTime.setDate(resetTime.getDate() + 1)
    }
    resetTime.setUTCHours(17)
    resetTime.setUTCMinutes(1)
    resetTime.setUTCSeconds(0)
    resetTime.setUTCMilliseconds(0)

    const waitTime = resetTime.getTime() - Date.now()
    setTimeout((async () => {
      await this.beginAlerting()
    }) as RequestHandler, waitTime)
  }

  /**
 * Begin the alert workflow for users and then set the time till the next daily reset
 */
  private async beginAlerting (): Promise<void> {
    await this.notifierService.alertUsersOfUnownedModsForSale()
    this.dailyReset()
  }
}
