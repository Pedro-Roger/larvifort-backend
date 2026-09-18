import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('Product');
  if (!hasTable) {
    await knex.schema.createTable('Product', (table) => {
      table.text('id').primary();
      table.text('code').notNullable().unique();
      table.text('name').notNullable();
      table.text('unit').notNullable().defaultTo('UN');
      table.float('price').nullable();
      table.boolean('isActive').notNullable().defaultTo(true);
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('Product');
}
