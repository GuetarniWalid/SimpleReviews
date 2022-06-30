import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class CsvToJson extends BaseCommand {
  private seedDirectory: string
  private countriesIso: string[]
  private nbOfMale: number
  private nbOfFemale: number
  public static commandName = 'csv:to_json'
  public static description = 'Convert all file of a directory with CSV files in JSON files'

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest`
     * afterwards.
     */
    loadApp: false,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  }

  public async run() {
    const filesToConvertPaths = await this.getFilesToConvertPaths()

    for (const filePath of filesToConvertPaths) {
      const json = await this.convertCSVToJson(filePath)
      const response = await this.saveInJson(filePath, json)
      console.log(response)
    }
    return 'All files saved successfully'
  }

  private async getFilesToConvertPaths() {
    const fs = await import('fs')
    const directoryParentPath = await this.getDirectoryParentPath()
    const directoryToConvertPath = directoryParentPath + '/namesByCountryAndGenderInCSV'
    const filesToConvertible = fs.readdirSync(directoryToConvertPath)

    const toConvert = await this.prompt.choice('What do you want to convert ?', [
      'all',
      ...filesToConvertible,
    ])
    const filesToConvert = toConvert === 'all' ? filesToConvertible : [toConvert]

    const filesToConvertPaths = filesToConvert.map((fileToConvert) => {
      return directoryToConvertPath + '/' + fileToConvert
    })
    return filesToConvertPaths
  }

  private async getDirectoryParentPath() {
    const Application = await import('@ioc:Adonis/Core/Application')
    //@ts-ignore
    const root = Application.appRoot as string
    this.seedDirectory = root + '/seedData'
    return this.seedDirectory
  }

  private async convertCSVToJson(filePath) {
    this.resetPrevData()
    const fs = await import('fs')
    const readline = await import('readline')

    const fileStream = fs.createReadStream(filePath)
    const rl = await readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    })

    const names: {
      firstname: string
      lastname: string
      gender: 'M' | 'F'
      countryIso: string
    }[] = []
    for await (const line of rl) {
      if (this.isMaxNamesReached()) break

      const lineInJson = await this.transformLineToJson(line)
      const isJsonValid = await this.checkJson(lineInJson)
      if (!isJsonValid) continue
      //@ts-ignore
      if (this.isMaxOfThisGenderReached(lineInJson.gender)) continue
      //@ts-ignore
      this.incrementGenderCount(lineInJson.gender)
      //@ts-ignore
      names.push(lineInJson)
    }

    return JSON.stringify(names)
  }

  private resetPrevData() {
    this.nbOfMale = 0
    this.nbOfFemale = 0
  }

  private isMaxNamesReached() {
    return this.isMaxOfThisGenderReached('M') && this.isMaxOfThisGenderReached('F')
  }

  private isMaxOfThisGenderReached(gender: 'M' | 'F') {
    if (gender === 'M') {
      return this.nbOfMale > 500
    } else {
      return this.nbOfFemale > 500
    }
  }

  private async transformLineToJson(line: string) {
    const [firstname, lastname, gender, countryIso] = line.split(',') as [
      string,
      string,
      'M' | 'F' | '',
      string
    ]
    return { firstname, lastname, gender, countryIso }
  }

  private async checkJson({
    firstname,
    lastname,
    gender,
    countryIso,
  }: {
    firstname: string
    lastname: string
    gender: 'M' | 'F' | ''
    countryIso: string
  }) {
    const isFirstnameValid = this.checkName(firstname)
    const isLastnameValid = this.checkName(lastname)
    const isGenderValid = this.checkGender(gender)
    const iscountryIsoValid = await this.checkCountryIso(countryIso)

    return isFirstnameValid && isLastnameValid && isGenderValid && iscountryIsoValid
  }

  private checkName(name: string) {
    const namesPart = name.split(' ')
    for (const namePart of namesPart) {
      if (!namePart) return false
      if (namePart.length < 2) return false
      if (!this.onlyLatinCharacters(namePart)) return false
    }
    return true
  }

  private onlyLatinCharacters(str: string) {
    return /^[a-zA-Z]+$/.test(str)
  }

  private checkGender(gender: string) {
    return gender === 'M' || gender === 'F'
  }

  private async checkCountryIso(iso: string) {
    const isoList = await this.getIsoList()
    return isoList[iso] ? true : false
  }

  private async getIsoList() {
    this.countriesIso =
      this.countriesIso ?? (await import(this.seedDirectory + '/countryByInitial.json'))
    return this.countriesIso
  }

  private incrementGenderCount(gender: 'M' | 'F') {
    if (gender === 'M') this.nbOfMale++
    else this.nbOfFemale++
  }

  private async saveInJson(filePath: string, json: string) {
    const fs = await import('fs')
    const directoryParentPath = await this.getDirectoryParentPath()
    const directoryOFConvertedFilesPath = directoryParentPath + '/namesByCountryAndGenderInJSON'
    const fileName = this.getFileName(filePath)
    const filePathToSave = directoryOFConvertedFilesPath + '/' + fileName

    fs.writeFileSync(filePathToSave, json)
    return `${fileName} saved successfully`
  }

  private getFileName(fileName) {
    const fileNameParts = fileName.split('/')
    const endName = fileNameParts[fileNameParts.length - 1].split('.')[0]
    return endName + '.json'
  }
}
