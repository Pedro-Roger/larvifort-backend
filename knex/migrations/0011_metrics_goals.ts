import type { Knex } from 'knex';
export async function up(knex: Knex): Promise<void> {
  const teamIdType = (await knex('Team').columnInfo()).id.type;
  const userIdType = (await knex('User').columnInfo()).id.type;
  await knex.schema.createTable('MetricGoal', (table) => {
    table.text('id').primary();
    table.text('name').notNullable();
    table
      .specificType('teamId', teamIdType)
      .notNullable()
      .references('id')
      .inTable('Team')
      .onDelete('CASCADE');
    table.specificType('userIds', 'text[]').notNullable();
    table.text('type').notNullable();
    table.text('period').notNullable();
    table.double('target').notNullable();
    table.text('startDate').notNullable();
    table.text('endDate').notNullable();
    table
      .specificType('createdBy', userIdType)
      .notNullable()
      .references('id')
      .inTable('User')
      .onDelete('CASCADE');
    table
      .timestamp('createdAt', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp('updatedAt', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table.index(['teamId']);
  });
}
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('MetricGoal');
}
