import type { Knex } from 'knex';

function uuidPk(t: Knex.CreateTableBuilder, knex: Knex): void {
  t.uuid('id').primary().defaultTo(knex.fn.uuid());
}

function timestamps(t: Knex.CreateTableBuilder, knex: Knex): void {
  t.timestamp('createdAt', { useTz: true })
    .notNullable()
    .defaultTo(knex.fn.now());
  t.timestamp('updatedAt', { useTz: true })
    .notNullable()
    .defaultTo(knex.fn.now());
}

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTableIfNotExists('ProjetoColumn', (t) => {
    uuidPk(t, knex);
    t.uuid('projetoId').notNullable();
    t.foreign('projetoId').references('Projeto.id').onDelete('CASCADE');
    t.text('title').notNullable();
    t.integer('order').notNullable().defaultTo(0);
    t.text('color').nullable();
    timestamps(t, knex);
    t.index(['projetoId', 'order']);
  });

  const hasColumnId = await knex.schema.hasColumn('Task', 'columnId');
  if (!hasColumnId) {
    await knex.schema.alterTable('Task', (t) => {
      t.uuid('columnId').nullable();
      t.foreign('columnId').references('ProjetoColumn.id').onDelete('SET NULL');
      t.index(['columnId']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasColumnId = await knex.schema.hasColumn('Task', 'columnId');
  if (hasColumnId) {
    await knex.schema.alterTable('Task', (t) => {
      t.dropColumn('columnId');
    });
  }
  await knex.schema.dropTableIfExists('ProjetoColumn');
}
