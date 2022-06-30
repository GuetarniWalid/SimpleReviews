import Application from '@ioc:Adonis/Core/Application'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import FemaleName from 'App/Models/FemaleName'
import fs from 'fs'

export default class extends BaseSeeder {
  public async run() {
    const directoryWithJsons = Application.appRoot + '/seedData/namesByCountryAndGenderInJSON'
    const files = fs.readdirSync(directoryWithJsons)

    const promisesOfArraysOfNames = files.map(async (file) => {
      const { default: arrayOfNames } = await import(`${directoryWithJsons}/${file}`)
      return arrayOfNames
    })

    const arraysOfNames = await Promise.all(promisesOfArraysOfNames)
    const arraysOfFemales = arraysOfNames.map((arrayOfNames) => {
      const females = arrayOfNames.filter((person) => {
        return person.gender === 'F'
      })
      const femalesFormatted = females.map(({ firstname, lastname, countryIso }) => ({
        firstname,
        lastname,
        countryCode: countryIso,
      }))
      return femalesFormatted
    })

    const promisesOfBackupInDatabase = arraysOfFemales.map(async (arrayOfFemales) => {
      await FemaleName.createMany(arrayOfFemales)
    })

    await Promise.all(promisesOfBackupInDatabase)
  }
}
