import Env from '@ioc:Adonis/Core/Env'

const scraperConfig = {
  apiKey: Env.get('SCRAPER_API_KEY'),
  endpoint: 'http://api.scraperapi.com', //api url of scraperApi
  nbConcurrentThreads: 5, //equals the number of simultaneous requests
  maxRetry: 5, //max request attempt before throw an error
  timeBetweenRequests: 3000, //when request fail
  dispatcherWaitTime: 200, //when threads are all used, wait time until next attempt
}

export default scraperConfig
