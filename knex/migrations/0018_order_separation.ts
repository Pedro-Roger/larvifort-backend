import type { Knex } from 'knex';

// API-022: Separação e conferência do pedido.
export async function up(knex: Knex): Promise<void> {
  if (!(await knex.raw(`SELECT 1 FROM pg_type WHERE typname = 'SeparationStatus'`)).rows.length) {
    await knex.raw(
      `CREATE TYPE "SeparationStatus" AS ENUM ('AGUARDANDO_SEPARACAO', 'EM_SEPARACAO', 'SEPARADO', 'DIVERGENCIA')`,
    );
  }

  await knex.schema.createTable('OrderSeparation', (table) => {
    table.text('id').primary();
    table.text('orderId').unique().notNullable().references('id').inTable('Order').onDelete('CASCADE');
    table
      .specificType('status', 'SeparationStatus')
      .notNullable()
      .defaultTo('AGUARDANDO_SEPARACAO');
    table.timestamp('startedAt').nullable();
    table.text('startedBy').nullable();
    table.timestamp('completedAt').nullable();
    table.text('completedBy').nullable();
    table.text('divergenceNote').nullable();
    table.timestamp('divergenceAt').nullable();
    table.text('divergenceBy').nullable();
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
    table.timestamp('createdAt').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('OrderSeparation');
  await knex.raw(`DROP TYPE IF EXISTS "SeparationStatus"`);
}
