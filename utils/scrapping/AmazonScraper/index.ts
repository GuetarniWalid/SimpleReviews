import { HTMLElement, parse } from 'node-html-parser'
import ReviewsNotFoundException from 'App/Exceptions/ReviewsNotFoundException'
import { AmazonScraperUtils } from 'Utils/scrapping/AmazonScraper/utils'
import { DateTime } from 'luxon'
import Scraper from '../Scraper'

export class AmazonScraper extends Scraper {
  private utils: AmazonScraperUtils
  private reviewsUrlFormatdWithoutPagination: string
  private pagination: number
  private page: HTMLElement

  constructor(private reviewsUrlBrut: string) {
    super()
    this.utils = new AmazonScraperUtils()
    this.reviewsUrlFormatdWithoutPagination = this.utils.formatURL(reviewsUrlBrut)
    this.pagination = 1
  }

  protected get reviewsUrl(): string {
    return this.reviewsUrlFormatdWithoutPagination + this.pagination
  }

  public async launch() {
    const html = await this.fetch()
    this.page = parse(html)
    return this
  }

  public getReviews() {
    const reviewsList = this.getReviewsList()
    return reviewsList.map((review) => {
      return {
        name: this.getReviewName(review),
        rate: this.getReviewRate(review),
        title: this.getReviewTitle(review),
        date: this.getReviewDate(review),
        text: this.gatReviewText(review),
        images: this.getReviewsImages(review),
      }
    })
  }

  private getReviewsList() {
    if (!this.page.querySelector('#cm_cr-review_list')?.querySelectorAll('.review'))
      throw new ReviewsNotFoundException(
        `Reviews not found from this amazon url => ${this.reviewsUrlBrut}`
      )
    return this.page.querySelector('#cm_cr-review_list')!.querySelectorAll('.review')
  }

  private getReviewName(review: HTMLElement) {
    const nameElem = review.querySelector('.a-profile-name')
    return nameElem?.rawText
  }

  private getReviewRate(review: HTMLElement) {
    if (!review.querySelector('.review-rating')) return null
    const classListSet = review.querySelector('.review-rating')!.classList.values()
    const classList = Array.from(classListSet)

    const stringBeforeRate = 'a-star-'
    const stringContainingRate = classList.find((className) => className.includes(stringBeforeRate))
    if (!stringContainingRate) return null
    const rate = stringContainingRate.split(stringBeforeRate)[1]
    return rate
  }

  private getReviewTitle(review: HTMLElement) {
    const titleElem = review.querySelector('.review-title span')
    return titleElem?.rawText
  }

  private getReviewDate(review: HTMLElement) {
    if (!review.querySelector('.review-date')) return null
    const content = review.querySelector('.review-date')!.rawText
    const year = this.utils.extractYearFromString(content)
    const month = this.utils.extractMonthFromString(content)
    const day = this.utils.extractDayFromString(content)
    const date = `${day}/${month}/${year}`

    const dateToVerif = DateTime.fromFormat(date, 'd/M/y')
    if (!DateTime.isDateTime(dateToVerif)) return null

    return `${day}/${month}/${year}`
  }

  private gatReviewText(review: HTMLElement) {
    const textElem = review.querySelector('.review-text')
    return textElem?.innerHTML.trim()
  }

  private getReviewsImages(review: HTMLElement) {
    const imagesContainerElem = review.querySelector('.review-image-container')
    const imageElems = imagesContainerElem?.querySelectorAll('img')
    const imageSources = imageElems?.map((imageElem) => imageElem.attrs.src)
    return imageSources ?? null
  }
}
