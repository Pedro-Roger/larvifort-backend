import type { Knex } from 'knex';

// API-017 — Stock inventario: niveles, movimientos y reservas.
// No se declaran FK estrictas para evitar fallos de cadena de migraciones;
// las referencias a Product/StockLocation/Order se modelan como texto con índices.
export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('StockLevel'))) {
    await knex.schema.createTable('StockLevel', (table) => {
      table.text('productId').notNullable();
      table.text('stockLocationId').notNullable();
      table.float('quantity').notNullable().defaultTo(0);
      table.float('reserved').notNullable().defaultTo(0);
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
      table.primary(['productId', 'stockLocationId']);
    });
  }

  if (!(await knex.schema.hasTable('StockMovement'))) {
    await knex.schema.createTable('StockMovement', (table) => {
      table.text('id').primary();
      table.text('productId').notNullable();
      table.text('stockLocationId').notNullable();
      table.text('type').notNullable();
      table.float('quantity').notNullable();
      table.text('reason').nullable();
      table.text('responsibleId').nullable();
      table.text('orderId').nullable();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
    });
  }

  if (!(await knex.schema.hasTable('StockReservation'))) {
    await knex.schema.createTable('StockReservation', (table) => {
      table.text('id').primary();
      table.text('productId').notNullable();
      table.text('stockLocationId').notNullable();
      table.text('orderId').nullable();
      table.float('quantity').notNullable();
      table.text('status').notNullable().defaultTo('ACTIVA');
      table.text('responsibleId').nullable();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('cancelledAt').nullable();
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('StockReservation');
  await knex.schema.dropTableIfExists('StockMovement');
  await knex.schema.dropTableIfExists('StockLevel');
}