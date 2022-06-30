import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class LogFirstname extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'log:names'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = 'Log all names from a country'

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest`
     * afterwards.
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  }

  public async run() {
    const { default: Country } = await import('App/Models/Country')

    const countries = await Country.all()
    const countryNames = countries.map((country) => country.nameFr)

    const countrySelected = await this.prompt.choice('Choose a country', countryNames)
    const genderSelected = await this.prompt.choice('Choose a gender', ['male', 'female'])
    const DBName = genderSelected === 'male' ? 'maleNames' : 'femaleNames'

    const country = await Country.findBy('nameFr', countrySelected)
    await country?.load(DBName)

    const namesUnserialize = country?.[DBName]
    const names = namesUnserialize?.map((nameUnserialize) => nameUnserialize.serialize())

    this.saveInFile(names)
  }

  private async saveInFile(names) {
    const fs = await import('fs')
    const directoryPath = await this.getNamesPath()
    const fileToSave = directoryPath + '/temp.json'

    //save
    fs.writeFileSync(fileToSave, JSON.stringify(names))
  }

  private async getNamesPath() {
    const Application = await import('@ioc:Adonis/Core/Application')
    //@ts-ignore
    const root = Application.appRoot as string
    return root + '/seedData'
  }
}
