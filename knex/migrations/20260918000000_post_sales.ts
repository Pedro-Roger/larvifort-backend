import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('PostSale', (table) => {
    table.uuid('id').primary();
    table.uuid('orderId').notNullable().unique().references('id').inTable('Order').onDelete('CASCADE');
    table.uuid('deliveryId').notNullable().unique().references('id').inTable('Delivery').onDelete('CASCADE');
    table.uuid('clientId').notNullable().references('id').inTable('Cliente').onDelete('CASCADE');
    table.string('status').notNullable().defaultTo('AGUARDANDO_CONTATO');
    table.text('notes');
    table.text('nextAction');
    table.uuid('responsibleId').nullable().references('id').inTable('User').onDelete('SET NULL');
    table.timestamp('contactedAt').nullable();
    table.timestamp('completedAt').nullable();
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now());
    table.index('status');
    table.index('clientId');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('PostSale');
}
