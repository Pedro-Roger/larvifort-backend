import type { Knex } from 'knex';

// API-018 — Pedido operacional: status operacional detallado, campos fiscales/
// pago/entrega y auditoría de cierre.
export async function up(knex: Knex): Promise<void> {
  const hasOperational = await knex.schema.hasColumn(
    'Order',
    'operationalStatus',
  );
  if (!hasOperational) {
    await knex.schema.alterTable('Order', (table) => {
      table
        .text('operationalStatus')
        .notNullable()
        .defaultTo('RASCUNHO');
    });
  }

  const hasPaymentDate = await knex.schema.hasColumn('Order', 'paymentDate');
  if (!hasPaymentDate) {
    await knex.schema.alterTable('Order', (table) => {
      table.timestamp('paymentDate').nullable();
    });
  }

  const hasDeliveryShift = await knex.schema.hasColumn('Order', 'deliveryShift');
  if (!hasDeliveryShift) {
    await knex.schema.alterTable('Order', (table) => {
      table.text('deliveryShift').nullable();
    });
  }

  const hasClosedAt = await knex.schema.hasColumn('Order', 'closedAt');
  if (!hasClosedAt) {
    await knex.schema.alterTable('Order', (table) => {
      table.timestamp('closedAt').nullable();
    });
  }

  const hasClosedBy = await knex.schema.hasColumn('Order', 'closedBy');
  if (!hasClosedBy) {
    await knex.schema.alterTable('Order', (table) => {
      table.text('closedBy').nullable();
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('Order', (table) => {
    table.dropColumn('closedBy');
    table.dropColumn('closedAt');
    table.dropColumn('deliveryShift');
    table.dropColumn('paymentDate');
    table.dropColumn('operationalStatus');
  });
}