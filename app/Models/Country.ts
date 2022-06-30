import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import MaleName from 'App/Models/MaleName'
import FemaleName from 'App/Models/FemaleName'

export default class Country extends BaseModel {
  @column({ isPrimary: true })
  public code: string

  @column()
  public nameEn: string

  @column()
  public nameFr: string

  @hasMany(() => MaleName)
  public maleNames: HasMany<typeof MaleName>

  @hasMany(() => FemaleName)
  public femaleNames: HasMany<typeof FemaleName>
}
