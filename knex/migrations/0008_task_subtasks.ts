import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasParentId = await knex.schema.hasColumn('Task', 'parentId');
  if (!hasParentId) {
    await knex.schema.alterTable('Task', (table) => {
      table.text('parentId').nullable();
      table
        .foreign('parentId')
        .references('Task.id')
        .onDelete('CASCADE');
      table.index(['parentId']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasParentId = await knex.schema.hasColumn('Task', 'parentId');
  if (hasParentId) {
    await knex.schema.alterTable('Task', (table) => {
      table.dropColumn('parentId');
    });
  }
}
