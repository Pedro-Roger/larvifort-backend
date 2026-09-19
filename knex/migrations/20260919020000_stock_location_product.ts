import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasColumn('StockLocation', 'productId'))) {
    await knex.schema.alterTable('StockLocation', (table) => {
      table.text('productId').nullable();
      table.index('productId');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  if (await knex.schema.hasColumn('StockLocation', 'productId')) {
    await knex.schema.alterTable('StockLocation', (table) => table.dropColumn('productId'));
  }
}
