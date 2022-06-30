import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'female_names'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary().unsigned().nullable()
      table.string('country_code', 2).references('code').inTable('countries')
      table.string('firstname', 50).notNullable()
      table.string('lastname', 50).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
