import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'countries'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('code', 2).primary()
      table.string('name_en', 30).unique().notNullable()
      table.string('name_fr', 30).unique().notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
