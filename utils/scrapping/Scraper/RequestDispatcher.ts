import Config from '@ioc:Adonis/Core/Config'
import wait from 'wait'
import { DateTime } from 'luxon'

export default class RequestDispatcher {
  private static NUM_CONCURRENT_THREADS = Config.get('scrapper.nbConcurrentThreads')
  private static DISPATCH_WAIT_TIME = Config.get('dispatcherWaitTime')
  private static ids = new Map<string, number>()

  public static async authorizeRequest(id: string) {
    if (this.NUM_CONCURRENT_THREADS <= 0) {
      this.abortWhenTimeIsUp(id)
      await wait(this.DISPATCH_WAIT_TIME)
      await this.authorizeRequest(id)
    } else {
      this.NUM_CONCURRENT_THREADS--
    }
  }

  public static informRequestEnd(id: string) {
    this.ids.delete(id)
    this.NUM_CONCURRENT_THREADS++
  }

  public static init(id: string) {
    const now = Date.now()
    this.ids.set(id, now)
  }

  private static abortWhenTimeIsUp(id: string) {
    if (this.isDurationExceeded(id)) {
      const error = new Error(
        'Due to too many requests at the same time or too few available threads, a bottleneck has formed and prevented this request from being executed.'
      )
      error.name = 'RequestDispatcher'
      throw error
    }
  }

  private static isDurationExceeded(id: string) {
    const timeStartOfRequest = this.ids.get(id) as number
    const durationString = DateTime.fromMillis(timeStartOfRequest)
      .diffNow('seconds')
      .toFormat('s', { floor: true })
    const duration = Math.abs(Number(durationString))
    return duration > 60
  }
}
