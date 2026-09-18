import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('Order', (table) => {
    table.text('fiscalStatus').notNullable().defaultTo('NAO_SOLICITADO');
    table.jsonb('fiscalData').nullable().defaultTo('{}');
    table.text('fiscalNotes').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('Order', (table) => {
    table.dropColumn('fiscalStatus');
    table.dropColumn('fiscalData');
    table.dropColumn('fiscalNotes');
  });
}
