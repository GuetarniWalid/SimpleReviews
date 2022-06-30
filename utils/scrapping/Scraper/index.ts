import Config from '@ioc:Adonis/Core/Config'
import BadReviewsUrlException from 'App/Exceptions/BadReviewsUrlException'
import RequestException from 'App/Exceptions/RequestException'
import ScraperException from 'App/Exceptions/ScraperException'
import axios from 'axios'
import wait from 'wait'
import RequestDispatcher from './RequestDispatcher'
const short = require('short-uuid')

export default abstract class Scraper {
  private apiKey = Config.get('scrapper.apiKey')
  private scraperBaseUrl = Config.get('scrapper.endpoint')
  private MAX_RETRY = Config.get('scrapper.maxRetry')
  private TIME_BETWEEN_REQUESTS = Config.get('scrapper.timeBetweenRequests')
  private retryFetchCount = 0
  protected abstract get reviewsUrl(): string

  protected get urlToRequest() {
    return `${this.scraperBaseUrl}?api_key=${this.apiKey}&url=${this.reviewsUrl}`
  }

  protected async fetch() {
    const requestId = short.generate() as string
    try {
      RequestDispatcher.init(requestId)
      await RequestDispatcher.authorizeRequest(requestId)
      const response = await axios.get(this.urlToRequest)
      if (!response.data || response.data.length === 0) {
        const error = new Error()
        error.name = 'EmptyHtml'
        //@ts-ignored
        error.html = response.data
        throw error
      }
      return response.data
    } catch (error) {
      await this.handleErrors(error)
    } finally {
      RequestDispatcher.informRequestEnd(requestId)
    }
  }

  private async retryFetch() {
    if (this.retryFetchCount >= this.MAX_RETRY) {
      throw new ScraperException(
        `The scraper has reached its maximum number of attempts. Page requested => ${this.reviewsUrl}`
      )
    }
    this.retryFetchCount++
    await wait(this.TIME_BETWEEN_REQUESTS)
    await this.fetch()
  }

  private async handleErrors(error: any) {
    if (error.response) {
      await this.handleErrorFromScraperApi(error.response)
    } else if (error.request) {
      throw new ScraperException(
        `The request was made but no response from ScraperApi. Request url => ${this.urlToRequest}`,
        503
      )
    } else if (error.name === 'RequestDispatcher') {
      throw new ScraperException(`${error.message} Page requested => ${this.reviewsUrl}`, 409, true)
    } else if (error.name === 'EmptyHtml') {
      throw new ScraperException(
        `The html retuned from the scrapper is empty. 
      Page requested => ${this.reviewsUrl}
      Html returned => ${error.html}`,
        409
      )
    } else {
      throw new RequestException(error.message)
    }
  }

  private async handleErrorFromScraperApi(error) {
    const pageRequestedText = `. Page requested => ${this.reviewsUrl}`
    switch (error.status) {
      case 403: //You have used up all your API credits.
        throw new ScraperException(error.data + pageRequestedText, error.status, true)

      case 404: //Page requested does not exist.
        throw new BadReviewsUrlException(error.data + pageRequestedText, error.status)

      case 410: //Page requested is no longer available.
        await this.retryFetch()
        break

      case 429: //You are sending requests too fast, and exceeding your concurrency limit.
        await this.retryFetch()
        break

      case 500: //After retrying for 60 seconds, the API was unable to receive a successful response.
        throw new ScraperException(
          error.response.data + ` Page requested => ${this.reviewsUrl}`,
          error.status,
          true
        )

      default:
        throw new Error(error.data + pageRequestedText)
    }
  }
}
