import Env from '@ioc:Adonis/Core/Env'

export default {
  dsn: Env.get('SENTRY_DSN'),
  environment: Env.get('NODE_ENV'),
  tracesSampleRate: 1.0,
}
