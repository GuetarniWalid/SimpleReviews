import { Exception } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new BadNamesParamException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class BadNamesParamException extends Exception {
  public status = 400
  public errorCode = 'E_BAD_NAMES_PARAMS'

  public async handle(error: this, ctx: HttpContextContract) {
    ctx.response.status(error.status).send({ code: error.errorCode, message: error.message })
  }
}
