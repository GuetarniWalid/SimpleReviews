declare module '@ioc:Provider/Sentry' {
  interface Sentry {
    captureException: (error: any) => void
  }

  const Sentry: Sentry

  export default Sentry
}
