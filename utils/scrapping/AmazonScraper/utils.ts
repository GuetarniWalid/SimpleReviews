export class AmazonScraperUtils {
  private baseURL = 'https://www.amazon.com/'
  private pageTag = '/product-reviews/'
  private endURL =
    '/ref=cm_cr_getr_d_paging_btm_prev_1?ie=UTF8&reviewerType=all_reviews&pageNumber='

  public formatURL(url: string) {
    const urlSplitted = url.split('/')
    const indexOfAmazonDomain = urlSplitted.findIndex((urlPart) => urlPart.includes('.amazon.'))
    const productName = urlSplitted[indexOfAmazonDomain + 1]
    const productId = urlSplitted[indexOfAmazonDomain + 3]

    return this.baseURL + productName + this.pageTag + productId + this.endURL
  }

  public extractYearFromString(text: string) {
    const regex = /\d{4}/
    const found = text.match(regex)
    return found ? found[0] : null
  }

  public extractMonthFromString(text: string) {
    const textSplitted = text.split(' ')
    const monthString = textSplitted[textSplitted.length - 3]
    return this.getMonthFromString(monthString)
  }

  private getMonthFromString(mounthString) {
    var d = Date.parse(mounthString + '1, 2012')
    if (!isNaN(d)) {
      return new Date(d).getMonth() + 1
    }
    return -1
  }

  public extractDayFromString(text: string) {
    const regex = /\d{1,2}/
    const found = text.match(regex)
    return found ? found[0] : null
  }
}
