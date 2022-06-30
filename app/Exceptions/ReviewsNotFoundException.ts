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
| new ReviewsNotFoundException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class ReviewsNotFoundException extends Exception {
  public status = 503
  public errorCode = 'E_REVIEWS_NOT_FOUND'

  public async handle(error: this, ctx: HttpContextContract) {
    ctx.response.status(error.status).send({ code: error.errorCode, message: error.message })
  }
}
