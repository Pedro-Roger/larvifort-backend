import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasColumn('Projeto', 'taskPrefix'))) {
    await knex.schema.alterTable('Projeto', (table) => {
      table.text('taskPrefix').notNullable().defaultTo('TK');
      table.integer('taskSequence').notNullable().defaultTo(-1);
    });
  }
  if (!(await knex.schema.hasColumn('Task', 'referenceNumber'))) {
    await knex.schema.alterTable('Task', (table) => {
      table.integer('referenceNumber').nullable();
      table.text('referenceCode').nullable();
      table.index(['projetoId', 'referenceNumber'], 'Task_projetoId_referenceNumber_idx');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('Task', (table) => {
    table.dropIndex(['projetoId', 'referenceNumber'], 'Task_projetoId_referenceNumber_idx');
    table.dropColumn('referenceCode');
    table.dropColumn('referenceNumber');
  });
  await knex.schema.alterTable('Projeto', (table) => {
    table.dropColumn('taskSequence');
    table.dropColumn('taskPrefix');
  });
}
