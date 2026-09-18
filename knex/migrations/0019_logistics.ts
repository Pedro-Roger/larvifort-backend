import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('Driver', (table) => {
    table.text('id').primary();
    table.text('name').notNullable();
    table.text('phone').nullable();
    table.text('document').nullable();
    table.text('status').notNullable().defaultTo('DISPONIVEL');
    table.text('region').nullable();
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('Vehicle', (table) => {
    table.text('id').primary();
    table.text('plate').unique().notNullable();
    table.text('status').notNullable().defaultTo('DISPONIVEL');
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('Vehicle');
  await knex.schema.dropTableIfExists('Driver');
}
