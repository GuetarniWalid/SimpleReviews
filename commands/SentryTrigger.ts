import { BaseCommand } from '@adonisjs/core/build/standalone'
import wait from 'wait'

export default class SentryTrigger extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'sentry:trigger'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = 'Trigger a test error'

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest`
     * afterwards.
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  }

  public async run() {
    //@ts-ignore
    const Sentry: Sentry = await import('@ioc:Provider/Sentry')

    try {
      //@ts-ignore
      foo()
    } catch (e) {
      await Sentry.captureException(e)
      await wait(3000)
    }
  }
}
