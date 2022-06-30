import BadReviewsUrlException from 'App/Exceptions/BadReviewsUrlException'
import { AmazonScraper } from 'Utils/scrapping/AmazonScraper/index'

export default class ReviewsController {
  public async index({ params, request }) {
    switch (params.source) {
      case 'aliExpress':
        break
      default:
        return await this.scrapefromAmazon(request.input('url'))
    }
  }

  private async scrapefromAmazon(url: string | undefined) {
    this.checkParams(url, 'amazon')

    const scraper = new AmazonScraper(url!)
    const reviews = (await scraper.launch()).getReviews()
    return reviews
  }

  private checkParams(url: string | undefined, keyword: string) {
    if (!url || !url.includes(keyword))
      throw new BadReviewsUrlException(`This url "${url}" is not a valid url`)
  }
}
