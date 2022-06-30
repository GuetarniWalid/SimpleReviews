import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Country from 'App/Models/Country'

export default class MaleName extends BaseModel {
  public static table = 'male_names'

  @column({ isPrimary: true, serializeAs: null })
  public id: number

  @column({ serializeAs: null })
  public countryCode: string

  @column()
  public firstname: string

  @column()
  public lastname: string

  @belongsTo(() => Country)
  public country: BelongsTo<typeof Country>
}
