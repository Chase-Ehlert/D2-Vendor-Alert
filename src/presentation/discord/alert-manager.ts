import { RequestHandler } from 'express'
import { NotifierService } from '../../infrastructure/services/notifier-service'

export class AlertManager {
  constructor (private readonly notifierService: NotifierService) {}

  /**
 * Calculates the time till the next Destiny daily reset and waits
 * till then to alert users of vendor inventory
 */
  dailyReset (hours: number, minutes: number, seconds: number, milliseconds: number): void {
    const resetTime = new Date()

    if (
      resetTime.getUTCHours() >= hours &&
      resetTime.getUTCMinutes() >= minutes &&
      resetTime.getUTCSeconds() >= seconds &&
      resetTime.getUTCMilliseconds() > milliseconds
    ) {
      resetTime.setDate(resetTime.getDate() + 1)
    }
    resetTime.setUTCHours(hours)
    resetTime.setUTCMinutes(minutes)
    resetTime.setUTCSeconds(seconds)
    resetTime.setUTCMilliseconds(milliseconds)

    const waitTime = resetTime.getTime() - Date.now()
    setTimeout((async () => {
      await this.beginAlerting(hours, minutes, seconds, milliseconds)
    }) as RequestHandler, waitTime)
  }

  /**
 * Begin the alert workflow for users and then set the time till the next daily reset
 */
  private async beginAlerting (
    hours: number,
    minutes: number,
    seconds: number,
    milliseconds: number
  ): Promise<void> {
    await this.notifierService.alertUsersOfUnownedModsForSale()
    this.dailyReset(hours, minutes, seconds, milliseconds)
  }
}
