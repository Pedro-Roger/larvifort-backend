import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('TaskAttachment', (table) => {
    table.uuid('id').primary();
    // Task identifiers are text in existing installations (UUID values are
    // serialized by the API), so keep this column compatible across schemas.
    table.text('taskId').notNullable();
    table.string('filename').notNullable();
    table.string('path').notNullable();
    table.string('mimeType').notNullable();
    table.integer('size').notNullable();
    table.timestamp('createdAt').defaultTo(knex.fn.now());

    table.index('taskId');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('TaskAttachment');
}
