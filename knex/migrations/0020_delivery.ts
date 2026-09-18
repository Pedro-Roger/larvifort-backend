import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('Delivery', (table) => {
    table.text('id').primary();
    table.text('orderId').unique().notNullable().references('id').inTable('Order').onDelete('CASCADE');
    table.text('driverId').nullable().references('id').inTable('Driver').onDelete('SET NULL');
    table.text('vehicleId').nullable().references('id').inTable('Vehicle').onDelete('SET NULL');
    table.text('status').notNullable().defaultTo('AGUARDANDO_MOTORISTA');
    table.timestamp('predictedAt').nullable();
    table.timestamp('completedAt').nullable();
    table.text('proofUrl').nullable();
    table.text('notes').nullable();
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('Delivery');
}
