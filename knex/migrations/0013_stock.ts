import type { Knex } from 'knex';

// API-016 — Stock: unidades produtivas y locais/berçários.
export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('StockUnit'))) {
    await knex.schema.createTable('StockUnit', (table) => {
      table.text('id').primary();
      table.text('name').notNullable().unique();
      table.text('city').nullable();
      table.text('status').notNullable().defaultTo('ACTIVA');
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
  }

  if (!(await knex.schema.hasTable('StockLocation'))) {
    await knex.schema.createTable('StockLocation', (table) => {
      table.text('id').primary();
      table.text('name').notNullable();
      table.text('unitId').notNullable();
      table.text('type').notNullable().defaultTo('BERCARIO');
      table.float('capacity').nullable();
      table.text('status').notNullable().defaultTo('ACTIVA');
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
      table.unique(['unitId', 'name']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('StockLocation');
  await knex.schema.dropTableIfExists('StockUnit');
}