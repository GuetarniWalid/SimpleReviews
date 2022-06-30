import Application from '@ioc:Adonis/Core/Application'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import MaleName from 'App/Models/MaleName'
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
    const arraysOfMales = arraysOfNames.map((arrayOfNames) => {
      const males = arrayOfNames.filter((person) => {
        return person.gender === 'M'
      })
      const malesFormatted = males.map(({ firstname, lastname, countryIso }) => ({
        firstname,
        lastname,
        countryCode: countryIso,
      }))
      return malesFormatted
    })

    const promisesOfBackupInDatabase = arraysOfMales.map(async (arrayOfMales) => {
      await MaleName.createMany(arrayOfMales)
    })

    await Promise.all(promisesOfBackupInDatabase)
  }
}
