import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Country from 'App/Models/Country'
import countries from '../../seedData/countryByInitial.json'

export default class extends BaseSeeder {
  public async run() {
    const countryCodes = Object.keys(countries)

    const countriesFormat = countryCodes.map((code) => {
      return {
        code,
        nameEn: countries[code].en as string,
        nameFr: countries[code].fr as string,
      }
    })

    await Country.createMany(countriesFormat)
  }
}
