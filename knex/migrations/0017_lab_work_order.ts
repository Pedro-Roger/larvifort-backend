import type { Knex } from 'knex';

// API-021 — Laboratório: OS/tarea operacional generada a partir de pedido fechado.
export async function up(knex: Knex): Promise<void> {
  const typeExists = async (typeName: string): Promise<boolean> => {
    const result = await knex.raw<{ rows: Array<{ exists: boolean }> }>(
      `SELECT EXISTS (
         SELECT 1
         FROM pg_type
         WHERE typnamespace = 'public'::regnamespace
           AND typname = ?
       ) AS exists`,
      [typeName.replace(/"/g, '')],
    );
    return result.rows[0]?.exists ?? false;
  };

  // Adiciona AGUARDANDO_SEPARACAO ao enum operacional do pedido.
  const op = await typeExists('"OrderOperationalStatus"');
  if (op) {
    await knex.raw(
      `ALTER TYPE "OrderOperationalStatus" ADD VALUE IF NOT EXISTS 'AGUARDANDO_SEPARACAO'`,
    );
  }

  // Cria o enum + tabela de OS de laboratório.
  if (!(await typeExists('"LabWorkOrderStatus"'))) {
    await knex.raw(
      `CREATE TYPE "LabWorkOrderStatus" AS ENUM ('AGUARDANDO_LABORATORIO', 'RECEBIDO', 'EM_PREPARACAO', 'PRONTO_PARA_SEPARACAO', 'BLOQUEADO', 'CANCELADO')`,
    );
  }

  if (!(await knex.schema.hasTable('LabWorkOrder'))) {
    await knex.schema.createTable('LabWorkOrder', (table) => {
      table.text('id').primary();
      table.text('orderId').notNullable();
      table.text('orderNumber').nullable();
      table.text('clientName').nullable();
      table.text('productId').nullable();
      table.text('productName').notNullable();
      table.float('quantity').notNullable();
      table.text('unit').notNullable().defaultTo('MILHEIRO');
      table.text('stockUnitId').nullable();
      table.text('stockUnitName').nullable();
      table.text('stockLocationId').nullable();
      table.text('stockLocationName').nullable();
      table.timestamp('deliveryDate').nullable();
      table
        .specificType('status', 'LabWorkOrderStatus')
        .notNullable()
        .defaultTo('AGUARDANDO_LABORATORIO');
      table.text('statusChangedBy').nullable();
      table.timestamp('statusChangedAt').nullable();
      table.text('createdById').nullable();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());

      table.index(['orderId']);
      table.index(['status']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('LabWorkOrder');
  await knex.raw(`DROP TYPE IF EXISTS "LabWorkOrderStatus"`);
}
