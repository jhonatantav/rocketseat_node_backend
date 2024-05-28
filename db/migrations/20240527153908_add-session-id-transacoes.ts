import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('transacoes', (table) => {
    table.uuid('session_id').after('id')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('transacoes', (table) => {
    table.dropColumn('session_id')
  })
}
