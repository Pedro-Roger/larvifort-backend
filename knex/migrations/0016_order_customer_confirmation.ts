import type { Knex } from 'knex';

// API-020 — Confirmação del cliente, historial de cambios y automação de cierre.
export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasColumn('Order', 'customerConfirmedBy'))) {
    await knex.schema.alterTable('Order', (table) => {
      table.text('customerConfirmedBy').nullable();
    });
  }
  if (!(await knex.schema.hasColumn('Order', 'customerConfirmedAt'))) {
    await knex.schema.alterTable('Order', (table) => {
      table.timestamp('customerConfirmedAt').nullable();
    });
  }
  if (!(await knex.schema.hasColumn('Order', 'customerConfirmationNote'))) {
    await knex.schema.alterTable('Order', (table) => {
      table.text('customerConfirmationNote').nullable();
    });
  }

  if (!(await knex.schema.hasTable('OrderCustomerEvent'))) {
    await knex.schema.createTable('OrderCustomerEvent', (table) => {
      table.text('id').primary();
      table.text('orderId').notNullable();
      table.text('type').notNullable();
      table.text('note').nullable();
      table.text('createdById').nullable();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('OrderCustomerEvent');
  await knex.schema.alterTable('Order', (table) => {
    table.dropColumn('customerConfirmationNote');
    table.dropColumn('customerConfirmedAt');
    table.dropColumn('customerConfirmedBy');
  });
}