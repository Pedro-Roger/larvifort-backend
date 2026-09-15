import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTeamId = await knex.schema.hasColumn('Projeto', 'teamId');
  if (!hasTeamId) {
    await knex.schema.alterTable('Projeto', (table) => {
      table.text('teamId').nullable();
      table.foreign('teamId').references('Team.id').onDelete('SET NULL');
      table.index(['teamId']);
    });
  }

  const hasResponsibleId = await knex.schema.hasColumn('Projeto', 'responsibleId');
  if (!hasResponsibleId) {
    await knex.schema.alterTable('Projeto', (table) => {
      table.text('responsibleId').nullable();
      table.foreign('responsibleId').references('User.id').onDelete('SET NULL');
      table.index(['responsibleId']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('Projeto', (table) => {
    table.dropColumn('responsibleId');
    table.dropColumn('teamId');
  });
}
