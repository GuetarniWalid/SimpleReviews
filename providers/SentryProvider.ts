import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'
import Config from '@ioc:Adonis/Core/Config'

/*
|--------------------------------------------------------------------------
| Provider
|--------------------------------------------------------------------------
|
| Your application is not ready when this file is loaded by the framework.
| Hence, the top level imports relying on the IoC container will not work.
| You must import them inside the life-cycle methods defined inside
| the provider class.
|
| @example:
|
| public async ready () {
|   const Database = this.app.container.resolveBinding('Adonis/Lucid/Database')
|   const Event = this.app.container.resolveBinding('Adonis/Core/Event')
|   Event.on('db:query', Database.prettyPrint)
| }
|
*/
export default class SentryProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    this.app.container.singleton('Provider/Sentry', () => {
      return { ...Sentry }
    })
  }

  public async boot() {
    const config: typeof Config = this.app.container.use('Adonis/Core/Config')
    Sentry.init(config.get('sentry'))
  }

  public async ready() {
    // App is ready
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
