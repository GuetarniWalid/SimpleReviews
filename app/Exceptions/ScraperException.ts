import { Exception } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Sentry from '@ioc:Provider/Sentry'

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new ScraperException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class ScraperException extends Exception {
  public errorCode = 'E_SCRAPER'

  constructor(message: string, status?: number, isCritical = false) {
    super(message, status, 'E_SCRAPER')
    if (isCritical) this.name = 'CriticalScraperException'
  }

  public async handle(error: this, ctx: HttpContextContract) {
    ctx.response.status(error.status).send({ code: error.errorCode, message: error.message })
  }

  public async report(error: any) {
    Sentry.captureException(error)
  }
}
