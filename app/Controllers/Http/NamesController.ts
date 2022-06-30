import BadNamesParamException from 'App/Exceptions/BadNamesParamException'
import Country from 'App/Models/Country'

type Gender = 'male' | 'female' | 'mixte'
type Count = number | 'all'
type PropertyNamesToLoad = ('maleNames' | 'femaleNames')[]

export default class NamesController {
  public async index({ params }) {
    const { countryCode, gender, count } = params as {
      countryCode: string
      gender: string
      count: string | undefined
    }

    this.checkGender(gender)
    const countFormatted = this.formatCount(count)
    const country = await this.getCountry(countryCode)
    await this.populateCountryWithNames(country, gender as Gender, countFormatted as Count)
    return country
  }

  private formatCount(count: string | undefined) {
    //@ts-ignore
    const countFormatted = parseInt(count)
    return isNaN(countFormatted) ? 'all' : countFormatted
  }

  private checkGender(gender: string) {
    if (gender !== 'male' && gender !== 'female' && gender !== 'mixte') {
      throw new BadNamesParamException(
        `bad gender, the type ${gender} is incompatible with types male, female or mixte`
      )
    }
  }

  private async getCountry(countryCode: string) {
    try {
      const country = await Country.find(countryCode)
      if (!country) throw new Error()
      return country
    } catch (error) {
      throw new BadNamesParamException(
        `bad country code, the code ${countryCode} does not match any supported country`
      )
    }
  }

  private async populateCountryWithNames(country: Country, gender: Gender, count: Count) {
    let propertyNamesToLoad: PropertyNamesToLoad
    switch (gender) {
      case 'male':
        propertyNamesToLoad = ['maleNames']
        break
      case 'female':
        propertyNamesToLoad = ['femaleNames']
        break
      case 'mixte':
        propertyNamesToLoad = ['maleNames', 'femaleNames']
        break
    }

    await Promise.all(
      propertyNamesToLoad.map((propertyNameToLoad) => {
        return country.load(propertyNameToLoad, this.limitFunc(count, gender))
      })
    )
  }

  private limitFunc(count: Count, gender: Gender) {
    if (count === 'all') {
      return
    } else {
      if (gender === 'mixte') count /= 2 //half of each sex in this case
      return (queryBuilder) => {
        queryBuilder.limit(count)
      }
    }
  }
}
